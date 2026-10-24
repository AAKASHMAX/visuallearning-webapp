"use client";

import { usePathname } from "next/navigation";
import { BookOpen } from "lucide-react";

export function TelegramNotesButton() {
  const pathname = usePathname();
  if (pathname?.startsWith("/auth") || pathname?.startsWith("/admin") || pathname === "/" || pathname?.startsWith("/explore")) return null;
  return <a href="https://telegram.me/visuallearning3D" target="_blank" rel="noopener noreferrer" aria-label="Get free notes on our Telegram channel" className="vl-telegram-notes"><BookOpen size={18} aria-hidden="true" /><span>Free notes</span></a>;
}
