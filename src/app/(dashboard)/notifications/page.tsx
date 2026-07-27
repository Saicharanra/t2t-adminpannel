"use client";

import { Bell, Settings as SettingsIcon, Check, Archive } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Manage platform notifications and alert preferences"
      >
        <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-bg)] transition-colors">
          <Check size={15} />
          Mark All Read
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-bg)] transition-colors">
          <SettingsIcon size={15} />
          Preferences
        </button>
      </PageHeader>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--t2t-border)]">
        {["All", "Unread", "System", "Users", "Archived"].map((tab, i) => (
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

      {/* Empty State */}
      <EmptyState
        icon={<Bell size={24} />}
        title="No notifications"
        description="You're all caught up. Notifications about platform activity, user actions, and system events will appear here."
        action={
          <button className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-4 py-2.5 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-bg)] transition-colors">
            <Archive size={15} />
            View Archived
          </button>
        }
      />
    </div>
  );
}
