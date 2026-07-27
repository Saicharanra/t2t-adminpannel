"use client";

import { Package, Plus, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function BinsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Bin Management" description="Monitor and manage smart waste collection bins">
        <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-bg)] transition-colors">
          <MapPin size={15} />
          Map View
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
          <Plus size={15} />
          Add Bin
        </button>
      </PageHeader>

      {/* Status Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Bins", value: "0", color: "var(--t2t-text)" },
          { label: "Active", value: "0", color: "var(--t2t-success)" },
          { label: "Full", value: "0", color: "var(--t2t-warning)" },
          { label: "Maintenance", value: "0", color: "var(--t2t-danger)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)]"
          >
            <p className="text-[12px] font-medium text-[var(--t2t-text-muted)]">
              {stat.label}
            </p>
            <p
              className="mt-1 text-xl font-semibold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search bins by ID, location, or area…"
          className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--t2t-primary)] transition-colors"
        />
        <Package size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
      </div>

      {/* Empty State */}
      <EmptyState
        icon={<Package size={24} />}
        title="No bins configured"
        description="Add smart waste collection bins to start monitoring capacity and collection schedules."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
            <Plus size={15} />
            Add First Bin
          </button>
        }
      />
    </div>
  );
}
