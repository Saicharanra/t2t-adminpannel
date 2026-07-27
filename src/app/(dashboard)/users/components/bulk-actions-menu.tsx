"use client";

import { CheckCircle, Ban, Trash2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { bulkUpdateUserStatus, bulkDeleteUsers } from "../actions";
import { toast } from "sonner";

interface BulkActionsMenuProps {
  selectedCount: number;
  selectedUsers: string[];
  onSuccess: () => void;
}

export function BulkActionsMenu({ selectedCount, selectedUsers, onSuccess }: BulkActionsMenuProps) {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleBulkAction = async (action: () => Promise<any>, successMessage: string) => {
    setLoading(true);
    try {
      await action();
      toast.success(successMessage);
      onSuccess();
      setShowMenu(false);
    } catch (error) {
      toast.error("Bulk action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
      >
        Bulk Actions ({selectedCount})
        <ChevronDown size={14} />
      </button>

      {showMenu && (
        <div className="absolute left-0 top-full mt-1 w-56 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={() => {
                if (confirm(`Activate ${selectedCount} users?`)) {
                  handleBulkAction(
                    () => bulkUpdateUserStatus(selectedUsers, "Active"),
                    `${selectedCount} users activated`
                  );
                }
              }}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
            >
              <CheckCircle size={14} />
              Activate All
            </button>

            <button
              onClick={() => {
                if (confirm(`Suspend ${selectedCount} users?`)) {
                  handleBulkAction(
                    () => bulkUpdateUserStatus(selectedUsers, "Suspended"),
                    `${selectedCount} users suspended`
                  );
                }
              }}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
            >
              <Ban size={14} />
              Suspend All
            </button>

            <hr className="my-1 border-[var(--t2t-border)]" />

            <button
              onClick={() => {
                if (confirm(`Delete ${selectedCount} users? This action cannot be undone.`)) {
                  handleBulkAction(
                    () => bulkDeleteUsers(selectedUsers),
                    `${selectedCount} users deleted`
                  );
                }
              }}
              disabled={loading}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
              Delete All
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
