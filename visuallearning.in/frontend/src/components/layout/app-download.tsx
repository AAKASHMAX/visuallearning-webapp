"use client";

import { ArrowUpRight, Smartphone } from "lucide-react";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

/** The Android app's download button for menus: a card that stands out from the links around it. */
export function AppDownloadButton({ onClick, className = "" }: { onClick?: () => void; className?: string }) {
  if (!APP_PUBLISHED) return null;
  return (
    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" onClick={onClick} className={`vl-app-button ${className}`}>
      <span className="vl-app-button-icon" aria-hidden="true">
        <Smartphone size={19} />
      </span>
      <span className="vl-app-button-text">
        <strong>Get the app</strong>
        <small>Android · Google Play</small>
      </span>
      <ArrowUpRight size={16} aria-hidden="true" />
    </a>
  );
}
