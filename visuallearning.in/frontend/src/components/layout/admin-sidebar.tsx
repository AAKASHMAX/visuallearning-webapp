"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { adminLinks, isNavigationActive, settingsLinks } from "./navigation-links";

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const isSettingsActive = pathname.startsWith("/admin/settings");
  const [settingsOpen, setSettingsOpen] = useState(isSettingsActive);
  useEffect(() => { if (isSettingsActive) setSettingsOpen(true); }, [isSettingsActive]);
  return <aside className="vl-sidebar vl-admin-sidebar">
    <nav className="vl-side-navigation" aria-label="Administration navigation">
      <p className="vl-nav-eyebrow">Workspace / Admin</p>
      {adminLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`vl-side-link${isNavigationActive(pathname, href) ? " is-active" : ""}`} aria-current={isNavigationActive(pathname, href) ? "page" : undefined}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
      <div className="vl-side-divider" />
      <button type="button" className={`vl-side-link${isSettingsActive ? " is-active" : ""}`} onClick={() => setSettingsOpen(!settingsOpen)} aria-expanded={settingsOpen} aria-controls="admin-settings-links"><Settings size={18} /><span>Settings</span><ChevronDown size={15} className={settingsOpen ? "vl-chevron-open" : ""} /></button>
      {settingsOpen && <div className="vl-settings-sublinks" id="admin-settings-links"><Link href="/admin/settings" className="vl-side-link">All settings</Link>{settingsLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`vl-side-link${pathname === href ? " is-active" : ""}`} aria-current={pathname === href ? "page" : undefined}><Icon size={15} /><span>{label}</span></Link>)}</div>}
    </nav>
    <div className="vl-sidebar-bottom"><button type="button" className="vl-side-link vl-logout" onClick={() => { logout(); window.location.href = "/admin/login"; }}><LogOut size={18} />Log out</button></div>
  </aside>;
}
