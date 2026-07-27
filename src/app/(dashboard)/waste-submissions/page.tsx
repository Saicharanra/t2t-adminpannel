import { Trash2, Filter, Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function WasteSubmissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Waste Submissions" description="Review and verify waste submission requests">
        <Button variant="outline" className="flex items-center gap-2">
          <Eye size={15} />
          Review Queue
        </Button>
      </PageHeader>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--t2t-border)]">
        {[
          { label: "All", count: 0 },
          { label: "Pending", count: 0 },
          { label: "Approved", count: 0 },
          { label: "Rejected", count: 0 },
          { label: "Needs Reupload", count: 0 },
        ].map((tab, i) => (
          <button
            key={tab.label}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === 0
                ? "text-[var(--t2t-primary)]"
                : "text-[var(--t2t-text-muted)] hover:text-[var(--t2t-text)]"
            }`}
          >
            {tab.label}
            <span className="rounded-full bg-[var(--t2t-bg)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--t2t-text-muted)]">
              {tab.count}
            </span>
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
            placeholder="Search submissions by user, category, or location…"
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--t2t-primary)] transition-colors"
          />
          <Trash2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 text-sm text-[var(--t2t-text-secondary)] focus:border-[var(--t2t-primary)] focus:outline-none">
            <option>All Categories</option>
            <option>Plastic</option>
            <option>Metal</option>
            <option>Paper</option>
            <option>Glass</option>
            <option>Organic</option>
            <option>E-Waste</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
            <Filter size={15} />
            More Filters
          </button>
        </div>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={<Trash2 size={24} />}
        title="No submissions to review"
        description="Waste submission requests from users will appear here for verification and approval."
      />
    </div>
  );
}
