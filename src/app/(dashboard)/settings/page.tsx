"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Palette,
  Globe,
  Key,
  Users,
  ScrollText,
  Zap,
  Database,
  Mail,
  MapPin,
  Search,
  CheckCircle2,
  RefreshCw,
  Sliders,
  X,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Activity,
  AlertCircle
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { getSystemSettings, updateSystemSetting, resetSystemSettings } from "./actions";
import { DEFAULT_SETTINGS } from "./constants";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SettingItem {
  id: string;
  title: string;
  category: "Platform" | "Rules & Configuration" | "Security & Access" | "System";
  description: string;
  icon: React.ReactNode;
  key: string;
  isLink?: boolean;
  linkHref?: string;
}

const SETTING_ITEMS: SettingItem[] = [
  {
    id: "general",
    key: "general",
    category: "Platform",
    title: "General Platform",
    description: "Platform name, branding, timezone, support email, and maintenance mode",
    icon: <Globe size={20} />,
  },
  {
    id: "appearance",
    key: "appearance",
    category: "Platform",
    title: "Appearance & Theme",
    description: "Theme colors, glassmorphism intensity, layout density, and font styles",
    icon: <Palette size={20} />,
  },
  {
    id: "notifications",
    key: "notifications",
    category: "Platform",
    title: "Notifications & Alerts",
    description: "Email alerts, daily digest dispatches, push sounds, and event thresholds",
    icon: <Bell size={20} />,
  },
  {
    id: "email",
    key: "email",
    category: "Platform",
    title: "Email Templates & API",
    description: "Resend API connection, transactional templates, and live OTP sandbox",
    icon: <Mail size={20} />,
    isLink: true,
    linkHref: "/settings/email",
  },
  {
    id: "reward_rules",
    key: "reward_rules",
    category: "Rules & Configuration",
    title: "Reward Rules & Rates",
    description: "Points per waste type (Plastic, E-Waste, Metal, Paper), bonuses, and caps",
    icon: <Zap size={20} />,
  },
  {
    id: "point_rules",
    key: "point_rules",
    category: "Rules & Configuration",
    title: "Point Rules & Expiry",
    description: "Point calculation formulas, expiry durations, and redemption thresholds",
    icon: <Sliders size={20} />,
  },
  {
    id: "ai_verification",
    key: "ai_verification",
    category: "Rules & Configuration",
    title: "AI Verification Thresholds",
    description: "Model confidence levels, auto-approval rules, and manual inspection triggers",
    icon: <Sparkles size={20} />,
  },
  {
    id: "maps_locations",
    key: "maps_locations",
    category: "Rules & Configuration",
    title: "Maps & Geofencing",
    description: "Map provider selection, default coordinates, and regional coverage bounds",
    icon: <MapPin size={20} />,
  },
  {
    id: "roles_permissions",
    key: "roles_permissions",
    category: "Security & Access",
    title: "Roles & Permissions",
    description: "Administrator roles, permission boundaries, and privilege levels",
    icon: <Shield size={20} />,
  },
  {
    id: "api_keys",
    key: "api_keys",
    category: "Security & Access",
    title: "API Keys & Webhooks",
    description: "Manage integration API keys, rate limits, and webhook dispatch URLs",
    icon: <Key size={20} />,
  },
  {
    id: "audit_logs",
    key: "audit_logs",
    category: "Security & Access",
    title: "Audit Logs & System Events",
    description: "Track administrative actions, user status changes, authentication events, and security logs",
    icon: <ScrollText size={20} />,
    isLink: true,
    linkHref: "/audit-logs",
  },
  {
    id: "admin_users",
    key: "admin_users",
    category: "Security & Access",
    title: "Admin Lockout & Security",
    description: "Failed login attempt limits, account lockout durations, and password policies",
    icon: <Users size={20} />,
  },
  {
    id: "storage",
    key: "storage",
    category: "System",
    title: "Storage Provider",
    description: "File upload storage provider, maximum file size, and file type filters",
    icon: <Database size={20} />,
  },
  {
    id: "integrations",
    key: "integrations",
    category: "System",
    title: "Third-Party Services",
    description: "External auth providers, OAuth settings, and service connections",
    icon: <SettingsIcon size={20} />,
  },
];

