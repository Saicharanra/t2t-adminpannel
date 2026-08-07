"use client";

import { BarChart3, Calendar } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Deep insights into platform performance and trends">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 py-1.5">
          <Calendar size={14} className="text-[var(--t2t-text-muted)]" />
          <span className="text-sm text-[var(--t2t-text-secondary)]">Last 30 days</span>
        </div>
      </PageHeader>

      {/* Carbon Impact Banner */}
      <div className="rounded-2xl border border-[#14EF10]/30 bg-gradient-to-r from-[#0D160D] via-[#0A0A0C] to-[#0D160D] p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#14EF10]/15 text-[11px] font-bold text-[#14EF10] border border-[#14EF10]/20 mb-2">
            🌱 Carbon Impact & Sustainability
          </span>
          <h2 className="text-lg font-extrabold text-white">Ecological Carbon Footprint & Offset Dashboard</h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            Track real-time CO₂ emissions prevented, equivalent trees planted, clean energy preserved, and material recycling benchmarks.
          </p>
        </div>

        <a
          href="/carbon-impact"
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-[#14EF10] text-black font-bold text-xs hover:bg-[#10d00d] transition-all shadow-[0_0_15px_rgba(20,239,16,0.3)] shrink-0 self-start md:self-auto"
        >
          View Carbon Dashboard →
        </a>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[
          { title: "User Growth", description: "New registrations over time" },
          { title: "Waste Collection", description: "Total waste collected by category" },
          { title: "Submission Trends", description: "Daily submission volume and approval rates" },
          { title: "Business Growth", description: "New business partner registrations" },
          { title: "Reward Redemption", description: "Reward claims and utilization rates" },
          { title: "Top Waste Types", description: "Most common waste categories submitted" },
          { title: "Carbon Savings", description: "Estimated CO₂ reduction over time" },
          { title: "Monthly Activity", description: "Platform engagement heatmap" },
        ].map((chart) => (
          <div
            key={chart.title}
            className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-xs)]"
          >
            <h3 className="text-sm font-semibold text-[var(--t2t-text)]">
              {chart.title}
            </h3>
            <p className="text-[12px] text-[var(--t2t-text-muted)]">
              {chart.description}
            </p>
            <div className="mt-4">
              <EmptyState
                icon={<BarChart3 size={20} />}
                title="No data available"
                description="Data will populate once there is platform activity."
                className="border-0 bg-transparent py-6"
              />
            </div>
          </div>
        ))}
      </div>

      {/* System Health */}
      <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 shadow-[var(--t2t-shadow-xs)]">
        <h3 className="text-sm font-semibold text-[var(--t2t-text)]">
          System Health
        </h3>
        <p className="text-[12px] text-[var(--t2t-text-muted)]">
          API response times and error rates
        </p>
        <div className="mt-4">
          <EmptyState
            icon={<BarChart3 size={20} />}
            title="Health metrics pending"
            description="System health data will be displayed once monitoring is configured."
            className="border-0 bg-transparent py-6"
          />
        </div>
      </div>
    </div>
  );
}
