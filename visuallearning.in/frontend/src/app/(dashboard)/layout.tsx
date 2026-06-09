"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";

// Everything under /courses and /course-details is freely explorable without
// login. Locked (paid) content is still enforced by the backend — opening it
// returns 401/403, which sends the user to login at that moment.
//
// Exceptions that still require login: the personal account pages
// (/dashboard, /profile) and the checkout/custom-plan flows.
const ALWAYS_GATED = ["/courses/custom-plan", "/courses/my-custom-plan"];

function isPublicPath(pathname: string) {
  if (ALWAYS_GATED.some((p) => pathname === p || pathname.startsWith(p + "/"))) return false;
  return pathname.startsWith("/courses") || pathname.startsWith("/course-details") || pathname.startsWith("/pricing");
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