const CATEGORIES = ["All", "Platform", "Rules & Configuration", "Security & Access", "System"] as const;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<Record<string, Record<string, any>>>(DEFAULT_SETTINGS);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[number]>("All");

  // Modal State
  const [activeModalItem, setActiveModalItem] = useState<SettingItem | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getSystemSettings();
      if (res.success) {
        setSettings(res.settings);
        setLastUpdated(res.lastUpdated || new Date().toLocaleString());
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item: SettingItem) => {
    setActiveModalItem(item);
    const currentVal = settings[item.key] || DEFAULT_SETTINGS[item.key] || {};
    setFormState({ ...currentVal });
  };

  const handleCloseModal = () => {
    setActiveModalItem(null);
    setFormState({});
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalItem) return;

    const key = activeModalItem.key;
    setSavingKey(key);

    try {
      const res = await updateSystemSetting(key, formState);
      if (res.success) {
        setSettings((prev) => ({
          ...prev,
          [key]: { ...formState },
        }));
        setLastUpdated(new Date().toLocaleTimeString());
        toast.success(res.message || `${activeModalItem.title} saved successfully!`);
        handleCloseModal();
      } else {
        toast.error(res.error || "Failed to update configuration.");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
      console.error(err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetAll = async () => {
    if (!confirm("Are you sure you want to reset all configurations to factory defaults?")) {
      return;
    }

    startTransition(async () => {
      const res = await resetSystemSettings();
      if (res.success) {
        setSettings(DEFAULT_SETTINGS);
        setLastUpdated(new Date().toLocaleTimeString());
        toast.success("Settings reset to default values!");
      } else {
        toast.error(res.error || "Failed to reset settings.");
      }
    });
  };

  // Filtering
  const filteredItems = SETTING_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Dynamic Settings & Operations"
          description="Configure platform rules, reward rates, security parameters, and regional bounds."
        />

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={loadSettings}
            disabled={loading}
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-xs font-semibold text-[var(--t2t-text)] hover:bg-[var(--t2t-surface-hover)] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleResetAll}
            disabled={isPending || loading}
            className="flex items-center gap-2 h-9 px-3.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--t2t-primary-subtle)] text-[var(--t2t-primary)]">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Total Setting Modules</p>
            <h3 className="text-xl font-bold text-[var(--t2t-text)]">{SETTING_ITEMS.length} Modules</h3>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Active Configurations</p>
            <h3 className="text-xl font-bold text-emerald-400">
              {Object.keys(settings).length} Saved Keys
            </h3>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <Activity size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Sync Status</p>
            <h3 className="text-sm font-bold text-blue-400">Supabase Persistent</h3>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 shadow-[var(--t2t-shadow-xs)] flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs text-[var(--t2t-text-muted)] font-medium">Last Configuration Sync</p>
            <h3 className="text-xs font-semibold text-[var(--t2t-text)] truncate">
              {lastUpdated ? lastUpdated : "Just now"}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--t2t-border)] pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-8 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[var(--t2t-primary)] text-black shadow-[var(--t2t-shadow-xs)]"
                  : "bg-[var(--t2t-surface)] text-[var(--t2t-text-secondary)] border border-[var(--t2t-border)] hover:bg-[var(--t2t-surface-hover)] hover:text-[var(--t2t-text)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full sm:w-72">
          <Search size={15} className="absolute left-3 text-[var(--t2t-text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-lg border border-[var(--t2t-border)] bg-[var(--t2t-surface)] text-xs text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[var(--t2t-primary)] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredItems.map((item) => {
          const isConfigured = !!settings[item.key];

          const cardContent = (
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--t2t-primary-subtle)] text-[var(--t2t-primary)] transition-transform group-hover:scale-105">
                {item.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-[var(--t2t-text)] group-hover:text-[var(--t2t-primary)] transition-colors">
                    {item.title}
                  </h3>
                  <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--t2t-border)] bg-[var(--t2t-surface-hover)] text-[var(--t2t-text-secondary)]">
                    {item.category}
                  </span>
                </div>

                <p className="mt-1 text-xs text-[var(--t2t-text-secondary)] leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-[var(--t2t-border)]/50 pt-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <CheckCircle2 size={12} /> {isConfigured ? "Configured & Active" : "Default Config"}
                  </span>

                  <span className="text-xs font-semibold text-[var(--t2t-primary)] flex items-center gap-1 group-hover:underline">
                    {item.isLink ? "Open Sandbox →" : "Edit Config →"}
                  </span>
                </div>
              </div>
            </div>
          );

          if (item.isLink && item.linkHref) {
            return (
              <Link
                key={item.id}
                href={item.linkHref}
                className="group rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 text-left shadow-[var(--t2t-shadow-xs)] hover:border-[var(--t2t-primary)]/40 hover:shadow-[var(--t2t-shadow-md)] transition-all cursor-pointer relative overflow-hidden"
              >
                {cardContent}
              </Link>
            );
          }

          return (
            <div
              key={item.id}
              onClick={() => handleOpenModal(item)}
              className="group rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-5 text-left shadow-[var(--t2t-shadow-xs)] hover:border-[var(--t2t-primary)]/40 hover:shadow-[var(--t2t-shadow-md)] transition-all cursor-pointer relative overflow-hidden"
            >
              {cardContent}
            </div>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-12 text-center rounded-2xl border border-dashed border-[var(--t2t-border)] bg-[var(--t2t-surface)]">
          <AlertCircle size={32} className="mx-auto text-[var(--t2t-text-muted)] mb-2" />
          <p className="text-sm font-semibold text-[var(--t2t-text)]">No matching settings found</p>
          <p className="text-xs text-[var(--t2t-text-secondary)] mt-1">Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Dynamic Setting Edit Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg rounded-2xl border border-[var(--t2t-border)] bg-[#0D0D11] p-6 shadow-2xl overflow-hidden"
            >
              {/* Top Bar */}
              <div className="flex items-start justify-between border-b border-[var(--t2t-border)] pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--t2t-primary-subtle)] text-[var(--t2t-primary)]">
                    {activeModalItem.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{activeModalItem.title}</h3>
                    <p className="text-xs text-[var(--t2t-text-secondary)]">{activeModalItem.category}</p>
                  </div>
                </div>

                <button
                  onClick={handleCloseModal}
                  className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Dynamic Form Editor */}
              <form onSubmit={handleSaveModal} className="mt-5 space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {activeModalItem.key === "general" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Platform Name</label>
                      <input
                        type="text"
                        value={formState.platformName || ""}
                        onChange={(e) => setFormState({ ...formState, platformName: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Support Email</label>
                      <input
                        type="email"
                        value={formState.supportEmail || ""}
                        onChange={(e) => setFormState({ ...formState, supportEmail: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Timezone</label>
                      <input
                        type="text"
                        value={formState.timezone || ""}
                        onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Currency Symbol</label>
                      <input
                        type="text"
                        value={formState.currency || ""}
                        onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                      />
                    </div>
                    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#14141A] cursor-pointer">
                      <span className="text-xs font-semibold text-white">Maintenance Mode</span>
                      <input
                        type="checkbox"
                        checked={!!formState.maintenanceMode}
                        onChange={(e) => setFormState({ ...formState, maintenanceMode: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#14EF10]"
                      />
                    </label>
                  </>
                )}

                {activeModalItem.key === "reward_rules" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Plastic Points/KG</label>
                        <input
                          type="number"
                          value={formState.plasticPointsPerKg ?? 50}
                          onChange={(e) => setFormState({ ...formState, plasticPointsPerKg: Number(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">E-Waste Points/KG</label>
                        <input
                          type="number"
                          value={formState.ewastePointsPerKg ?? 150}
                          onChange={(e) => setFormState({ ...formState, ewastePointsPerKg: Number(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Metal Points/KG</label>
                        <input
                          type="number"
                          value={formState.metalPointsPerKg ?? 100}
                          onChange={(e) => setFormState({ ...formState, metalPointsPerKg: Number(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Paper Points/KG</label>
                        <input
                          type="number"
                          value={formState.paperPointsPerKg ?? 30}
                          onChange={(e) => setFormState({ ...formState, paperPointsPerKg: Number(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Daily Bonus Points Cap</label>
                      <input
                        type="number"
                        value={formState.dailyBonusCap ?? 500}
                        onChange={(e) => setFormState({ ...formState, dailyBonusCap: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {activeModalItem.key === "ai_verification" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">
                        AI Confidence Threshold: <span className="text-[#14EF10] font-bold">{formState.confidenceThreshold ?? 85}%</span>
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="99"
                        value={formState.confidenceThreshold ?? 85}
                        onChange={(e) => setFormState({ ...formState, confidenceThreshold: Number(e.target.value) })}
                        className="w-full accent-[#14EF10]"
                      />
                    </div>
                    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#14141A] cursor-pointer">
                      <span className="text-xs font-semibold text-white">Auto-Approve High Confidence Submissions</span>
                      <input
                        type="checkbox"
                        checked={!!formState.autoApproveEnabled}
                        onChange={(e) => setFormState({ ...formState, autoApproveEnabled: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#14EF10]"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#14141A] cursor-pointer">
                      <span className="text-xs font-semibold text-white">Require Manual Override for Bulk Submissions</span>
                      <input
                        type="checkbox"
                        checked={!!formState.manualOverrideHighValue}
                        onChange={(e) => setFormState({ ...formState, manualOverrideHighValue: e.target.checked })}
                        className="h-4 w-4 rounded accent-[#14EF10]"
                      />
                    </label>
                  </>
                )}

                {activeModalItem.key === "maps_locations" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Map Provider</label>
                      <select
                        value={formState.provider || "OpenStreetMap"}
                        onChange={(e) => setFormState({ ...formState, provider: e.target.value })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                      >
                        <option value="OpenStreetMap">OpenStreetMap (Free)</option>
                        <option value="Mapbox">Mapbox GL</option>
                        <option value="Google Maps">Google Maps Platform</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Default Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formState.defaultLat ?? 17.385044}
                          onChange={(e) => setFormState({ ...formState, defaultLat: Number(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-neutral-300">Default Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={formState.defaultLng ?? 78.486671}
                          onChange={(e) => setFormState({ ...formState, defaultLng: Number(e.target.value) })}
                          className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-neutral-300">Service Coverage Radius (KM)</label>
                      <input
                        type="number"
                        value={formState.serviceRadiusKm ?? 50}
                        onChange={(e) => setFormState({ ...formState, serviceRadiusKm: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {/* Generic JSON fallback for all other settings */}
                {!["general", "reward_rules", "ai_verification", "maps_locations"].includes(activeModalItem.key) && (
                  <div className="space-y-3">
                    {Object.keys(formState).map((propKey) => {
                      const val = formState[propKey];
                      if (typeof val === "boolean") {
                        return (
                          <label key={propKey} className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#14141A] cursor-pointer">
                            <span className="text-xs font-semibold text-white capitalize">{propKey.replace(/([A-Z])/g, " $1")}</span>
                            <input
                              type="checkbox"
                              checked={val}
                              onChange={(e) => setFormState({ ...formState, [propKey]: e.target.checked })}
                              className="h-4 w-4 rounded accent-[#14EF10]"
                            />
                          </label>
                        );
                      }

                      return (
                        <div key={propKey} className="space-y-1">
                          <label className="text-xs font-semibold text-neutral-300 capitalize">
                            {propKey.replace(/([A-Z])/g, " $1")}
                          </label>
                          <input
                            type={typeof val === "number" ? "number" : "text"}
                            value={val ?? ""}
                            onChange={(e) => setFormState({
                              ...formState,
                              [propKey]: typeof val === "number" ? Number(e.target.value) : e.target.value
                            })}
                            className="w-full h-9 px-3 rounded-lg border border-white/10 bg-[#14141A] text-xs text-white focus:border-[#14EF10] focus:outline-none transition-all"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Save Button */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--t2t-border)]">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="h-9 px-4 rounded-lg border border-white/10 text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={savingKey === activeModalItem.key}
                    className="h-9 px-5 rounded-lg bg-[#14EF10] text-black hover:bg-[#10d00d] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(20,239,16,0.3)] cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {savingKey === activeModalItem.key ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
