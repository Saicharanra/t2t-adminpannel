"use client";

import { usePathname } from "next/navigation";
import { MagnifyingGlass, Bell, Sun, Moon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/providers/sidebar-provider";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

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
  const { resolvedTheme, setTheme } = useTheme();
  const { isCollapsed } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pageTitle = routeTitles[pathname] || "Admin Panel";

  return (
    <motion.header
      initial={false}
      animate={{ paddingLeft: isCollapsed ? 68 : 240 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed right-0 top-0 z-30 flex h-14 items-center border-b border-[#1a1a1a] bg-black text-[#eaeaea]"
      style={{ left: 0 }}
    >
      <div className="flex w-full items-center justify-between px-8">
        {/* Left: Current Page Title */}
        <div className="flex items-center">
          <h1 className="text-[18px] font-semibold text-white tracking-tight">
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
              className="h-8 w-full rounded border border-[#1a1a1a] bg-[#0a0a0a] pl-9 pr-4 text-[13px] text-white placeholder:text-neutral-500 focus:border-[#5CE65C] focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 rounded border border-[#1a1a1a] bg-[#0a0a0a] px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
            </span>
            <span className="text-[9px] font-semibold text-neutral-400 tracking-wider uppercase">
              Online
            </span>
          </div>

          {/* Notifications */}
          <button
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded border border-[#1a1a1a]",
              "text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
            )}
            aria-label="Notifications"
          >
            <Bell size={14} />
            <span className="absolute right-2 top-2 flex h-1 w-1 rounded-full bg-[#5CE65C]" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded border border-[#1a1a1a]",
              "text-neutral-400 hover:bg-neutral-900 hover:text-white transition-colors"
            )}
            title="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun size={14} className="text-white" />
            ) : (
              <Moon size={14} />
            )}
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#1a1a1a]">
            <button className="flex h-7 w-7 items-center justify-center rounded-full bg-[#111111] border border-[#222222] text-[10px] font-semibold text-white tracking-wider">
              SA
            </button>
            <div className="hidden text-left lg:block">
              <p className="text-[12px] font-semibold text-white leading-tight">
                Super Admin
              </p>
              <p className="text-[10px] text-neutral-500 leading-tight">
                Role: Super
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
