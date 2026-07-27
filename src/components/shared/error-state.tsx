"use client";

import { Warning, ArrowClockwise } from "@phosphor-icons/react";
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
        "flex flex-col items-center justify-center rounded border border-white/10 bg-white/5 px-6 py-12",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10 text-white border border-white/30">
        <Warning size={20} />
      </div>
      <h3 className="mt-4 text-[14px] font-semibold text-white">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs text-center text-[12px] text-neutral-400">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-1.5 rounded border border-[#1a1a1a] bg-[#0a0a0a] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#121212] transition-colors"
        >
          <ArrowClockwise size={12} />
          Try again
        </button>
      )}
    </div>
  );
}
