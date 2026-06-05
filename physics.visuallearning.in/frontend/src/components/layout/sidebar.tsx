"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Home, BookOpen, PlayCircle, CreditCard, Phone, LayoutDashboard, User, LogOut, LogIn } from "lucide-react";

const homeLink = { href: "/", label: "Home", icon: Home, match: ["/"] };
const publicLinks = [
  { href: "/courses", label: "Courses", icon: BookOpen, match: ["/courses", "/course-details"] },
  { href: "/demo", label: "Demo", icon: PlayCircle, match: ["/demo"] },
  { href: "/pricing", label: "Subscription", icon: CreditCard, match: ["/pricing", "/subscription"] },
  { href: "/contact", label: "Contact", icon: Phone, match: ["/contact"] },
];

const dashboardLink = { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: ["/dashboard"] };
const profileLink = { href: "/profile", label: "Profile", icon: User, match: ["/profile"] };

export function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout, hydrate } = useAuth();
  useEffect(() => { hydrate(); }, [hydrate]);

  // The admin section has its own sidebar/layout; don't render the public one there.
  if (pathname.startsWith("/admin")) return null;

  const isActive = (match: string[]) => match.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const itemClass = (active: boolean) =>
    cn(
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
      active
        ? "border border-accent/25 bg-accent/10 text-accent shadow-[0_0_18px_rgba(0,212,255,0.12)]"
        : "text-text-muted hover:bg-surface-light/70 hover:text-text-bright"
    );

  // Order: Home, Dashboard, Courses, Demo, Subscription, Contact, Profile
  const navItems = isAuthenticated
    ? [homeLink, dashboardLink, ...publicLinks, profileLink]
    : [homeLink, ...publicLinks];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-50 w-64 flex-col border-r border-border bg-primary-dark/95 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-3 border-b border-border/60 px-5 py-[18px]">
        <Image src="/images/logo2.png" alt="VL" width={40} height={40} className="rounded-md" />
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-text-bright">Physics<span className="text-accent">Lab</span></span>
          <span className="-mt-1 text-[10px] uppercase tracking-wider text-text-muted">Visual Learning</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-5">
        {navItems.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.href} href={l.href} className={itemClass(isActive(l.match))}>
              <Icon className="h-4 w-4 shrink-0" />
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-border/60 p-3">
        {isAuthenticated ? (
          <>
            {user?.role === "ADMIN" && (
              <Link href="/admin/dashboard" className={itemClass(isActive(["/admin"]))}>
                <LayoutDashboard className="h-4 w-4 shrink-0" />Admin Panel
              </Link>
            )}
            <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-muted transition-all hover:bg-danger/10 hover:text-danger">
              <LogOut className="h-4 w-4 shrink-0" />Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-bright transition-all hover:border-accent/40 hover:text-accent">
              <LogIn className="h-4 w-4" />Login
            </Link>
            <Link href="/auth/signup" className="flex items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-primary transition-all hover:bg-accent/90">
              Get Started
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
