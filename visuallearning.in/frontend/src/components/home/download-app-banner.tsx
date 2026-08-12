"use client";

import { Check } from "lucide-react";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

// The official Google Play "play" triangle, four-colour.
function GooglePlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <path fill="#00D0FF" d="M47 24C40 28 36 35 36 46v420c0 11 4 18 11 22l245-232L47 24z" />
      <path fill="#00E676" d="M47 24c6-3 14-3 22 2l283 163-60 57L47 24z" />
      <path fill="#FFCA28" d="M352 189l58 33c18 10 18 30 0 40l-58 33-60-57 60-57z" />
      <path fill="#FF3D57" d="M47 488c6 3 14 3 22-2l283-163-60-57L47 488z" />
    </svg>
  );
}

// App-download banner for the top of the home and courses pages. Hidden until
// the app is live on Play (APP_PUBLISHED).
export function DownloadAppBanner() {
  if (!APP_PUBLISHED) return null;

  const perks = ["Learn offline & on the go", "3D videos, notes & quizzes", "Faster, app-only experience"];

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-[#062a4d] via-[#0a3b63] to-[#0b5a53] p-6 shadow-lg">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
            📱 Now on Android
          </span>
          <h2 className="mt-3 text-2xl font-black text-white">Get the Visual Learning app</h2>
          <p className="mt-1 text-sm text-white/70">
            Everything on the website, in your pocket — study anywhere, anytime.
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-1.5 text-xs text-white/85">
                <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" /> {p}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-white px-5 py-3 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
        >
          <GooglePlayGlyph className="h-7 w-7" />
          <span className="text-left leading-tight">
            <span className="block text-[10px] font-semibold uppercase tracking-wide text-gray-500">Get it on</span>
            <span className="block text-base font-black text-gray-900">Google Play</span>
          </span>
        </a>
      </div>
    </div>
  );
}
