"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Scale,
  Search,
  RefreshCw,
  ExternalLink,
  MapPin,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { getSubmissionStats, getSubmissions, updateSubmissionStatus } from "./actions";
import { format } from "date-fns";

export default function WasteSubmissionsPage() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalWeightKg: 0,
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, listData] = await Promise.all([
        getSubmissionStats(),
        getSubmissions(categoryFilter, activeTab),
      ]);
      setStats(sData);
      setSubmissions(listData);
    } catch (err) {
      console.error("Error fetching submissions data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const defaultReason = newStatus === "Rejected" ? "Ineligible waste or clear photo required" : "";
      const res = await updateSubmissionStatus(id, newStatus, 15, defaultReason);
      if (res.success) {
        await fetchData();
      }
    } catch (err: any) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter by search term
  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.userName?.toLowerCase().includes(term) ||
      sub.userEmail?.toLowerCase().includes(term) ||
      sub.category?.toLowerCase().includes(term) ||
      sub.location?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Waste Submissions" description="Review and verify waste submission requests from citizens">
        <Button variant="outline" onClick={fetchData} disabled={loading} className="flex items-center gap-2">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </PageHeader>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--t2t-text-muted)]">
            <Trash2 size={16} /> Total
          </div>
          <div className="mt-2 text-2xl font-bold text-[var(--t2t-text)]">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-500">
            <Clock size={16} /> Pending
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-500">{stats.pending}</div>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-500">
            <CheckCircle2 size={16} /> Approved
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-500">{stats.approved}</div>
        </div>
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-rose-500">
            <XCircle size={16} /> Rejected
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-500">{stats.rejected}</div>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 shadow-sm col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-500">
            <Scale size={16} /> Total Waste
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-500">{stats.totalWeightKg} kg</div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--t2t-border)] overflow-x-auto">
        {[
          { label: "All", count: stats.total },
          { label: "Pending", count: stats.pending },
          { label: "Approved", count: stats.approved },
          { label: "Rejected", count: stats.rejected },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.label
                ? "text-[var(--t2t-primary)] font-semibold"
                : "text-[var(--t2t-text-muted)] hover:text-[var(--t2t-text)]"
            }`}
          >
            {tab.label}
            <span className="rounded-full bg-[var(--t2t-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--t2t-text-secondary)]">
              {tab.count}
            </span>
            {activeTab === tab.label && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--t2t-primary)]" />
            )}
          </button>
        ))}
      </div>

      {/* Search & Category Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search submissions by user, category, or location…"
            className="h-10 w-full rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-10 pr-4 text-sm text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none"
          />
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t2t-text-muted)]" />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-3 text-sm text-[var(--t2t-text-secondary)] focus:border-[var(--t2t-primary)] focus:outline-none"
        >
          <option>All Categories</option>
          <option>Plastic</option>
          <option>Metal</option>
          <option>Paper</option>
          <option>Glass</option>
          <option>Organic</option>
          <option>E-Waste</option>
          <option>Mixed Recyclables</option>
        </select>
      </div>

      {/* Table Content / Loading / Empty State */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="animate-spin text-[var(--t2t-primary)]" size={32} />
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <EmptyState
          icon={<Trash2 size={28} />}
          title="No submissions found"
          description={
            searchTerm || activeTab !== "All" || categoryFilter !== "All Categories"
              ? "No waste submissions match your selected filter criteria."
              : "User waste submission requests will appear here for review and verification."
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--t2t-text)]">
              <thead className="bg-[var(--t2t-bg)] text-xs font-semibold uppercase text-[var(--t2t-text-muted)] border-b border-[var(--t2t-border)]">
                <tr>
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Waste Category</th>
                  <th className="px-4 py-3">Weight / Location</th>
                  <th className="px-4 py-3">Submitted At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--t2t-border)]">
                {filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[var(--t2t-bg)]/50 transition-colors">
                    {/* Image Preview */}
                    <td className="px-4 py-3">
                      {sub.imageUrl ? (
                        <button
                          onClick={() => setPreviewImage(sub.imageUrl)}
                          className="group relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--t2t-border)] bg-slate-900 cursor-pointer"
                        >
                          <img
                            src={sub.imageUrl}
                            alt={sub.category}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              // If image fails to load, replace with a clean fallback placeholder
                              (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=150&auto=format&fit=crop&q=80";
                            }}
                          />
                        </button>
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-bg)] text-[var(--t2t-text-muted)]">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </td>

                    {/* User Info */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--t2t-text)] flex items-center gap-1.5">
                        <User size={14} className="text-[var(--t2t-primary)]" />
                        {sub.userName}
                      </div>
                      <div className="text-xs text-[var(--t2t-text-muted)]">{sub.userEmail}</div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 font-semibold text-[var(--t2t-text)]">
                      {sub.category}
                      {sub.pointsAwarded > 0 && (
                        <div className="text-xs font-normal text-emerald-500">+{sub.pointsAwarded} pts</div>
                      )}
                    </td>

                    {/* Weight & Location */}
                    <td className="px-4 py-3">
                      <div className="font-medium">{sub.weight > 0 ? `${sub.weight} kg` : "N/A"}</div>
                      <div className="flex items-center gap-1 text-xs text-[var(--t2t-text-muted)] max-w-[200px] truncate">
                        <MapPin size={12} className="shrink-0" />
                        {sub.location}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-[var(--t2t-text-muted)]">
                      {sub.createdAt ? format(new Date(sub.createdAt), "PP p") : "—"}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          sub.status === "Approved"
                            ? "success"
                            : sub.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {sub.status}
                      </StatusBadge>
                      {sub.rejectionReason && (
                        <div className="mt-1 text-[11px] text-rose-500 max-w-[150px] truncate" title={sub.rejectionReason}>
                          Reason: {sub.rejectionReason}
                        </div>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-right">
                      {updatingId === sub.id ? (
                        <RefreshCw size={16} className="animate-spin text-[var(--t2t-primary)] ml-auto" />
                      ) : sub.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(sub.id, "Approved")}
                            className="flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 size={14} /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(sub.id, "Rejected")}
                            className="flex items-center gap-1 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--t2t-text-muted)]">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-slate-900 border border-slate-700">
            <img src={previewImage} alt="Enlarged Waste Submission" className="max-h-[85vh] object-contain" />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 rounded-full bg-black/60 p-2 text-white hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
