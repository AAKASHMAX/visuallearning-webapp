"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Menu, X, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  linkUrl?: string | null;
  publishedAt?: string | null;
  read: boolean;
}

export function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/subscription", label: "Pricing" },
    { href: "/feedback", label: "Feedback" },
    { href: "/contact", label: "Contact Us" },
  ];

  return (
    <>
    <nav className="bg-primary-dark bg-gradient-to-r from-primary-dark to-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-0 font-bold">
            <Image src="/images/logo2.png" alt="VL" width={42} height={42} className="rounded-md" priority />
            <span className="text-white leading-none text-base text-center">Visual<br />Learning</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative py-1 text-sm font-medium transition-all duration-200 hover:text-accent",
                    isActive ? "text-accent" : "text-white/90"
                  )}
                  prefetch
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                  )}
                </Link>
              );
            })}

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-4 ml-2">
                <NotificationBell />
                <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
                  <Button variant="accent" size="sm">Dashboard</Button>
                </Link>
                <Link 
                  href="/profile" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm",
                    pathname === "/profile" ? "bg-accent text-primary-dark" : "bg-white/10 hover:bg-white/20"
                  )}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button onClick={() => { logout(); window.location.href = "/"; }} className="hover:text-accent ml-2">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : mounted ? (
              <div className="flex items-center gap-3">
                <Link href="/auth/login"><Button variant="ghost" size="sm" className="text-white">Login</Button></Link>
                <Link href="/auth/signup"><Button variant="accent" size="sm">Sign Up</Button></Link>
              </div>
            ) : null}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {mounted && isAuthenticated && <NotificationBell />}
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block py-2.5 px-4 rounded-xl text-sm font-black transition-all",
                    isActive ? "bg-accent text-primary-dark" : "hover:text-accent"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            {mounted && isAuthenticated ? (
              <>
                <div className="px-4 py-2">
                  <NotificationBell align="left" />
                </div>
                <Link 
                  href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} 
                  className={cn(
                    "block py-2.5 px-4 rounded-xl text-sm font-black",
                    (pathname === "/dashboard" || pathname === "/admin/dashboard") ? "bg-accent text-primary-dark" : "hover:text-accent"
                  )} 
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className={cn(
                    "block py-2.5 px-4 rounded-xl text-sm font-black",
                    pathname === "/profile" ? "bg-accent text-primary-dark" : "hover:text-accent"
                  )} 
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button onClick={() => { logout(); window.location.href = "/"; }} className="block py-2 text-red-300 w-full text-left px-4">Logout</button>
              </>
            ) : mounted ? (
              <>
                <Link href="/auth/login" className="block py-2 hover:text-accent px-4" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="block py-2 hover:text-accent px-4" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
    </>
  );
}

function NotificationBell({ align = "right" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/notifications");
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const markRead = async () => {
    if (unreadCount <= 0) return;
    try {
      await api.post("/notifications/mark-read");
      setUnreadCount(0);
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch {
      // Keep the dot if marking fails.
    }
  };

  const toggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) markRead();
  };

  const totalCount = notifications.length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-orange-600 text-primary-dark shadow-lg shadow-orange-500/30 ring-1 ring-white/30 transition-all hover:scale-105 hover:shadow-orange-400/50"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-white drop-shadow-sm" strokeWidth={2.6} />
        {totalCount > 0 && (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black leading-none ring-2 ring-white",
              hasUnread ? "bg-red-500 text-white" : "bg-white text-primary-dark"
            )}
          >
            {hasUnread && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />}
            <span className="relative">{totalCount > 9 ? "9+" : totalCount}</span>
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          "absolute top-11 z-[60] w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl",
          align === "right" ? "right-0" : "left-0"
        )}>
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-black">Notifications</p>
              <p className="text-[11px] text-gray-500">{notifications.length} published updates</p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet.</div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id} className="border-b border-gray-50 px-4 py-3 last:border-0">
                  <div className="mb-1 flex items-start gap-2">
                    <span className={cn(
                      "mt-1 h-2 w-2 shrink-0 rounded-full",
                      notification.type === "ALERT" ? "bg-red-500" :
                      notification.type === "WARNING" ? "bg-amber-500" :
                      notification.type === "SUCCESS" ? "bg-emerald-500" : "bg-sky-500"
                    )} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">{notification.title}</p>
                      <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-gray-500">{notification.message}</p>
                      {notification.linkUrl && (
                        <a href={notification.linkUrl} className="mt-2 inline-block text-xs font-bold text-primary hover:underline">
                          Open link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
