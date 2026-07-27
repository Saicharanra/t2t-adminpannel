"use client";

import { Users, Trash2, Package, Leaf } from "lucide-react";
import { KpiCard } from "@/components/shared/kpi-card";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Handcrafted Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[48px] font-bold tracking-tight text-[#111111] leading-none">
            Dashboard
          </h1>
          <p className="mt-2 text-[14px] text-[#6B7280]">
            Live overview of the Trash2Treasure ecosystem.
          </p>
        </div>
        {/* Green Live Badge */}
        <div className="flex items-center gap-2 rounded-full border border-[#ECECEC] bg-white px-4 py-1.5 self-start sm:self-center shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]"></span>
          </span>
          <span className="text-[12px] font-bold text-[#4F772D] tracking-wider uppercase">
            Live Monitoring
          </span>
        </div>
      </div>

      {/* KPI Cards Grid - exactly 4 cards per row, gap 24px */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Users"
          value="0"
          description="No activity yet"
          icon={<Users size={20} />}
        />
        <KpiCard
          title="Waste Submitted"
          value="0 kg"
          description="No activity yet"
          icon={<Trash2 size={20} />}
        />
        <KpiCard
          title="Bins Active"
          value="0"
          description="No activity yet"
          icon={<Package size={20} />}
        />
        <KpiCard
          title="Carbon Saved"
          value="0 kg"
          description="No activity yet"
          icon={<Leaf size={20} />}
        />
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
