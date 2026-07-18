"use client";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

const TG_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

// Floating "Connect Telegram" button — deep-links a logged-in user to our bot
// (t.me/<bot>?start=<userId>) so they get trial reminders / alerts in Telegram.
export function ConnectTelegramButton() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hidden on auth pages, when the bot isn't configured, or for logged-out users
  // (we need their id to link the account).
  if (pathname?.startsWith("/auth")) return null;
  if (!TG_BOT || !user?.id) return null;

  const href = `https://telegram.me/${TG_BOT}?start=${user.id}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Connect Telegram for updates"
      className="group fixed bottom-5 right-5 z-[70] inline-flex items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 shadow-[0_8px_30px_rgba(0,0,0,0.18)] ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(0,0,0,0.24)]"
    >
      <span className="text-sm font-bold text-gray-800">Connect Telegram</span>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#229ED9]">
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" aria-hidden>
          <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
        </svg>
      </span>
    </a>
  );
}
