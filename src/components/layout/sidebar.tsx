"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  Trash2,
  Package,
  Gift,
  FileText,
  BarChart3,
  Leaf,
  ShieldCheck,
  Settings,
  ScrollText,
  ChevronLeft,
  Search,
} from "lucide-react";
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
        icon: <LayoutDashboard size={18} />,
        shortcut: "⌘D",
      },
    ],
  },
  {
    label: "OPERATIONS",
    items: [
      { title: "Users", href: "/users", icon: <Users size={18} />, shortcut: "⌘U" },
      { title: "Businesses", href: "/businesses", icon: <Building2 size={18} />, shortcut: "⌘B" },
      { title: "Waste Submissions", href: "/waste-submissions", icon: <Trash2 size={18} /> },
      { title: "Bin Management", href: "/bins", icon: <Package size={18} /> },
      { title: "Rewards", href: "/rewards", icon: <Gift size={18} /> },
    ],
  },
  {
    label: "ANALYTICS",
    items: [
      { title: "Reports", href: "/reports", icon: <FileText size={18} /> },
      { title: "Analytics", href: "/analytics", icon: <BarChart3 size={18} />, shortcut: "⌘A" },
      { title: "Carbon Impact", href: "/carbon-impact", icon: <Leaf size={18} /> },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      { title: "Admins", href: "/admins", icon: <ShieldCheck size={18} /> },
      { title: "Settings", href: "/settings", icon: <Settings size={18} />, shortcut: "⌘," },
      { title: "Audit Logs", href: "/audit-logs", icon: <ScrollText size={18} /> },
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
      animate={{ width: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[#ECECEC]",
        "bg-white text-[#111111]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-[#ECECEC] px-5">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#4F772D]">
            <Leaf size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="whitespace-nowrap text-[15px] font-semibold text-[#111111] tracking-tight"
              >
                T2T Admin
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <button
          onClick={toggle}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            "text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]",
            "transition-colors",
            isCollapsed && "mx-auto"
          )}
          title="Toggle sidebar (⌘[)"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
        {navGroups.map((group, groupIndex) => (
          <div key={group.label} className={cn(groupIndex > 0 && "mt-5")}>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#6B7280]">
                {group.label}
              </p>
            )}
            {isCollapsed && groupIndex > 0 && (
              <div className="mx-3 mb-2 border-t border-[#ECECEC]" />
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-[10px] py-2 px-3 text-sm font-medium transition-all duration-150",
                        active
                          ? "bg-[#F5F5F5] text-black"
                          : "text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111]",
                        isCollapsed && "justify-center px-0"
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <span className={cn("shrink-0", active ? "text-[#4F772D]" : "text-[#6B7280] group-hover:text-[#111111]")}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <>
                          <span className="truncate">{item.title}</span>
                          {item.shortcut && (
                            <span className="ml-auto text-[11px] text-[#9CA3AF] opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="border-t border-[#ECECEC] px-5 py-4">
          <p className="text-[11px] font-semibold text-[#111111]">
            Trash2Treasure Admin
          </p>
          <p className="text-[10px] text-[#6B7280]">
            Version 1.0.0
          </p>
        </div>
      )}
    </motion.aside>
  );
}
