"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ActivityIcon } from "@phosphor-icons/react";

export function RecentActivity() {
  return (
    <div className="rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-6 text-[var(--t2t-text)] transition-all duration-200">
      <h3 className="text-[15px] font-semibold text-[var(--t2t-text)]">
        Recent Activity
      </h3>
      <p className="text-[12px] text-[var(--t2t-text-secondary)]">
        Latest actions across the platform
      </p>
      <div className="mt-4">
        <EmptyState
          icon={<ActivityIcon size={24} className="text-neutral-500" />}
          title="No activity yet"
          description="Platform activity will be displayed here as admins and users interact with the system."
          className="border-0 bg-transparent py-8"
        />
      </div>
    </div>
  );
}
