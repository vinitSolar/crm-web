import { useState, useRef, useEffect } from 'react';
import { useThemeStore } from '@/stores/useThemeStore';
import { SunIcon, MoonIcon, MonitorIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

const Portal = ({ children }: { children: React.ReactNode }) => {
    if (typeof document === 'undefined') return null;
    return createPortal(children, document.body);
};


export function ThemeToggle() {
    const { theme, setTheme } = useThemeStore();
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
        setIsOpen(false);
    };

    const getIcon = () => {
        switch (theme) {
            case 'light':
                return <SunIcon size={20} />;
            case 'dark':
                return <MoonIcon size={20} />;
            case 'system':
                return <MonitorIcon size={20} />;
            default:
                return <SunIcon size={20} />;
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                title="Toggle theme"
            >
                {getIcon()}
                <span className="sr-only">Toggle theme</span>
            </button>

            {isOpen && (
                <Portal>
                    <div
                        ref={dropdownRef}
                        style={{
                            position: 'fixed',
                            top: (buttonRef.current?.getBoundingClientRect().bottom || 0) + 8,
                            left: (buttonRef.current?.getBoundingClientRect().left || 0) - 80, // Adjust left to align dropdown
                            zIndex: 9999
                        }}
                        className="w-32 bg-popover text-popover-foreground rounded-md border border-border shadow-md animate-in fade-in zoom-in-95 duration-200"
                    >
                        <div className="p-1 flex flex-col gap-0.5">
                            <button
                                onClick={() => handleThemeChange('light')}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors w-full text-left",
                                    theme === 'light' ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <SunIcon size={16} />
                                <span>Light</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('dark')}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors w-full text-left",
                                    theme === 'dark' ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <MoonIcon size={16} />
                                <span>Dark</span>
                            </button>
                            <button
                                onClick={() => handleThemeChange('system')}
                                className={cn(
                                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm transition-colors w-full text-left",
                                    theme === 'system' ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                <MonitorIcon size={16} />
                                <span>System</span>
                            </button>
                        </div>
                    </div>
                </Portal>
            )}
        </div>
    );
}
