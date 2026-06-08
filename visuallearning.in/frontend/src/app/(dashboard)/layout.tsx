"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";

// Course browsing is publicly viewable (no login). The actual content viewer
// (/courses/view-course/...) and the rest of the dashboard still require auth.
function isPublicPath(pathname: string) {
  return pathname === "/courses" || pathname.startsWith("/course-details");
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const shell = (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-surface w-full">{children}</main>
      </div>
      <Footer />
    </div>
  );

  return isPublicPath(pathname) ? shell : <AuthGuard>{shell}</AuthGuard>;
}
