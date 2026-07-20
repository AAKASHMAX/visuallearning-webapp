"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bell, LayoutDashboard, Users, FolderOpen, BarChart3, LogOut, CreditCard, Settings, ChevronDown, Globe, MapPin, Ticket, Library, MessageSquareText, Send, Megaphone, Gift, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: Library },
  { href: "/admin/content", label: "Content", icon: FolderOpen },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/telegram", label: "Telegram", icon: Send },
  { href: "/admin/feedback", label: "Feedback", icon: MessageSquareText },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

const settingsSubLinks = [
  { href: "/admin/settings/languages", label: "Languages", icon: Globe },
  { href: "/admin/settings/subscription", label: "Subscription Plans", icon: CreditCard },
  { href: "/admin/settings/coupons", label: "Coupon Codes", icon: Ticket },
  { href: "/admin/settings/contact", label: "Contact Us", icon: MapPin },
  { href: "/admin/settings/announcement", label: "Announcement", icon: Megaphone },
  { href: "/admin/settings/trial", label: "Free Trial", icon: Gift },
  { href: "/admin/settings/leads", label: "Calling Leads", icon: Phone },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);

  return (
    <aside className="w-64 bg-primary-dark text-white min-h-[calc(100vh-4rem)] hidden lg:flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        <>
            {adminLinks.map((link) => (
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
