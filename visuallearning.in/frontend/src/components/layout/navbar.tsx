"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Bell, ChevronDown, LayoutDashboard, LogOut, Menu, Settings, Smartphone, User, X } from "lucide-react";
import { usePathname } from "next/navigation";
import api from "@/lib/api";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";
import { Brand } from "./brand";
import { LanguagePicker } from "./language-picker";
import { adminLinks, isNavigationActive, learningLinks, publicLinks, settingsLinks } from "./navigation-links";

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
  const [accountOpen, setAccountOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuTrigger = useRef<HTMLButtonElement>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);
  const account = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === "ADMIN";
  const signedIn = mounted && isAuthenticated;
  const onAdminPage = pathname.startsWith("/admin");
  const handleLogout = () => { logout(); window.location.href = onAdminPage ? "/admin/login" : "/"; };

  useEffect(() => { hydrate(); setMounted(true); }, [hydrate]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setMenuOpen(false); setAccountOpen(false); }, [pathname]);
  useEffect(() => {
    const onPointer = (event: PointerEvent) => { if (!account.current?.contains(event.target as Node)) setAccountOpen(false); };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountOpen(false);
        if (menuOpen) { setMenuOpen(false); menuTrigger.current?.focus(); }
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = mobilePanel.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (!items?.length) return;
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); menuTrigger.current?.focus(); }
      if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); menuTrigger.current?.focus(); }
      if (event.shiftKey && document.activeElement === menuTrigger.current) { event.preventDefault(); items[items.length - 1].focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKey); };
  }, [menuOpen]);
  const mobileLinks = onAdminPage && isAdmin ? adminLinks : learningLinks;

  return <header className={`vl-navbar${pathname === "/" ? " is-home" : ""}${scrolled ? " is-scrolled" : ""}${menuOpen ? " is-menu-open" : ""}`}>
    <nav className="vl-navbar-inner" aria-label="Main navigation">
      <Brand />
      <div className="vl-desktop-nav">
        {publicLinks.map((link) => <Link key={link.href} href={link.href} className={isNavigationActive(pathname, link.href) ? "is-active" : ""} aria-current={isNavigationActive(pathname, link.href) ? "page" : undefined}>{link.label}</Link>)}
      </div>
      <div className="vl-navbar-actions">
        {signedIn ? <>
          <div className="vl-desktop-language"><LanguagePicker compact /></div>
          <NotificationBell />
          <div className="vl-account" ref={account}>
            <button type="button" className="vl-account-trigger" onClick={() => setAccountOpen(!accountOpen)} aria-label="Open account menu" aria-expanded={accountOpen} aria-controls="account-menu"><span className="vl-avatar">{user?.name?.charAt(0).toUpperCase() || "V"}</span><ChevronDown size={13} aria-hidden="true" /></button>
            {accountOpen && <div className="vl-account-menu" id="account-menu">
              <div className="vl-account-summary"><strong>{user?.name || "Your account"}</strong><span>{user?.email}</span></div>
              <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} onClick={() => setAccountOpen(false)}><LayoutDashboard size={16} />Dashboard</Link>
              <Link href="/profile" onClick={() => setAccountOpen(false)}><User size={16} />My profile</Link>
              {isAdmin && <Link href="/admin/settings" onClick={() => setAccountOpen(false)}><Settings size={16} />Admin settings</Link>}
              <button type="button" onClick={handleLogout}><LogOut size={16} />Log out</button>
            </div>}
          </div>
        </> : <>
          <Link href="/auth/login" className="vl-login-link">Log in</Link>
          <Link href="/auth/signup" className="vl-nav-cta">Get started <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </>}
        <button ref={menuTrigger} className="vl-mobile-toggle vl-icon-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>
    </nav>
    {menuOpen && <>
      <button type="button" className="vl-mobile-backdrop" aria-label="Close navigation menu" onClick={() => setMenuOpen(false)} tabIndex={-1} />
      <div className="vl-mobile-panel" id="mobile-navigation" ref={mobilePanel}>
        <nav aria-label="Mobile navigation">
          <p className="vl-nav-eyebrow">{signedIn ? onAdminPage && isAdmin ? "Your workspace" : "Your learning space" : "Discover something new"}</p>
          {signedIn ? mobileLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`vl-side-link${isNavigationActive(pathname, href) ? " is-active" : ""}`} aria-current={isNavigationActive(pathname, href) ? "page" : undefined} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span><ArrowUpRight size={15} /></Link>) : publicLinks.map((link) => <Link key={link.href} href={link.href} className="vl-mobile-public-link" onClick={() => setMenuOpen(false)}>{link.label}<ArrowUpRight size={20} /></Link>)}
          {signedIn && isAdmin && <div className="vl-mobile-settings"><p className="vl-nav-eyebrow">Administration</p>{!onAdminPage && adminLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="vl-side-link" onClick={() => setMenuOpen(false)}><Icon size={17} /><span>{label}</span></Link>)}<Link href="/admin/settings" className="vl-side-link" onClick={() => setMenuOpen(false)}><Settings size={17} /><span>All settings</span></Link>{settingsLinks.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className={`vl-side-link${pathname === href ? " is-active" : ""}`} onClick={() => setMenuOpen(false)}><Icon size={16} /><span>{label}</span></Link>)}</div>}
          <div className="vl-mobile-extra">
            {signedIn && <><LanguagePicker /><Link href="/demo" className="vl-side-link" onClick={() => setMenuOpen(false)}>Explore demos <ArrowUpRight size={16} /></Link></>}
            <Link href="/contact" className="vl-side-link" onClick={() => setMenuOpen(false)}>Get in touch <ArrowUpRight size={16} /></Link>
            {APP_PUBLISHED && <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="vl-side-link" onClick={() => setMenuOpen(false)}><Smartphone size={17} /><span>Get the Android app</span><ArrowUpRight size={16} /></a>}
            {signedIn ? <button type="button" className="vl-side-link vl-logout" onClick={handleLogout}><LogOut size={17} />Log out</button> : <div className="vl-mobile-auth"><Link href="/auth/login" onClick={() => setMenuOpen(false)}>Log in</Link><Link href="/auth/signup" className="vl-nav-cta" onClick={() => setMenuOpen(false)}>Start learning <ArrowRight size={16} /></Link></div>}
          </div>
        </nav>
      </div>
    </>}
  </header>;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      if (active) setLoading(true);
      try {
        const { data } = await api.get("/notifications");
        if (active) { setNotifications(data.data.notifications || []); setUnreadCount(data.data.unreadCount || 0); }
      } catch {
        // Preserve the last successful result during a temporary connection error.
      } finally { if (active) setLoading(false); }
    };
    loadNotifications();
    const timer = window.setInterval(loadNotifications, 60000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeOnEscape); };
  }, [open]);
  const toggleOpen = async () => {
    setOpen(!open);
    if (!open && unreadCount > 0) {
      try {
        await api.post("/notifications/mark-read");
        setUnreadCount(0);
        setNotifications((items) => items.map((item) => ({ ...item, read: true })));
      } catch { /* Leave unread state intact if the update failed. */ }
    }
  };
  return <div className="vl-notifications" ref={root}>
    <button ref={trigger} type="button" onClick={toggleOpen} className="vl-icon-button" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"} aria-expanded={open} aria-controls="notification-panel"><Bell size={19} aria-hidden="true" />{unreadCount > 0 && <span className="vl-notification-dot" />}</button>
    {open && <section className="vl-notification-panel" id="notification-panel" aria-label="Notifications">
      <div className="vl-notification-heading"><div><h2>You’re in the loop.</h2><p>Updates from VisualLearning</p></div><button type="button" className="vl-icon-button" aria-label="Close notifications" onClick={() => setOpen(false)}><X size={18} /></button></div>
      <div className="vl-notification-list">
        {loading && notifications.length === 0 ? <p className="vl-notification-empty" role="status">Loading your updates…</p> : notifications.length === 0 ? <div className="vl-notification-empty"><Bell size={26} /><strong>All quiet for now</strong><span>Your learning updates will appear here.</span></div> : notifications.map((notification) => <article key={notification.id} className="vl-notification-item"><span className={`vl-notification-type type-${notification.type.toLowerCase()}`} /><div><h3>{notification.title}</h3><p>{notification.message}</p>{notification.linkUrl && <a href={notification.linkUrl}>View update <ArrowUpRight size={13} /></a>}</div></article>)}
      </div>
    </section>}
  </div>;
}
