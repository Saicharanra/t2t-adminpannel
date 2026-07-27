"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({
  title,
  value,
  description,
  icon,
  className,
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -1 }}
      className={cn(
        "relative rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 text-white",
        "transition-all duration-200 ease-out",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[13px] font-semibold text-neutral-400">{title}</span>
          <div className="text-[32px] font-bold tracking-tight leading-none text-white">
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-[#5CE65C] shrink-0 opacity-80">
            {icon}
          </div>
        )}
      </div>

      {description && (
        <div className="mt-3 text-[12px] text-neutral-500">
          {description}
        </div>
      )}
    </motion.div>
  );
}
