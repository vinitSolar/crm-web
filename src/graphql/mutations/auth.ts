// Auth GraphQL Mutations

import { gql } from '@apollo/client';

export const LOGIN = gql`
    mutation Login($input: LoginInput!) {
        login(input: $input) {
            accessToken
            refreshToken
            message
        }
    }
`;

export const LOGOUT = gql`
    mutation Logout {
        logout
    }
`;

export const REFRESH_TOKEN = gql`
    mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
            accessToken
            refreshToken
        }
    }
`;
