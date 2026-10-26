"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Smartphone, X } from "lucide-react";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

/** When the suggestion may show again (a timestamp); an older "1" just means "now". */
const SEEN_KEY = "vl_get_app_seen";
const DAY = 86_400_000;

/**
 * The Android app suggestion.
 *   Phones: a bottom sheet a few seconds into the visit, with Download and Not now.
 *     Not now brings it back in 3 days, a download in 30. iPhones never see it:
 *     the app is Android only.
 *   Larger screens: the small passive note in the corner, after 45 s.
 */
export function GetAppModal() {
  const [mode, setMode] = useState<"sheet" | "nudge" | null>(null);
  const pathname = usePathname();
  const sheet = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!APP_PUBLISHED) return;
    try {
      if (Date.now() < Number(localStorage.getItem(SEEN_KEY) || 0)) return;
    } catch {
      return;
    }
    const phone = window.matchMedia("(max-width: 767px)").matches;
    if (phone && /iphone|ipad|ipod/i.test(navigator.userAgent)) return;
    const timer = window.setTimeout(() => setMode(phone ? "sheet" : "nudge"), phone ? 4000 : 45000);
    return () => window.clearTimeout(timer);
  }, []);

  const close = (againInDays: number) => {
    try {
      localStorage.setItem(SEEN_KEY, String(Date.now() + againInDays * DAY));
    } catch {}
    setMode(null);
  };

  const hidden = pathname.startsWith("/auth") || pathname.startsWith("/admin");
  useEffect(() => {
    if (mode !== "sheet" || hidden) return;
    sheet.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close(3);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, hidden]);

  if (!mode || hidden) return null;

  if (mode === "sheet") {
    return (
      <div className="vl-app-sheet-backdrop" onClick={() => close(3)}>
        <section
          ref={sheet}
          tabIndex={-1}
          className="vl-app-sheet"
          role="dialog"
          aria-modal="true"
          aria-labelledby="vl-app-sheet-title"
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={() => close(3)} aria-label="Close" className="vl-app-sheet-close">
            <X size={18} />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo2.png" alt="" width={56} height={56} className="vl-app-sheet-logo" />
          <h2 id="vl-app-sheet-title">Get the Visual Learning app</h2>
          <p>3D lessons, notes and quizzes in your pocket — smoother videos, made for your phone.</p>
          <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={() => close(30)} className="vl-app-sheet-download">
            <Smartphone size={18} aria-hidden="true" /> Download on Google Play
          </a>
          <button type="button" onClick={() => close(3)} className="vl-app-sheet-later">
            Not now
          </button>
        </section>
      </div>
    );
  }

  // The homepage ends with its own app invitation.
  if (pathname === "/" || pathname.startsWith("/explore")) return null;
  return (
    <aside className="vl-app-nudge" aria-label="VisualLearning Android app">
      <span className="vl-app-nudge-icon"><Smartphone size={22} /></span>
      <div><strong>Your learning, to go.</strong><a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={() => close(30)}>Get the Android app <ArrowUpRight size={14} /></a></div>
      <button type="button" onClick={() => close(30)} aria-label="Dismiss app suggestion" className="vl-icon-button"><X size={16} /></button>
    </aside>
  );
}
