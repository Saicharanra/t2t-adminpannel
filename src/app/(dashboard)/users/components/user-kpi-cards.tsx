"use client";

import { Users, UserCheck, UserPlus, Calendar } from "lucide-react";
import { motion } from "framer-motion";

interface UserKPICardsProps {
  stats: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    newToday: number;
  };
}

export function UserKPICards({ stats }: UserKPICardsProps) {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "All registered users",
      icon: Users,
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      description: `${((stats.activeUsers / (stats.totalUsers || 1)) * 100).toFixed(1)}% of total`,
      icon: UserCheck,
    },
    {
      title: "Verified Users",
      value: stats.verifiedUsers.toLocaleString(),
      description: `${((stats.verifiedUsers / (stats.totalUsers || 1)) * 100).toFixed(1)}% verified`,
      icon: UserCheck,
    },
    {
      title: "New Today",
      value: stats.newToday.toLocaleString(),
      description: "Registered today",
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 transition-all hover:shadow-[var(--t2t-shadow-md)]"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[13px] font-semibold text-[var(--t2t-text-secondary)]">
                {card.title}
              </span>
              <div className="text-[28px] font-bold tracking-tight leading-none text-[var(--t2t-text)]">
                {card.value}
              </div>
            </div>
            <div className="text-[#14EF10] shrink-0 opacity-90">
              <card.icon size={20} />
            </div>
          </div>
          {card.description && (
            <div className="mt-3 text-[12px] text-[var(--t2t-text-secondary)]">
              {card.description}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
