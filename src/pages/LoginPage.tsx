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
        onError: (err) => {
            toast.error(err.message || 'Invalid email or password');
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter email and password');
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
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            variant="underline"
                            label="Password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
