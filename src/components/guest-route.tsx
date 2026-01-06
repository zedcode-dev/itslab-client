// ============================================================================
// SRC/COMPONENTS/GUEST-ROUTE.TSX - Guest Route Protection (e.g. for Login/Register)
// ============================================================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, _hasHydrated } = useAuthStore();
    const router = useRouter();
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (_hasHydrated) {
            if (isAuthenticated && user) {
                // Redirect based on role
                if (user.role === 'student') {
                    router.replace('/student/dashboard');
                } else if (user.role === 'instructor') {
                    router.replace('/instructor/dashboard');
                } else if (user.role === 'admin') {
                    router.replace('/admin/dashboard');
                } else {
                    router.replace('/');
                }
            } else {
                setShouldRender(true);
            }
        }
    }, [isAuthenticated, user, _hasHydrated, router]);

    if (!_hasHydrated || (isAuthenticated && user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!shouldRender) return null;

    return <>{children}</>;
}
