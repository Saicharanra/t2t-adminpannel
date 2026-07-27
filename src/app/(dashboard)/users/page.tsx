"use client";

import { Users as UsersIcon, Plus, Download } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage platform users and their accounts">
        <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-bg)] transition-colors">
          <Download size={15} />
          Export
        </button>
        <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-3.5 py-2 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
          <Plus size={15} />
          Add User
        </button>
      </PageHeader>

      {/* Search & Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users by name, email, or phone…"
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--t2t-primary)] transition-colors"
          />
          <UsersIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 text-sm text-[var(--t2t-text-secondary)] focus:border-[var(--t2t-primary)] focus:outline-none">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Inactive</option>
          </select>
          <select className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 text-sm text-[var(--t2t-text-secondary)] focus:border-[var(--t2t-primary)] focus:outline-none">
            <option>All Cities</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={<UsersIcon size={24} />}
        title="No users yet"
        description="Users will appear here once people start registering on the Trash2Treasure platform."
        action={
          <button className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-4 py-2.5 text-sm font-medium text-white shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors">
            <Plus size={15} />
            Add First User
          </button>
        }
      />
    </div>
  );
}
