import { Leaf } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding Panel */}
      <div className="hidden w-[480px] flex-col justify-between bg-[var(--t2t-primary)] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Leaf size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-white">T2T Admin</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold leading-tight text-white">
            Trash2Treasure
            <br />
            Operations Center
          </h1>
          <p className="mt-4 text-base text-white/70 leading-relaxed">
            Manage users, businesses, waste submissions, rewards, and analytics
            — all from one secure dashboard.
          </p>
        </div>
        <p className="text-sm text-white/50">
          © {new Date().getFullYear()} Trash2Treasure. All rights reserved.
        </p>
      </div>

      {/* Right: Auth Content */}
      <div className="flex flex-1 items-center justify-center bg-[var(--t2t-bg)] p-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
