"use client";
import { usePathname } from "next/navigation";

// Floating "Email Us" button — opens the mail client to support.
const EMAIL = "visuallearning247@gmail.com";

export function EmailButton() {
  const pathname = usePathname();
  // Hidden on the sign-in / sign-up pages.
  if (pathname?.startsWith("/auth")) return null;
  return (
    <a
      href={`mailto:${EMAIL}`}
      aria-label="Email us"
      className="group fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.24)]"
    >
      <span className="text-sm font-bold text-gray-800">Email Us</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1A3263]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3.5 7.5 8.5 6 8.5-6" />
        </svg>
      </span>
    </a>
  );
}
