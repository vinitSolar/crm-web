export function DashboardPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your CRM dashboard.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-background border border-border">
                    <h3 className="font-semibold">Customers</h3>
                    <p className="text-2xl font-bold">1,234</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border">
                    <h3 className="font-semibold">Active Rates</h3>
                    <p className="text-2xl font-bold">56</p>
                </div>
                <div className="p-4 rounded-lg bg-background border border-border">
                    <h3 className="font-semibold">Users</h3>
                    <p className="text-2xl font-bold">12</p>
                </div>
            </div>
        </div>
    );
}
