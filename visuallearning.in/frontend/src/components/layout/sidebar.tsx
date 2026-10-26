"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AppDownloadButton } from "./app-download";
import { LanguagePicker } from "./language-picker";
import { isNavigationActive, learningLinks } from "./navigation-links";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuth();
  return <aside className="vl-sidebar">
    <nav aria-label="Learning navigation" className="vl-side-navigation">
      <p className="vl-nav-eyebrow">Your learning space</p>
      {learningLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`vl-side-link${isNavigationActive(pathname, href) ? " is-active" : ""}`} aria-current={isNavigationActive(pathname, href) ? "page" : undefined}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
      <div className="vl-side-divider" /><LanguagePicker />
    </nav>
    <div className="vl-sidebar-bottom">
      <AppDownloadButton className="vl-side-app" />
      <Link href="/courses/virtual-lab" className="vl-side-discover"><Sparkles size={21} /><strong>A little curiosity goes a long way.</strong><span>Explore the virtual lab <ArrowUpRight size={15} /></span></Link>
      {isAuthenticated ? <button type="button" className="vl-side-link vl-logout" onClick={() => { logout(); window.location.href = "/"; }}><LogOut size={18} aria-hidden="true" />Log out</button> : <Link href="/auth/login" className="vl-side-link"><ArrowUpRight size={18} aria-hidden="true" />Sign in to your space</Link>}
    </div>
  </aside>;
}
