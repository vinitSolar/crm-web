import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function MainLayout({ children }: { children?: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem('sidebarOpen', JSON.stringify(newState));
    };

    return (
        <div className="h-screen flex bg-background">
            {/* Sidebar - Desktop */}
            <Sidebar isOpen={isSidebarOpen} toggle={toggleSidebar} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <Header isSidebarCollapsed={!isSidebarOpen} />

                {/* Main Content */}
                <main className={cn(
                    "flex-1 overflow-auto p-6 bg-muted/30"
                )}>
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    );
}
