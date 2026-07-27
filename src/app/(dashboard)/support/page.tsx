"use client";

import { Headphones, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Manage customer support tickets and conversations">
        <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
          <Plus size={15} />
          Create Ticket
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Open", value: "0", variant: "warning" as const },
          { label: "In Progress", value: "0", variant: "info" as const },
          { label: "Resolved", value: "0", variant: "success" as const },
          { label: "Avg. Response", value: "—", variant: "neutral" as const },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)]"
          >
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-[var(--t2t-text-muted)]">
                {stat.label}
              </p>
              <StatusBadge variant={stat.variant} dot={false}>
                {stat.label}
              </StatusBadge>
            </div>
            <p className="mt-1 text-xl font-semibold text-[var(--t2t-text)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search tickets by subject, user, or ID…"
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--t2t-primary)] transition-colors"
          />
          <Headphones size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 text-sm text-[var(--t2t-text-secondary)] focus:border-[var(--t2t-primary)] focus:outline-none">
            <option>All Priority</option>
            <option>Urgent</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
            <Filter size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={<Headphones size={24} />}
        title="No support tickets"
        description="Customer support tickets will appear here when users submit help requests."
      />
    </div>
  );
}
