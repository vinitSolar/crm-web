import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { toast } from 'react-toastify';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/stores/useAuthStore';
import { LOGIN } from '@/graphql';
import logo from '@/assets/main-logo-dark-1.png';
import loginBg from '@/assets/loginbg.png';

// Default tenant - can be configured via env or made dynamic

interface LoginResponse {
    login: {
        accessToken: string;
        refreshToken: string;
        message?: string;
    };
}

interface LoginInput {
    email: string;
    password: string;
    tenant?: string;
}

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({ email: '', password: '' });

    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const [loginMutation, { loading: isLoading }] = useMutation<
        LoginResponse,
        { input: LoginInput }
    >(LOGIN, {
        onCompleted: async (data) => {
            const { accessToken, refreshToken, message } = data.login;

            if (message) {
                toast.success(message);
            }

            // Login stores tokens and fetches user data automatically
            await login(accessToken, refreshToken);
            navigate(from, { replace: true });
        },
        onError: (err: any) => {

            let errorMessage = '';

            // 1. Check direct GraphQLErrors
            if (err.graphQLErrors && err.graphQLErrors.length > 0) {
                errorMessage = err.graphQLErrors[0].message;
            }

            // 2. Check Network Error details
            if (!errorMessage && err.networkError) {
                const netErr = err.networkError as any;

                // Check for Apollo 'result' property (ServerParseError or similar)
                if (netErr.result && netErr.result.errors && Array.isArray(netErr.result.errors) && netErr.result.errors.length > 0) {
                    errorMessage = netErr.result.errors[0].message;
                }

                // Check for Axios 'response' data (if using axios-based link)
                else if (netErr.response && netErr.response.data && netErr.response.data.errors && netErr.response.data.errors.length > 0) {
                    errorMessage = netErr.response.data.errors[0].message;
                }

                // Handle 401 specifically if no message found yet
                else if (netErr.statusCode === 401 || netErr.status === 401 || netErr.response?.status === 401) {
                    errorMessage = 'Invalid email or password';
                }
            }

            // 3. Fallback
            if (!errorMessage) {
                // If the error message is just technical "Request failed...", show generic
                if (err.message && err.message.includes('Request failed with status code')) {
                    errorMessage = 'Invalid email or password';
                } else {
                    errorMessage = err.message || 'Invalid email or password';
                }
            }

            toast.error(errorMessage);
        },
    });

    const validateForm = () => {
        let isValid = true;
        const errors = { email: '', password: '' };

        if (!email) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!password) {
            errors.password = 'Password is required';
            isValid = false;
        }

        setFormErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        loginMutation({
            variables: {
                input: {
                    email,
                    password,
                },
            },
        });
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Background Image */}
            <div className="hidden lg:block lg:w-3/5 relative overflow-hidden">
                <img
                    src={loginBg}
                    alt=""
                    className="w-full h-full object-cover object-left"
                />
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-2/5 flex flex-col items-center justify-center p-8 bg-background relative">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground">Login</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <Input
                            variant="underline"
                            label="Email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                            }}
                            error={formErrors.email}
                            required
                        />

                        <Input
                            variant="underline"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (formErrors.password) setFormErrors(prev => ({ ...prev, password: '' }));
                            }}
                            error={formErrors.password}
                            required
                        />
                        <Button
                            type="submit"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Login
                        </Button>
                    </form>
                </div>

                {/* Powered By - Bottom Center */}
                <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span>POWERED BY</span>
                    <img src={logo} alt="GEE" className="h-4" />
                </div>
            </div>
        </div>
    );
}
