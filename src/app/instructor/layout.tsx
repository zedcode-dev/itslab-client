// ============================================================================
// SRC/APP/INSTRUCTOR/LAYOUT.TSX - Instructor Layout (Simplified)
// ============================================================================

'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout allowedRoles={['instructor', 'admin']}>
      {children}
    </DashboardLayout>
  );
}
