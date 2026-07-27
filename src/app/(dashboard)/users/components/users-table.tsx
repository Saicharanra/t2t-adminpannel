"use client";

import {
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  Trash2,
  Mail,
  Coins,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { UserActionsMenu } from "./user-actions-menu";

interface UsersTableProps {
  users: any[];
  loading: boolean;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  selectedUsers: string[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  onRowClick: (userId: string) => void;
  onRefresh: () => void;
}

export function UsersTable({
  users,
  loading,
  pagination,
  selectedUsers,
  onPageChange,
  onPageSizeChange,
  onSelectUser,
  onSelectAll,
  onRowClick,
  onRefresh,
}: UsersTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "text-[#14EF10] bg-[#14EF10]/10 border-[#14EF10]/20";
      case "inactive":
        return "text-[var(--t2t-text-muted)] bg-[var(--t2t-surface)] border-[var(--t2t-border)]";
      case "suspended":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      default:
        return "text-[var(--t2t-text-secondary)] bg-[var(--t2t-surface)] border-[var(--t2t-border)]";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] overflow-hidden animate-pulse">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="p-4 border-b border-[var(--t2t-border)]">
            <div className="h-4 w-full bg-[var(--t2t-bg)] rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-12 text-center">
        <p className="text-[var(--t2t-text-secondary)]">No users found matching your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--t2t-bg)] border-b border-[var(--t2t-border)]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={onSelectAll}
                    className="rounded border-[var(--t2t-border)] focus:ring-[#14EF10]"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Points
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Waste (kg)
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--t2t-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--t2t-border)]">
              {users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onRowClick(user.id)}
                  className="hover:bg-[var(--t2t-surface-hover)] transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        onSelectUser(user.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-[var(--t2t-border)] focus:ring-[#14EF10]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14EF10]/10 text-[#14EF10] text-xs font-semibold">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--t2t-text)]">
                          {user.name}
                        </div>
                        <div className="text-xs text-[var(--t2t-text-secondary)]">
                          ID: {user.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm text-[var(--t2t-text)]">{user.email}</div>
                      {user.phone && (
                        <div className="text-xs text-[var(--t2t-text-secondary)]">
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[var(--t2t-text)]">
                      {user.city || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Coins size={14} className="text-[#14EF10]" />
                      <span className="text-sm font-medium text-[var(--t2t-text)]">
                        {user.points.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-[var(--t2t-text)]">
                      {user.wasteSubmitted.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-[var(--t2t-text-secondary)]">
                      {formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() =>
                          setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)
                        }
                        className="p-1 rounded hover:bg-[var(--t2t-bg)] transition-colors"
                      >
                        <MoreVertical size={16} className="text-[var(--t2t-text-secondary)]" />
                      </button>
                      {actionMenuOpen === user.id && (
                        <UserActionsMenu
                          user={user}
                          onClose={() => setActionMenuOpen(null)}
                          onRefresh={onRefresh}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--t2t-text-secondary)]">Rows per page:</span>
          <select
            value={pagination.pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-9 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-[var(--t2t-text-secondary)]">
            {(pagination.page - 1) * pagination.pageSize + 1}-
            {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{" "}
            {pagination.totalCount}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] hover:bg-[var(--t2t-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-[var(--t2t-text)]" />
          </button>
          <span className="text-sm text-[var(--t2t-text)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] hover:bg-[var(--t2t-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-[var(--t2t-text)]" />
          </button>
        </div>
      </div>
    </div>
  );
}
