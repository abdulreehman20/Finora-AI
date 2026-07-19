import { DashboardNavbar } from "./_components/navbar-dashboard";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-[oklch(0.06_0.01_145)]">
      <DashboardNavbar />
      {children}
    </div>
  );
}
