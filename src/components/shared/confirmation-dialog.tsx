"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
}: ConfirmationDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 shadow-lg">
        <div className="flex items-start gap-4">
          {variant !== "default" && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                variant === "danger" &&
                  "bg-[var(--t2t-danger-light)] text-[var(--t2t-danger)]",
                variant === "warning" &&
                  "bg-[var(--t2t-warning-light)] text-[var(--t2t-warning)]"
              )}
            >
              <AlertTriangle size={20} />
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-[var(--t2t-text)]">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-[var(--t2t-text-secondary)]">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-4 py-2 text-sm font-medium text-[var(--t2t-text)] hover:bg-[var(--t2t-bg)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50",
              variant === "danger"
                ? "bg-[var(--t2t-danger)] hover:bg-red-700"
                : variant === "warning"
                  ? "bg-[var(--t2t-warning)] hover:bg-amber-600"
                  : "bg-[var(--t2t-primary)] hover:bg-[var(--t2t-primary-hover)]"
            )}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
