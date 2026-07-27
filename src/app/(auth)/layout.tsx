import { Leaf } from "@phosphor-icons/react/dist/ssr";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left: Branding Panel */}
      <div className="hidden w-[400px] flex-col justify-between bg-black border-r border-[#1a1a1a] p-10 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#14EF10]">
            <Leaf size={18} weight="bold" className="text-black" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight">T2T Admin</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight text-white tracking-tight">
            Trash2Treasure
            <br />
            Operations Center
          </h1>
          <p className="mt-4 text-xs text-neutral-400 leading-relaxed">
            Manage users, businesses, waste submissions, rewards, and analytics
            — all from one secure dashboard.
          </p>
        </div>
        <p className="text-[10px] text-neutral-600">
          © {new Date().getFullYear()} Trash2Treasure. All rights reserved.
        </p>
      </div>

      {/* Right: Auth Content */}
      <div className="flex flex-1 items-center justify-center bg-black p-6">
        <div className="w-full max-w-[360px]">{children}</div>
      </div>
    </div>
  );
}
