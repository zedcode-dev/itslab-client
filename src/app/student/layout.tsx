// ============================================================================
// SRC/APP/STUDENT/LAYOUT.TSX - Student Layout (Simplified)
// ============================================================================

'use client';

import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { usePathname } from 'next/navigation';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isCheckoutPage = pathname?.includes('/checkout/');
  const isLearnPage = pathname?.includes('/learn');
  const hideShell = isCheckoutPage || isLearnPage;

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <DashboardLayout allowedRoles={['student']}>
      {children}
    </DashboardLayout>
  );
}