"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, FolderOpen, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/content", label: "Content", icon: FolderOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-primary-dark text-white min-h-[calc(100vh-4rem)] hidden lg:flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {links.map((link) => (
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
