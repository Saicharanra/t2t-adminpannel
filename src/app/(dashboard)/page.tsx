"use client";

import { Users, Trash, Archive, Leaf } from "@phosphor-icons/react";
import { KpiCard } from "@/components/shared/kpi-card";
import { DashboardCharts } from "@/features/dashboard/components/dashboard-charts";
import { RecentActivity } from "@/features/dashboard/components/recent-activity";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Handcrafted Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-[var(--t2t-text)] leading-none">
            Dashboard
          </h1>
          <p className="mt-2 text-[14px] text-[var(--t2t-text-secondary)]">
            Live overview of the Trash2Treasure ecosystem.
          </p>
        </div>
        {/* Live Badge */}
        <div className="flex items-center gap-2 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-1 self-start sm:self-center">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#14EF10] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#14EF10]"></span>
          </span>
          <span className="text-[11px] font-bold text-neutral-400 tracking-wider uppercase">
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
          icon={<Trash size={20} />}
        />
        <KpiCard
          title="Bins Active"
          value="0"
          description="No activity yet"
          icon={<Archive size={20} />}
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
