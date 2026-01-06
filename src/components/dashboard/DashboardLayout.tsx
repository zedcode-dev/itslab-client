// ============================================================================
// SRC/COMPONENTS/DASHBOARD/DASHBOARD-LAYOUT.TSX - Universal Dashboard Shell
// ============================================================================

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './Sidebar';
import { Menu, X, Shield, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function DashboardLayout({ children, allowedRoles }: DashboardLayoutProps) {
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (_hasHydrated) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
                // Redirect to their own dashboard if they hit an unauthorized prefix
                router.push(`/${user.role}/dashboard`);
            }
        }
    }, [isAuthenticated, user, router, _hasHydrated, allowedRoles]);

    if (!_hasHydrated || !isAuthenticated || (allowedRoles && user && !allowedRoles.includes(user.role))) {
        return null;
    }

    const role = user?.role as 'admin' | 'instructor' | 'student';
    const Icon = role === 'admin' ? Shield : GraduationCap;

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-background border-b">
                <Link href={`/${role}/dashboard`} className="flex items-center gap-2 font-bold text-xl">
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        role === 'admin' ? "bg-red-600" : "bg-primary"
                    )}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span>{role === 'admin' ? 'Admin' : 'ITSLab'}</span>
                </Link>
                <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X /> : <Menu />}
                </button>
            </div>

            <div className="flex">
                <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                {/* Overlay */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 lg:ml-0 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
