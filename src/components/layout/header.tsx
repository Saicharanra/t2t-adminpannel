"use client";

import { usePathname, useRouter } from "next/navigation";
import { MagnifyingGlass, Bell, Sun, Moon, SignOut, ArrowSquareOut } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { logoutAction } from "@/app/(auth)/actions";

const routeTitles: Record<string, string> = {
  "/": "Dashboard",
  "/users": "Users",
  "/businesses": "Businesses",
  "/waste-submissions": "Waste Submissions",
  "/bins": "Bin Management",
  "/rewards": "Rewards",
  "/reports": "Reports",
  "/analytics": "Analytics",
  "/support": "Support",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = routeTitles[pathname] || "Admin Panel";
  const businessPanelUrl = process.env.NEXT_PUBLIC_BUSINESS_PANEL_URL || "http://localhost:3001";

  return (
    <motion.header
      initial={false}
      animate={{ paddingLeft: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed right-0 top-0 z-30 flex h-14 items-center border-b border-[var(--t2t-border)] bg-[var(--t2t-topbar-bg)] text-[var(--t2t-text)]"
      style={{ left: 0 }}
    >
      <div className="flex w-full items-center justify-between px-8">
        {/* Left: Current Page Title */}
        <div className="flex items-center">
          <h1 className="text-[18px] font-semibold text-[var(--t2t-text)] tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Center: Large Search Bar */}
        <div className="mx-6 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <MagnifyingGlass
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="text"
              placeholder="Search system..."
              className="h-8 w-full rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] pl-9 pr-4 text-[13px] text-[var(--t2t-text)] placeholder:text-[var(--t2t-text-muted)] focus:border-[#14EF10] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: User Actions & Seamless Panel Switcher */}
        <div className="flex items-center gap-3">
          {/* Switch to Business Panel Button */}
          <a
            href={businessPanelUrl}
            className="hidden sm:flex items-center gap-1.5 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-2.5 py-1 text-xs font-medium text-[#14EF10] hover:bg-[#14EF10]/10 transition-colors"
            title="Switch to Business Console"
          >
            <ArrowSquareOut size={13} />
            <span>Switch to Business Panel</span>
          </a>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5 rounded border border-[var(--t2t-border)] bg-[var(--t2t-surface)] px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#14EF10] opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#14EF10]"></span>
            </span>
            <span className="text-[9px] font-semibold text-neutral-400 tracking-wider uppercase">
              Online
            </span>
          </div>

          {/* Notifications */}
          <button
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded border border-[var(--t2t-border)]",
              "text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-surface-hover)] hover:text-[var(--t2t-text)] transition-colors"
            )}
            aria-label="Notifications"
          >
            <Bell size={14} />
            <span className="absolute right-2 top-2 flex h-1 w-1 rounded-full bg-[#14EF10]" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded border border-[var(--t2t-border)]",
              "text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-surface-hover)] hover:text-[var(--t2t-text)] transition-colors"
            )}
            title="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun size={14} className="text-[var(--t2t-text)]" />
            ) : (
              <Moon size={14} className="text-[var(--t2t-text)]" />
            )}
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-2 border-l border-[var(--t2t-border)]">
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--t2t-surface)] border border-[var(--t2t-border)] text-[10px] font-semibold text-[var(--t2t-text)] tracking-wider">
              SA
            </button>
            <div className="hidden text-left lg:block">
              <p className="text-[12px] font-semibold text-[var(--t2t-text)] leading-tight">
                Super Admin
              </p>
              <p className="text-[10px] text-[var(--t2t-text-secondary)] leading-tight">
                Role: Super
              </p>
            </div>
            <button
              onClick={async () => {
                await logoutAction();
                router.push("/login");
              }}
              className="flex h-7 w-7 items-center justify-center rounded border border-[var(--t2t-border)] text-[var(--t2t-text-secondary)] hover:bg-[var(--t2t-surface-hover)] hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <SignOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
