"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, User, MessageSquare, Phone, CreditCard, LogOut, Gift } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/affiliate", label: "Earn (Affiliate)", icon: Gift },
  { href: "/contact", label: "Contact Us", icon: Phone },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)] hidden lg:flex flex-col sticky top-16">
      <nav className="p-4 space-y-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={() => { logout(); window.location.href = "/"; }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
