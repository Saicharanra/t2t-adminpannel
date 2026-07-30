import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-[#050505] px-4 py-12 antialiased overflow-hidden selection:bg-[#14EF10]/20 selection:text-[#14EF10]">
      {/* Dynamic Background Glow Effects */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#4F772D]/15 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#14EF10]/10 blur-[140px]" />
      
      {/* Subtle Architectural Grid Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Center Card Container */}
      <div className="relative z-10 w-full max-w-[440px] transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
