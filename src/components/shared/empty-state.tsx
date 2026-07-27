"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col items-center justify-center rounded border border-dashed border-[#1a1a1a] bg-transparent px-6 py-12 text-white",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded bg-[#111111] border border-[#222222] text-neutral-400">
        {icon}
      </div>
      <h3 className="mt-4 text-[14px] font-semibold text-white tracking-tight">
        {title}
      </h3>
      <p className="mt-1.5 max-w-xs text-center text-[12px] text-neutral-500 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
