import { Button } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-9xl font-bold text-muted-foreground">403</div>
                <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
                <p className="text-muted-foreground">
                    You don't have permission to access this page. Please contact your administrator.
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
