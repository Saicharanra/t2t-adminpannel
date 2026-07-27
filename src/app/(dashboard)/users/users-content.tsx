"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Users as UsersIcon, 
  Plus, 
  Download, 
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  UserPlus,
  Calendar
} from "lucide-react";
import { getUserStats, getUsers, getCities, type UserFilters } from "./actions";
import { UserKPICards } from "./components/user-kpi-cards";
import { UsersTable } from "./components/users-table";
import { UserDetailsDrawer } from "./components/user-details-drawer";
import { AddUserDialog } from "./components/add-user-dialog";
import { ExportDialog } from "./components/export-dialog";
import { BulkActionsMenu } from "./components/bulk-actions-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { useDebounce } from "@/hooks/use-debounce";

export function UsersContent() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newToday: 0,
  });
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<UserFilters>({});
  const [sortBy, setSortBy] = useState("joinedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData, citiesData] = await Promise.all([
        getUserStats(),
        getUsers({
          page: pagination.page,
          pageSize: pagination.pageSize,
          sortBy,
          sortOrder,
          filters: {
            ...filters,
            search: debouncedSearch,
          },
        }),
        getCities(),
      ]);

      setStats(statsData);
      setUsers(usersData.users);
      setPagination(usersData.pagination);
      setCities(citiesData);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, sortBy, sortOrder, filters, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  const handleFilterChange = (key: keyof UserFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  if (!loading && users.length === 0 && !debouncedSearch && !filters.status && !filters.city) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[24px] font-bold tracking-tight text-[var(--t2t-text)]">
              Users
            </h1>
            <p className="mt-1 text-[14px] text-[var(--t2t-text-secondary)]">
              Manage all registered users
            </p>
          </div>
        </div>

        <EmptyState
          icon={<UsersIcon size={28} />}
          title="No users yet"
          description="Users will appear here once people start registering on the Trash2Treasure platform."
          action={
            <button
              onClick={() => setShowAddDialog(true)}
              className="flex items-center gap-2 rounded-lg bg-[var(--t2t-primary)] px-4 py-2.5 text-sm font-medium text-[var(--t2t-text-inverse)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-primary-hover)] transition-colors"
            >
              <UserPlus size={16} />
              Add First User
            </button>
          }
        />

        <AddUserDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[var(--t2t-text)]">
            Users
          </h1>
          <p className="mt-1 text-[14px] text-[var(--t2t-text-secondary)]">
            Manage all registered users
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedUsers.length > 0 && (
            <BulkActionsMenu
              selectedCount={selectedUsers.length}
              selectedUsers={selectedUsers}
              onSuccess={() => {
                setSelectedUsers([]);
                handleRefresh();
              }}
            />
          )}
          <button
            onClick={() => setShowExportDialog(true)}
            className="flex items-center gap-2 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3.5 py-2 text-sm font-medium text-[var(--t2t-text)] shadow-[var(--t2t-shadow-xs)] hover:bg-[var(--t2t-surface-hover)] transition-colors"
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 rounded-lg bg-[#14EF10] px-3.5 py-2 text-sm font-medium text-black shadow-[var(--t2t-shadow-xs)] hover:bg-[#10d00d] transition-colors"
          >
            <Plus size={15} />
            Add User
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <UserKPICards stats={stats} />

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10] transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filters.status || "all"}
            onChange={(e) => handleFilterChange("status", e.target.value === "all" ? undefined : e.target.value)}
            className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 pr-8 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10] transition-colors"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>

          <select
            value={filters.city || "all"}
            onChange={(e) => handleFilterChange("city", e.target.value === "all" ? undefined : e.target.value)}
            className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 pr-8 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10] transition-colors"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split("-");
              setSortBy(newSortBy);
              setSortOrder(newSortOrder as "asc" | "desc");
            }}
            className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 pr-8 text-sm text-[var(--t2t-text)] focus:border-[#14EF10] focus:outline-none focus:ring-1 focus:ring-[#14EF10] transition-colors"
          >
            <option value="joinedAt-desc">Newest First</option>
            <option value="joinedAt-asc">Oldest First</option>
            <option value="points-desc">Most Points</option>
            <option value="wasteSubmitted-desc">Most Waste</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={loading}
        pagination={pagination}
        selectedUsers={selectedUsers}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSelectUser={handleSelectUser}
        onSelectAll={handleSelectAll}
        onRowClick={(userId) => setSelectedUserId(userId)}
        onRefresh={handleRefresh}
      />

      {/* User Details Drawer */}
      {selectedUserId && (
        <UserDetailsDrawer
          userId={selectedUserId}
          open={!!selectedUserId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Add User Dialog */}
      <AddUserDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSuccess={handleRefresh}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        filters={filters}
        totalCount={pagination.totalCount}
      />
    </div>
  );
}
