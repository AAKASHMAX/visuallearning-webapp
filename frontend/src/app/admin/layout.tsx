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
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
