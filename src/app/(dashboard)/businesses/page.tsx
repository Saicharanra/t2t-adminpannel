import { Building2, Plus, Download, Filter } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

export default function BusinessesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Businesses" description="Manage business partners and approval workflows">
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={15} />
          Export
        </Button>
        <Button variant="default" className="flex items-center gap-2">
          <Plus size={15} />
          Add Business
        </Button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--t2t-border)]">
        {["All", "Pending Approval", "Active", "Suspended", "Rejected"].map((tab, i) => (
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
            placeholder="Search businesses by name, email, or category…"
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--t2t-primary)] transition-colors"
          />
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-bg)] transition-colors">
          <Filter size={15} />
          Filters
        </button>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={<Building2 size={24} />}
        title="No businesses registered"
        description="Business partners will appear here once they register and submit their applications for approval."
        action={
          <Button variant="default" className="flex items-center gap-2">
            <Plus size={15} />
            Register Business
          </Button>
        }
      />
    </div>
  );
}
