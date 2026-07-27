"use client";

import { EmptyState } from "@/components/shared/empty-state";
import { LineChart, BarChart3 } from "lucide-react";

export function DashboardCharts() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Collection Trends */}
      <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-7 text-[#111111] shadow-none hover:border-[#6B7280]/20 transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-[18px] font-semibold text-[#111111] flex items-center gap-2">
              <LineChart className="text-[#4F772D]" size={18} />
              Collection Trends
            </h3>
            <p className="text-[13px] text-[#6B7280]">
              Daily volume of waste collections over time
            </p>
          </div>
        </div>
        <div className="mt-6 flex h-[280px] items-center justify-center">
          <EmptyState
            icon={<LineChart size={28} className="text-[#6B7280]" />}
            title="No activity yet"
            description="Visual trend graphs of waste submissions will load once collections start."
            className="border-0 bg-transparent py-0"
          />
        </div>
      </div>

      {/* 2. User Growth */}
      <div className="rounded-[16px] border border-[#EAEAEA] bg-white p-7 text-[#111111] shadow-none hover:border-[#6B7280]/20 transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-[18px] font-semibold text-[#111111] flex items-center gap-2">
              <BarChart3 className="text-[#4F772D]" size={18} />
              User Growth
            </h3>
            <p className="text-[13px] text-[#6B7280]">
              Cumulative count of registered accounts
            </p>
          </div>
        </div>
        <div className="mt-6 flex h-[280px] items-center justify-center">
          <EmptyState
            icon={<BarChart3 size={28} className="text-[#6B7280]" />}
            title="No activity yet"
            description="User registration trend metrics will populate automatically."
            className="border-0 bg-transparent py-0"
          />
        </div>
      </div>
    </div>
  );
}
