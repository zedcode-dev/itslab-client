// ============================================================================
// SRC/APP/ADMIN/LAYOUT.TSX - Admin Layout (Simplified)
// ============================================================================

'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardLayout allowedRoles={['admin']}>
            {children}
        </DashboardLayout>
    );
}