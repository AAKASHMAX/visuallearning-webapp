"use client";

import { useEffect } from "react";

// Captures a referral code from ?ref=CODE and remembers it, so a later checkout
// can pre-fill the coupon. (Phase 2 of the affiliate program — the link path.)
export function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref && /^[A-Z0-9]{3,20}$/i.test(ref)) {
        localStorage.setItem("vl_ref", ref.toUpperCase());
      }
    } catch {
      /* ignore */
    }
  }, []);
  return null;
}
