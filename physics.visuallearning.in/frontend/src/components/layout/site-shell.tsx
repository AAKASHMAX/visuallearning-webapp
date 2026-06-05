"use client";

import { usePathname } from "next/navigation";
import { FeedbackPopup } from "./feedback-popup";
import { FloatingContact } from "./floating-contact";

/**
 * Public content wrapper. Adds the sidebar gutter (lg:pl-64) on the public
 * site, but not under /admin, which renders its own full-width admin shell.
 */
export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  return <div className={isAdmin ? "" : "lg:pl-64"}>{children}</div>;
}

/** Floating public-site widgets — hidden inside the admin panel. */
export function SiteWidgets() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <FeedbackPopup />
      <FloatingContact />
    </>
  );
}
