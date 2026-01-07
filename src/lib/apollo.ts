import { ApolloClient, InMemoryCache, ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';
import axios, { AxiosError } from 'axios';
import { getAccessToken } from '@/lib/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

// Shared axios instance for all API requests
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 second timeout
});

// Add auth interceptor
axiosInstance.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Handle 401 - token expired
        if (error.response?.status === 401) {
            // Could trigger token refresh here
            console.warn('Authentication error - token may be expired');
        }
        return Promise.reject(error);
    }
);

// Custom Apollo Link using axios
const axiosLink = new ApolloLink((operation) => {
    return new Observable((observer) => {
        const { query, variables, operationName } = operation;

        axiosInstance
            .post('/graphql', {
                query: print(query),
                variables,
                operationName,
            })
            .then((response) => {
                observer.next(response.data);
                observer.complete();
            })
            .catch((error: AxiosError) => {
                observer.error(error);
            });
    });
});

// Apollo Client instance with optimized cache
export const apolloClient = new ApolloClient({
    link: axiosLink,
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Pagination merge policies
                    customers: {
                        keyArgs: ['search', 'status'],
                        merge(_existing, incoming) {
                            return incoming;
                        },
                    },
                    users: {
                        keyArgs: ['search', 'status'],
                        merge(_existing, incoming) {
                            return incoming;
                        },
                    },
                    ratePlans: {
                        keyArgs: false,
                        merge(_existing, incoming) {
                            return incoming;
                        },
                    },
                },
            },
            // Enable automatic cache ID generation
            Customer: { keyFields: ['uid'] },
            User: { keyFields: ['uid'] },
            RatePlan: { keyFields: ['uid'] },
            RateOffer: { keyFields: ['uid'] },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            nextFetchPolicy: 'cache-first',
        },
        query: {
            fetchPolicy: 'cache-first',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
    // Enable query batching
    queryDeduplication: true,
});

// Export axios instance for non-GraphQL API calls
export const apiAxios = axiosInstance;
