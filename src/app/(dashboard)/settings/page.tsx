"use client";

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
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";

const settingsSections = [
  {
    category: "Platform",
    items: [
      {
        title: "General",
        description: "Platform name, branding, timezone, and regional settings",
        icon: <Globe size={20} />,
      },
      {
        title: "Appearance",
        description: "Theme, colors, and display preferences",
        icon: <Palette size={20} />,
      },
      {
        title: "Notifications",
        description: "Email and push notification preferences",
        icon: <Bell size={20} />,
      },
      {
        title: "Email Templates",
        description: "Customize transactional email templates",
        icon: <Mail size={20} />,
      },
    ],
  },
  {
    category: "Rules & Configuration",
    items: [
      {
        title: "Reward Rules",
        description: "Points per waste type, bonuses, and limits",
        icon: <Zap size={20} />,
      },
      {
        title: "Point Rules",
        description: "Point calculation formulas and tier thresholds",
        icon: <Zap size={20} />,
      },
      {
        title: "AI Verification",
        description: "Confidence thresholds and auto-approval rules",
        icon: <Zap size={20} />,
      },
      {
        title: "Maps & Locations",
        description: "Map provider, geocoding, and region settings",
        icon: <MapPin size={20} />,
      },
    ],
  },
  {
    category: "Security & Access",
    items: [
      {
        title: "Roles & Permissions",
        description: "Admin roles, access levels, and RBAC configuration",
        icon: <Shield size={20} />,
      },
      {
        title: "API Keys",
        description: "Manage API keys for external integrations",
        icon: <Key size={20} />,
      },
      {
        title: "Audit Logs",
        description: "View all administrative actions and system events",
        icon: <ScrollText size={20} />,
      },
      {
        title: "Admin Users",
        description: "Manage admin accounts and access",
        icon: <Users size={20} />,
      },
    ],
  },
  {
    category: "System",
    items: [
      {
        title: "Storage",
        description: "File storage provider and usage",
        icon: <Database size={20} />,
      },
      {
        title: "Integrations",
        description: "Third-party service connections",
        icon: <SettingsIcon size={20} />,
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure platform settings, rules, and permissions"
      />

      {settingsSections.map((section) => (
        <div key={section.category}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--t2t-text-muted)]">
            {section.category}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <button
                key={item.title}
                className="group flex items-start gap-4 rounded-xl border border-[var(--t2t-border)] bg-[var(--t2t-surface)] p-4 text-left shadow-[var(--t2t-shadow-xs)] hover:border-[var(--t2t-primary)]/30 hover:shadow-[var(--t2t-shadow-md)] transition-all"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--t2t-primary-subtle)] text-[var(--t2t-primary)] transition-colors group-hover:bg-[var(--t2t-primary)] group-hover:text-white">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[var(--t2t-text)]">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[13px] text-[var(--t2t-text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
