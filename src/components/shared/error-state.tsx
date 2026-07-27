"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-[var(--t2t-danger)]/20 bg-[var(--t2t-danger-light)] px-6 py-16",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--t2t-danger)]/10 text-[var(--t2t-danger)]">
        <AlertTriangle size={24} />
      </div>
      <h3 className="mt-4 text-base font-semibold text-[var(--t2t-text)]">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-center text-sm text-[var(--t2t-text-secondary)]">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-4 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-bg)] transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
