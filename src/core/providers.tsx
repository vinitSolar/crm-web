// App-level providers wrapper
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { ThemeProvider } from '@/components/common/ThemeProvider';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ThemeProvider>
            <ApolloProvider client={apolloClient}>
                {children}
            </ApolloProvider>
        </ThemeProvider>
    );
}
