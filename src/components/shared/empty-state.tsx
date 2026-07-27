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
        "flex flex-col items-center justify-center rounded-[16px] border border-dashed border-[#EAEAEA] bg-white px-6 py-12 text-[#111111]",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FAFAFA] text-[#6B7280]">
        {icon}
      </div>
      <h3 className="mt-4 text-[16px] font-semibold text-[#111111] tracking-tight">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-center text-[13px] text-[#6B7280] leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
