"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { Activity } from "lucide-react";

export function RecentActivity() {
  return (
    <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-7 text-[#111111] shadow-none hover:border-[#6B7280]/20 transition-all duration-200">
      <h3 className="text-[18px] font-semibold text-[#111111]">
        Recent Activity
      </h3>
      <p className="text-[13px] text-[#6B7280]">
        Latest actions across the platform
      </p>
      <div className="mt-4">
        <EmptyState
          icon={<Activity size={24} className="text-[#6B7280]" />}
          title="No activity yet"
          description="Platform activity will be displayed here as admins and users interact with the system."
          className="border-0 bg-transparent py-8"
        />
      </div>
    </div>
  );
}
