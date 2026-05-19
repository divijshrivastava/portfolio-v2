type LoadingSpinnerProps = {
  label?: string;
};

export function LoadingSpinner({ label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div
      className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
