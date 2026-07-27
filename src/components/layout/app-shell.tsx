"use client";

import { motion } from "framer-motion";
import { useSidebar } from "@/providers/sidebar-provider";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased">
      <Sidebar />
      <Header />
      <motion.main
        initial={false}
        animate={{ marginLeft: isCollapsed ? 68 : 240 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="pt-14"
      >
        <div className="mx-auto max-w-[1600px] p-8">{children}</div>
      </motion.main>
    </div>
  );
}
