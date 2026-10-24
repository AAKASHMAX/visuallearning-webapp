"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminGuard } from "@/components/auth/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <AdminGuard>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1">
          <AdminSidebar />
          <main id="main-content" className="admin-shell flex-1 min-w-0 p-6 bg-surface">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
