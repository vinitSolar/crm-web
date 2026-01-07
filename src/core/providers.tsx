// App-level providers wrapper
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { apolloClient } from '@/lib/apollo';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ApolloProvider client={apolloClient}>
            <BrowserRouter>
                {children}
            </BrowserRouter>
        </ApolloProvider>
    );
}
