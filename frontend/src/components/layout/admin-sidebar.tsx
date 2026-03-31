"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FolderOpen, BarChart3, LogOut, CreditCard, Settings, ChevronDown, Globe, MapPin, Ticket, Radio, Video } from "lucide-react";
import { useAuth } from "@/lib/auth";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: FolderOpen },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/teachers", label: "Teachers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const liveClassSubLinks = [
  { href: "/admin/live-classes/students", label: "Students", icon: Users },
  { href: "/admin/live-classes", label: "Go Live", icon: Radio },
];

const teacherLinks = [
  { href: "/admin/live-classes/students", label: "Students", icon: Users },
  { href: "/admin/live-classes", label: "My Live Classes", icon: Video },
  { href: "/admin/live-classes/create", label: "Create Class", icon: Radio },
];

const settingsSubLinks = [
  { href: "/admin/settings/languages", label: "Languages", icon: Globe },
  { href: "/admin/settings/subscription", label: "Subscription Plans", icon: CreditCard },
  { href: "/admin/settings/coupons", label: "Coupon Codes", icon: Ticket },
  { href: "/admin/settings/contact", label: "Contact Us", icon: MapPin },
  { href: "/admin/settings/features", label: "Features", icon: Radio },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const isLiveClassActive = pathname.startsWith("/admin/live-classes");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  const [liveClassOpen, setLiveClassOpen] = useState(isLiveClassActive);

  const isTeacher = user?.role === "TEACHER";
  const mainLinks = isTeacher ? teacherLinks : adminLinks;

  return (
    <aside className="w-64 bg-primary-dark text-white min-h-[calc(100vh-4rem)] hidden lg:flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {isTeacher ? (
          // Teacher: flat links
          mainLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                pathname === link.href
                  ? "bg-accent text-primary-dark"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))
        ) : (
          // Admin: main links + Live Classes submenu + Settings submenu
          <>
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-accent text-primary-dark"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}

            {/* Live Classes with submenu */}
            <button
              onClick={() => setLiveClassOpen(!liveClassOpen)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                isLiveClassActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Video className="w-5 h-5" />
              <span className="flex-1 text-left">Live Classes</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", liveClassOpen && "rotate-180")} />
            </button>

            {liveClassOpen && (
              <div className="ml-4 space-y-1">
                {liveClassSubLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                      pathname === link.href
                        ? "bg-accent text-primary-dark font-medium"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}

            {/* Settings with submenu */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors w-full",
                isSettingsActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="flex-1 text-left">Settings</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", settingsOpen && "rotate-180")} />
            </button>

            {settingsOpen && (
              <div className="ml-4 space-y-1">
                {settingsSubLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                      pathname === link.href
                        ? "bg-accent text-primary-dark font-medium"
                        : "text-white/60 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => { logout(); window.location.href = "/admin/login"; }}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-white/70 hover:bg-white/10 w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
