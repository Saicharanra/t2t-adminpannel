"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ActivityIcon } from "@phosphor-icons/react";

export function RecentActivity() {
  return (
    <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 text-white transition-all duration-200">
      <h3 className="text-[15px] font-semibold text-white">
        Recent Activity
      </h3>
      <p className="text-[12px] text-neutral-500">
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
