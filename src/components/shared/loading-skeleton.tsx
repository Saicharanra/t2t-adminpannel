import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function Skeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--t2t-border)]",
        className
      )}
    />
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-xs)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-2.5 h-8 w-20" />
          <Skeleton className="mt-3 h-4 w-16" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-7 w-full" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] shadow-[var(--t2t-shadow-xs)]">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[var(--t2t-border)] px-5 py-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="ml-auto h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-[var(--t2t-border)] px-5 py-3.5 last:border-b-0"
        >
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-xs)]">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-1.5 h-3 w-48" />
      <Skeleton className="mt-4 h-56 w-full rounded-lg" />
    </div>
  );
}
