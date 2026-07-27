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
        "relative rounded-[16px] border border-[#EAEAEA] bg-[#FFFFFF] p-[28px] text-[#111111]",
        "transition-all duration-200 ease-out",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <span className="text-[15px] font-semibold text-[#6B7280]">{title}</span>
          <div className="text-[44px] font-bold tracking-tight leading-none">
            {value}
          </div>
        </div>
        {icon && (
          <div className="text-[#6B7280] shrink-0">
            {icon}
          </div>
        )}
      </div>

      {description && (
        <div className="mt-4 text-[13px] text-[#6B7280]">
          {description}
        </div>
      )}
    </motion.div>
  );
}
