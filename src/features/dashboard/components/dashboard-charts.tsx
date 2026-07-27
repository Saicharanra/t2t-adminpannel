"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { ChartLine, ChartBar } from "@phosphor-icons/react";

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Collection Trends */}
      <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 text-white transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <ChartLine className="text-[#5CE65C]" size={18} />
              Collection Trends
            </h3>
            <p className="text-[12px] text-neutral-500">
              Daily volume of waste collections over time
            </p>
          </div>
        </div>
        <div className="mt-6 flex h-[280px] items-center justify-center">
          <EmptyState
            icon={<ChartLine size={28} className="text-neutral-500" />}
            title="No activity yet"
            description="Visual trend graphs of waste submissions will load once collections start."
            className="border-0 bg-transparent py-0"
          />
        </div>
      </div>

      {/* 2. User Growth */}
      <div className="rounded border border-[#1a1a1a] bg-[#0a0a0a] p-6 text-white transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-[15px] font-semibold text-white flex items-center gap-2">
              <ChartBar className="text-[#5CE65C]" size={18} />
              User Growth
            </h3>
            <p className="text-[12px] text-neutral-500">
              Cumulative count of registered accounts
            </p>
          </div>
        </div>
        <div className="mt-6 flex h-[280px] items-center justify-center">
          <EmptyState
            icon={<ChartBar size={28} className="text-neutral-500" />}
            title="No activity yet"
            description="User registration trend metrics will populate automatically."
            className="border-0 bg-transparent py-0"
          />
        </div>
      </div>
    </div>
  );
}
