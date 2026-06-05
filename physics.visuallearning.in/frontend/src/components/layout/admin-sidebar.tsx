"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  Tag,
  MapPin,
  Bell,
  MessageSquareText,
  LogOut,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Courses", href: "/admin/courses", icon: BookOpen },
  { label: "Content", href: "/admin/content", icon: Library },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquareText },
  { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
];

const settingsSubLinks = [
  { label: "Subscription Plans", href: "/admin/settings/subscription", icon: CreditCard },
  { label: "Coupon Codes", href: "/admin/coupons", icon: Tag },
  { label: "Contact Us", href: "/admin/settings/contact", icon: MapPin },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isSettingsActive =
    pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/coupons");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <Image src="/images/logo2.png" alt="VL" width={36} height={36} className="rounded-md" />
          <div>
            <span className="text-sm font-bold text-text-bright">
              Physics<span className="text-accent">Lab</span>
            </span>
            <p className="text-[10px] text-text-bright">Visual Learning</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-text-muted hover:text-text-bright hover:bg-surface-light"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {/* Settings with submenu */}
        <button
          onClick={() => setSettingsOpen((v) => !v)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            isSettingsActive
              ? "bg-surface-light text-text-bright"
              : "text-text-muted hover:text-text-bright hover:bg-surface-light"
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="flex-1 text-left">Settings</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform", settingsOpen && "rotate-180")} />
        </button>

        {settingsOpen && (
          <div className="ml-3 space-y-1 border-l border-border pl-2">
            {settingsSubLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-text-muted hover:text-text-bright hover:bg-surface-light"
                  )}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-muted hover:text-text-bright hover:bg-surface-light transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Site
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-danger hover:bg-danger/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
