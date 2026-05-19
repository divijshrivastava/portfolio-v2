import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type LoadingSpinnerProps = {
  label?: string;
  className?: string;
};

export function LoadingSpinner({ label = 'Loading', className }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex min-h-[240px] flex-col items-center justify-center gap-3 text-muted-foreground', className)}>
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
