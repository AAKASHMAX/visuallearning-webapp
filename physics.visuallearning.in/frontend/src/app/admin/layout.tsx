"use client";

import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/auth/admin-guard";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Login page renders without guard/sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-primary">
        <AdminSidebar />
        <main className="ml-64 p-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
