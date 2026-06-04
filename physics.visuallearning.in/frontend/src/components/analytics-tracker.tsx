"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Sends a GA4 `page_view` on every client-side route change.
 *
 * Next.js navigates without a full page reload, so the gtag `config` call in
 * the layout only records the FIRST page. This fires a pageview for each
 * subsequent navigation. The very first load is skipped here because gtag's
 * `config` already sends it (prevents double-counting the landing page).
 */
export function AnalyticsTracker({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (!gtag || !gaId) return;

    const url = pathname + window.location.search;
    gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
      send_to: gaId,
    });
  }, [pathname, gaId]);

  return null;
}
