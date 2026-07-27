"use client";

import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          {variant !== "default" && (
            <div
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                variant === "danger" &&
                  "bg-red-950/30 text-red-500 border-red-900/30",
                variant === "warning" &&
                  "bg-amber-950/30 text-amber-500 border-amber-900/30"
              )}
            >
              <Warning size={18} />
            </div>
          )}
          <div>
            <h3 className="text-[14px] font-semibold text-white">
              {title}
            </h3>
            <p className="mt-1.5 text-[12px] text-neutral-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded border border-[#1a1a1a] bg-[#0a0a0a] px-3.5 py-1.5 text-[12px] font-medium text-white hover:bg-[#121212] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={cn(
              "rounded px-3.5 py-1.5 text-[12px] font-medium text-white transition-colors disabled:opacity-50",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : variant === "warning"
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-[#f38020] hover:bg-[#ea580c]"
            )}
          >
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
