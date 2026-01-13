// App-level providers wrapper
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ApolloProvider client={apolloClient}>
            {children}
        </ApolloProvider>
    );
}
