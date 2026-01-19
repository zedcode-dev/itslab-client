// ============================================================================
// SRC/COMPONENTS/PROTECTED-ROUTE.TSX - Route Protection HOC (Fixed Hydration)
// ============================================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'student' | 'instructor' | 'admin'>;
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for hydration before making decisions
    if (!_hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, user, allowedRoles, router, _hasHydrated]);

  // Show loading while hydrating
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}