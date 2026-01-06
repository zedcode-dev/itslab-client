// ============================================================================
// SRC/COMPONENTS/UI/PROGRESS.TSX - Progress Bar Component
// ============================================================================

import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  className?: string;
  indicatorClassName?: string;
}

export function Progress({ value, className, indicatorClassName }: ProgressProps) {
  return (
    <div className={cn('h-2 w-full bg-muted rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full bg-primary transition-all duration-500', indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}