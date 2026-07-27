"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  SquaresFour,
  Users,
  Buildings,
  Trash,
  Archive,
  Gift,
  FileText,
  ChartBar,
  Leaf,
  ShieldCheck,
  Gear,
  Scroll,
  CaretLeft,
} from "@phosphor-icons/react";
import { useSidebar } from "@/providers/sidebar-provider";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  shortcut?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "OVERVIEW",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: <SquaresFour size={18} />,
        shortcut: "⌘D",
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { title: "Users", href: "/users", icon: <Users size={18} />, shortcut: "⌘U" },
      { title: "Businesses", href: "/businesses", icon: <Buildings size={18} />, shortcut: "⌘B" },
      { title: "Waste Submissions", href: "/waste-submissions", icon: <Trash size={18} /> },
      { title: "Bin Management", href: "/bins", icon: <Archive size={18} /> },
      { title: "Rewards", href: "/rewards", icon: <Gift size={18} /> },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { title: "Reports", href: "/reports", icon: <FileText size={18} /> },
      { title: "Analytics", href: "/analytics", icon: <ChartBar size={18} />, shortcut: "⌘A" },
      { title: "Carbon Impact", href: "/carbon-impact", icon: <Leaf size={18} /> },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Admins", href: "/admins", icon: <ShieldCheck size={18} /> },
      { title: "Settings", href: "/settings", icon: <Gear size={18} />, shortcut: "⌘," },
      { title: "Audit Logs", href: "/audit-logs", icon: <Scroll size={18} /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r",
        "bg-[var(--t2t-sidebar-bg)] text-[var(--t2t-text)] border-[var(--t2t-border)]"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-[var(--t2t-border)] px-5">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#14EF10]">
            <Leaf size={14} weight="bold" className="text-black" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap text-[14px] font-semibold text-[var(--t2t-text)] tracking-tight"
              >
                T2T Admin
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggle}
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded",
            "text-neutral-500 hover:bg-neutral-900 hover:text-white",
            "transition-colors",
            isCollapsed && "mx-auto"
          )}
          title="Toggle sidebar (⌘[)"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <CaretLeft size={14} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && "mt-5")}>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-[var(--t2t-text-secondary)]">
                {group.label}
              </p>
            )}
            {isCollapsed && groupIndex > 0 && (
              <div className="mx-3 mb-2 border-t border-[var(--t2t-border)]" />
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded py-1.5 px-3 text-[13px] font-medium transition-all duration-150",
                        active
                          ? "bg-[var(--t2t-surface-hover)] text-[var(--t2t-text)] border border-[var(--t2t-border)]"
                          : "text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-surface)] hover:text-[var(--t2t-text)] border border-transparent",
                        isCollapsed && "justify-center px-0"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <span className={cn("shrink-0", active ? "text-[#14EF10]" : "text-[var(--t2t-text-muted)] group-hover:text-[var(--t2t-text)]")}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.title}</span>
                          {item.shortcut && (
                            <span className="ml-auto text-[10px] text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.shortcut}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t border-[var(--t2t-border)] px-5 py-3">
          <p className="text-[10px] font-semibold text-[var(--t2t-text-secondary)]">
            Trash2Treasure Admin
          </p>
          <p className="text-[9px] text-[var(--t2t-text-muted)]">
            Version 1.0.0
          </p>
        </div>
      )}
    </motion.aside>
  );
}
