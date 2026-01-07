import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export function ServerErrorPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-9xl font-bold text-destructive">500</div>
                <h1 className="text-3xl font-bold text-foreground">Server Error</h1>
                <p className="text-muted-foreground">
                    Oops! Something went wrong on our end. Please try again later.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Try Again
                    </Button>
                    <Button onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
