export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12 antialiased">
      <div className="w-full max-w-[460px]">
        {children}
      </div>
    </div>
  );
}
