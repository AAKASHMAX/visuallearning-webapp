"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";

// Only the courses landing (the class grid) and the pricing page are public.
// Moving forward from there — clicking a class card into subjects, content
// types, chapters or any viewer — requires login, as do all other pages.
function isPublicPath(pathname: string) {
  return pathname === "/courses" || pathname.startsWith("/pricing");
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
