import { Skeleton } from './skeleton';

interface PageLoadingStateProps {
  label?: string;
  compact?: boolean;
}

export function PageLoadingState({ label = 'Đang tải dữ liệu', compact = false }: PageLoadingStateProps) {
  return (
    <div
      className={`w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:p-6 ${compact ? 'min-h-40' : 'min-h-[280px]'}`}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <span className="sr-only">{label}</span>
      <div className="space-y-4" aria-hidden="true">
        <Skeleton className="h-6 w-44 rounded-md" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
        <div className="grid gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl sm:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </div>
  );
}
