import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-9xl font-bold text-primary">404</div>
                <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
                <p className="text-muted-foreground">
                    Sorry, the page you are looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={() => navigate(-1)} variant="outline">
                        Go Back
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
