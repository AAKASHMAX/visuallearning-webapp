"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, User, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", activePaths: ["/"] },
  { href: "/courses", label: "Courses", activePaths: ["/courses", "/course-details"] },
  { href: "/contact", label: "Contact Us", activePaths: ["/contact"] },
];

export function Navbar() {
  const { isAuthenticated, user, logout, hydrate } = useAuth();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState("");

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, [pathname]);

  function isNavItemActive(item: (typeof navItems)[number]) {
    if (item.href === "/") return pathname === "/" && currentHash !== "#features";
    return item.activePaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  }

  function navLinkClass(active: boolean, mobile = false) {
    if (mobile) {
      return cn(
        "rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300",
        active
          ? "border-accent/60 bg-accent/15 text-accent shadow-[0_0_18px_rgba(0,212,255,0.18)]"
          : "border-border/80 bg-surface-light/95 text-text-bright hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
      );
    }

    return cn(
      "rounded-xl font-medium transition-all duration-300",
      "px-3 py-2 text-sm",
      active
        ? "border border-accent/25 bg-accent/10 text-accent shadow-[0_0_18px_rgba(0,212,255,0.12)]"
        : "text-text-muted hover:bg-surface-light/70 hover:text-accent"
    );
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || isMobileMenuOpen
          ? "glass py-3 shadow-lg shadow-primary/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/images/logo2.png" alt="VL" width={42} height={42} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-bright tracking-tight">
                Physics<span className="text-accent">Lab</span>
              </span>
              <span className="text-[10px] text-text-bright -mt-1 tracking-wider uppercase">
                Visual Learning
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={navLinkClass(isNavItemActive(item))}>
                  {item.label}
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <NotificationBell />
                {user?.role === "ADMIN" && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm" className="border-accent text-accent hover:bg-accent hover:text-primary">
                      Admin Panel
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className={cn(pathname.startsWith("/dashboard") && "border-accent bg-accent/10 text-accent")}>
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" size="sm" className={cn(pathname.startsWith("/profile") && "border-accent bg-accent/10 text-accent")}>
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-text-muted">{user?.name?.split(" ")[0]}</span>
                  <button
                    onClick={logout}
                    className="text-text-muted hover:text-danger transition-colors ml-2"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-muted hover:text-accent transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 rounded-2xl border border-accent/20 bg-primary-dark/95 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(isNavItemActive(item), true)}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border/80 pt-3">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-surface-light/95 px-4 py-3">
                      <span className="text-text-bright text-sm font-semibold">Notifications</span>
                      <NotificationBell />
                    </div>
                    {user?.role === "ADMIN" && (
                      <Link href="/admin/dashboard">
                        <Button variant="outline" size="sm" className="w-full border-accent/50 bg-surface-light/95 text-accent hover:bg-accent hover:text-primary">
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full border-accent/50 bg-surface-light/95 text-accent hover:bg-accent hover:text-primary">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="outline" size="sm" className="w-full border-accent/50 bg-surface-light/95 text-accent hover:bg-accent hover:text-primary">
                        Profile
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={logout} className="w-full border border-border/80 bg-surface-light/95 text-text-bright hover:bg-danger/15 hover:text-danger">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="w-full border border-border/80 bg-surface-light/95 text-text-bright hover:bg-accent/10 hover:text-accent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
