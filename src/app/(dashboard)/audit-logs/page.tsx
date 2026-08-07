"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ScrollText,
  Search,
  RefreshCw,
  Download,
  Shield,
  Clock,
  Laptop,
  Globe,
  Filter,
  Eye,
  X,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Activity,
  Layers,
  Database
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getAuditLogs, AuditLogRecord } from "./actions";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const ENTITY_FILTERS = ["ALL", "PROFILES", "BUSINESSES", "WASTE_SUBMISSIONS", "AUTH", "PROFILE"] as const;

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    actionsToday: 0,
    uniqueEntities: 0,
    uniqueActors: 0,
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string>("ALL");

  // Modal State for Payload Inspection
  const [activeRecord, setActiveRecord] = useState<AuditLogRecord | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [selectedEntity]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        targetEntity: selectedEntity,
        search: searchQuery,
      });

      if (res.success) {
        setLogs(res.logs);
        setStats(res.stats);
      } else {
        toast.error(res.error || "Failed to load audit logs.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const exportToCSV = () => {
    if (logs.length === 0) {
      toast.error("No logs to export.");
      return;
    }

    const headers = ["ID", "Action", "Target Entity", "Target ID", "IP Address", "Timestamp", "Payload"];
    const rows = logs.map((log) => [
      log.id,
      log.action,
      log.target_entity || "N/A",
      log.target_id || "N/A",
      log.ip_address || "N/A",
      new Date(log.created_at).toLocaleString(),
      log.payload ? JSON.stringify(log.payload).replace(/"/g, '""') : "N/A",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((x) => `"${x}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `t2t_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Audit logs exported to CSV!");
  };

  const getActionBadgeColor = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("LOGIN") || act.includes("APPROVE") || act.includes("ACTIVE")) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (act.includes("SUSPENDED") || act.includes("FAILURE") || act.includes("LOCK")) {
      return "bg-red-500/10 text-red-400 border-red-500/20";
    }
    if (act.includes("IMPERSONATE") || act.includes("VERIFY") || act.includes("UPDATE")) {
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
    return "bg-neutral-500/10 text-neutral-300 border-neutral-500/20";
  };

  return (
    <div className="space-y-8">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-3">
        <Link
          href="/settings"
          className="flex items-center gap-2 text-xs font-semibold text-[var(--t2t-text-secondary)] hover:text-[var(--t2t-primary)] transition-colors self-start"
        >
          <ArrowLeft size={14} /> Back to Settings
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <PageHeader
            title="System Audit Logs"
            description="Track administrative actions, user status changes, authentication events, and security logs."
          />

          <div className="flex items-center gap-3 self-start md:self-auto">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-xs font-semibold text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span>Refresh Logs</span>
            </button>

            <button
              onClick={exportToCSV}
              disabled={logs.length === 0}
              className="flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[var(--t2t-primary)] text-black font-bold text-xs hover:bg-[var(--t2t-primary)]/90 transition-all cursor-pointer disabled:opacity-50 shadow-[var(--t2t-shadow-xs)]"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <ScrollText size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Total Event Records</p>
            <h3 className="text-xl font-bold text-[var(--t2t-text)]">{stats.totalLogs} Events</h3>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Actions Recorded Today</p>
            <h3 className="text-xl font-bold text-emerald-400">{stats.actionsToday} Today</h3>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Audited Target Entities</p>
            <h3 className="text-xl font-bold text-[var(--t2t-text)]">{stats.uniqueEntities} Entities</h3>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Audit Compliance</p>
            <h3 className="text-sm font-bold text-amber-400">Supabase Immutable</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--t2t-border)] pb-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {ENTITY_FILTERS.map((entity) => (
            <button
              key={entity}
              onClick={() => setSelectedEntity(entity)}
              className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedEntity === entity
                  ? "bg-[var(--t2t-primary)] text-black shadow-[var(--t2t-shadow-xs)]"
                  : "bg-[var(--t2t-surface)] text-[var(--t2t-text-secondary)] border border-[var(--t2t-border)] hover:bg-[var(--t2t-surface-hover)] hover:text-[var(--t2t-text)]"
              }`}
            >
              {entity}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full sm:w-80">
          <Search size={15} className="absolute left-3 text-[var(--t2t-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search action, IP, payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-xs text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] shadow-[var(--t2t-shadow-sm)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--t2t-text)]">
            <thead className="border-b border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)]/50 text-[11px] font-semibold uppercase tracking-wider text-[var(--t2t-text-muted)]">
              <tr>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Target Entity</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--t2t-border)]/60 font-mono">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[var(--t2t-surface-hover)]/40 transition-colors group cursor-pointer"
                  onClick={() => setActiveRecord(log)}
                >
                  {/* Action Badge */}
                  <td className="px-5 py-3.5 font-sans">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${getActionBadgeColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                  </td>

                  {/* Target Entity */}
                  <td className="px-5 py-3.5 font-sans text-xs">
                    <span className="capitalize font-semibold text-[var(--t2t-text)]">
                      {log.target_entity || "system"}
                    </span>
                    {log.target_id && (
                      <span className="block text-[10px] text-[var(--t2t-text-muted)] truncate max-w-[140px]">
                        ID: {log.target_id}
                      </span>
                    )}
                  </td>

                  {/* IP Address */}
                  <td className="px-5 py-3.5 text-xs text-[var(--t2t-text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Globe size={13} className="text-[var(--t2t-text-muted)] shrink-0" />
                      <span>{log.ip_address || "127.0.0.1"}</span>
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td className="px-5 py-3.5 font-sans text-xs text-[var(--t2t-text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[var(--t2t-text-muted)] shrink-0" />
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  </td>

                  {/* View Details Button */}
                  <td className="px-5 py-3.5 text-right font-sans">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRecord(log);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--t2t-primary)] hover:underline cursor-pointer"
                    >
                      <Eye size={13} /> View Payload
                    </button>
                  </td>
                </tr>
              ))}

              {logs.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400 font-sans">
                    <ScrollText size={32} className="mx-auto text-[var(--t2t-text-muted)] mb-2" />
                    <p className="text-sm font-semibold text-[var(--t2t-text)]">No audit records found</p>
                    <p className="text-xs text-[var(--t2t-text-secondary)] mt-1">
                      Try resetting your filter or search query.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Payload Inspector Modal */}
      <AnimatePresence>
        {activeRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl rounded-2xl border border-[var(--t2t-border)] bg-[#0D0D11] p-6 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-[var(--t2t-border)] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${getActionBadgeColor(
                        activeRecord.action
                      )}`}
                    >
                      {activeRecord.action}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono">ID: {activeRecord.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">Audit Record Inspector</h3>
                </div>

                <button
                  onClick={() => setActiveRecord(null)}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Record Summary Metadata */}
              <div className="mt-4 grid grid-cols-2 gap-4 p-3.5 rounded-xl border border-white/10 bg-[#14141A] text-xs">
                <div>
                  <span className="text-neutral-400 block text-[11px]">Target Entity</span>
                  <span className="font-bold text-white uppercase">{activeRecord.target_entity || "N/A"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Target ID</span>
                  <span className="font-mono text-white truncate block">{activeRecord.target_id || "N/A"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Originating IP</span>
                  <span className="font-mono text-emerald-400">{activeRecord.ip_address || "127.0.0.1"}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[11px]">Event Timestamp</span>
                  <span className="font-sans text-neutral-200">{new Date(activeRecord.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* User Agent */}
              {activeRecord.user_agent && (
                <div className="mt-3 p-3 rounded-xl border border-white/10 bg-[#14141A] text-xs">
                  <span className="text-neutral-400 block text-[11px] mb-1">User Agent Header</span>
                  <p className="font-mono text-[11px] text-neutral-300 break-all">{activeRecord.user_agent}</p>
                </div>
              )}

              {/* JSON Payload Inspector */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                    <FileCode size={14} className="text-[#14EF10]" /> Raw Event JSON Payload
                  </label>
                  <span className="text-[10px] text-neutral-500 font-mono">JSON Format</span>
                </div>

                <pre className="p-4 rounded-xl border border-white/10 bg-[#070709] font-mono text-xs text-[#14EF10] overflow-x-auto max-h-60 leading-relaxed shadow-inner">
                  {JSON.stringify(activeRecord.payload || {}, null, 2)}
                </pre>
              </div>

              {/* Footer */}
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setActiveRecord(null)}
                  className="h-9 px-5 rounded-lg bg-white/10 text-white font-semibold text-xs hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
