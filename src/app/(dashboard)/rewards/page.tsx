"use client";

import { Gift, Plus, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Rewards" description="Manage reward catalog, partners, and redemption requests">
        <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
          <Plus size={15} />
          Add Reward
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--t2t-border)]">
        {["Catalog", "Redemption Requests", "Partners", "History"].map((tab, i) => (
          <button
            key={tab}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              i === 0
                ? "text-[var(--t2t-primary)]"
                : "text-[var(--t2t-text-muted)] hover:text-[var(--t2t-text)]"
            }`}
          >
            {tab}
            {i === 0 && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--t2t-primary)]" />
            )}
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search rewards…"
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--t2t-primary)] transition-colors"
          />
          <Gift size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
          <Filter size={15} />
          Filters
        </button>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={<Gift size={24} />}
        title="No rewards in catalog"
        description="Add rewards like coupons, gift cards, and partner offers to incentivize users."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
            <Plus size={15} />
            Create First Reward
          </button>
        }
      />
    </div>
  );
}
