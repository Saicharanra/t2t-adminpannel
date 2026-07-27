import { cn } from "@/lib/utils";

type StatusVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral"
  | "primary";

interface StatusBadgeProps {
  variant?: StatusVariant;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success:
    "bg-[var(--t2t-success-light)] text-[var(--t2t-success)] border-[var(--t2t-success)]/15",
  warning:
    "bg-[var(--t2t-warning-light)] text-amber-700 dark:text-amber-400 border-[var(--t2t-warning)]/15",
  danger:
    "bg-[var(--t2t-danger-light)] text-[var(--t2t-danger)] border-[var(--t2t-danger)]/15",
  info: "bg-[var(--t2t-info-light)] text-[var(--t2t-info)] border-[var(--t2t-info)]/15",
  neutral:
    "bg-[var(--t2t-bg)] text-[var(--t2t-text-secondary)] border-[var(--t2t-border)]",
  primary:
    "bg-[var(--t2t-primary-subtle)] text-[var(--t2t-primary)] border-[var(--t2t-primary)]/15",
};

const dotColors: Record<StatusVariant, string> = {
  success: "bg-[var(--t2t-success)]",
  warning: "bg-[var(--t2t-warning)]",
  danger: "bg-[var(--t2t-danger)]",
  info: "bg-[var(--t2t-info)]",
  neutral: "bg-[var(--t2t-text-muted)]",
  primary: "bg-[var(--t2t-primary)]",
};

export function StatusBadge({
  variant = "neutral",
  children,
  dot = true,
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
