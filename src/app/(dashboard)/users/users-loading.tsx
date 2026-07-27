export function UsersLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-32 bg-[var(--t2t-surface)] rounded"></div>
          <div className="mt-2 h-4 w-48 bg-[var(--t2t-surface)] rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-[var(--t2t-surface)] rounded-lg"></div>
          <div className="h-10 w-28 bg-[var(--t2t-surface)] rounded-lg"></div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6"
          >
            <div className="h-4 w-20 bg-[var(--t2t-bg)] rounded"></div>
            <div className="mt-2 h-8 w-16 bg-[var(--t2t-bg)] rounded"></div>
            <div className="mt-2 h-3 w-24 bg-[var(--t2t-bg)] rounded"></div>
          </div>
        ))}
      </div>

      {/* Search and Filters Skeleton */}
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-[var(--t2t-surface)] rounded-lg"></div>
        <div className="h-10 w-32 bg-[var(--t2t-surface)] rounded-lg"></div>
        <div className="h-10 w-32 bg-[var(--t2t-surface)] rounded-lg"></div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] overflow-hidden">
        <div className="p-4 border-b border-[var(--t2t-border)]">
          <div className="h-4 w-full bg-[var(--t2t-bg)] rounded"></div>
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 border-b border-[var(--t2t-border)]">
            <div className="h-4 w-full bg-[var(--t2t-bg)] rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
