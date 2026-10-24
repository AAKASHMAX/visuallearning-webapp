"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Smartphone, X } from "lucide-react";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

// A passive invitation: it never takes focus or blocks the page.
export function GetAppModal() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    if (!APP_PUBLISHED) return;
    try { if (localStorage.getItem("vl_get_app_seen")) return; } catch { return; }
    const timer = window.setTimeout(() => setShow(true), 45000);
    return () => window.clearTimeout(timer);
  }, []);
  const dismiss = () => {
    try { localStorage.setItem("vl_get_app_seen", "1"); } catch {}
    setShow(false);
  };
  if (!show || pathname.startsWith("/auth") || pathname.startsWith("/admin") || pathname === "/" || pathname.startsWith("/explore")) return null;
  return <aside className="vl-app-nudge" aria-label="VisualLearning Android app">
    <span className="vl-app-nudge-icon"><Smartphone size={22} /></span>
    <div><strong>Your learning, to go.</strong><a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={dismiss}>Get the Android app <ArrowUpRight size={14} /></a></div>
    <button type="button" onClick={dismiss} aria-label="Dismiss app suggestion" className="vl-icon-button"><X size={16} /></button>
  </aside>;
}
