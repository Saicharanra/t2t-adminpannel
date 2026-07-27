"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Sun, Moon, Sparkles } from "lucide-react";
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
      animate={{ paddingLeft: isCollapsed ? 72 : 280 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed right-0 top-0 z-30 flex h-[72px] items-center border-b border-[#ECECEC] bg-[#FFFFFF] text-[#111111]"
      style={{ left: 0 }}
    >
      <div className="flex w-full items-center justify-between px-8">
        {/* Left: Current Page Title */}
        <div className="flex items-center">
          <h1 className="text-[20px] font-semibold text-[#111111] tracking-tight">
            {pageTitle}
          </h1>
        </div>

        {/* Center: Large Search Bar */}
        <div className="mx-6 hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
            />
            <input
              type="text"
              placeholder="Search across T2T system..."
              className="h-10 w-full rounded-lg border border-[#EAEAEA] bg-[#FAFAFA] pl-10 pr-4 text-[14px] text-[#111111] placeholder:text-[#6B7280] focus:border-[#4F772D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4F772D] transition-all"
            />
          </div>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center gap-4">
          {/* Status Badge */}
          <div className="flex items-center gap-1.5 rounded-full border border-[#EAEAEA] bg-[#FAFAFA] px-2.5 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#16A34A] opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#16A34A]"></span>
            </span>
            <span className="text-[11px] font-semibold text-[#6B7280] tracking-wider uppercase">
              Online
            </span>
          </div>

          {/* Notifications */}
          <button
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-lg border border-[#EAEAEA]",
              "text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors"
            )}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute right-2.5 top-2.5 flex h-1.5 w-1.5 rounded-full bg-[#4F772D]" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-[#EAEAEA]",
              "text-[#6B7280] hover:bg-[#FAFAFA] hover:text-[#111111] transition-colors"
            )}
            title="Toggle theme"
          >
            {mounted && resolvedTheme === "dark" ? (
              <Sun size={18} className="text-[#FEFAE0]" />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {/* User Profile Info */}
          <div className="flex items-center gap-3 pl-2 border-l border-[#EAEAEA]">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4F772D] text-xs font-semibold text-white tracking-wider">
              SA
            </button>
            <div className="hidden text-left lg:block">
              <p className="text-sm font-semibold text-[#111111] leading-tight">
                Super Admin
              </p>
              <p className="text-[11px] text-[#6B7280] leading-tight">
                Role: Super
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
