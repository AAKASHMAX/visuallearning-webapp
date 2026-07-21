"use client";

import { CheckCircle2, Play } from "lucide-react";

// ── Channel details ───────────────────────────────────────────────────────────
const CHANNEL_URL = "https://www.youtube.com/@visuallearning3D";
const CHANNEL_NAME = "Visual Learning";
const SUBSCRIBERS = "3,00,000+";
// ──────────────────────────────────────────────────────────────────────────────

// The real YouTube brand mark: red rounded "play button" with a white triangle.
function YouTubeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <path fill="#fff" d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Social-proof card for the home page: leans on the trust already built with
// the YouTube audience so first-time visitors feel they're in safe hands.
export function YouTubeTrustCard() {
  return (
    <a
      href={CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-2xl border border-red-100 bg-white card-shadow transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg"
    >
      <div className="flex flex-col items-stretch gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
        {/* Brand mark */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 ring-1 ring-red-100 sm:h-16 sm:w-16">
            <YouTubeLogo className="h-9 w-9 sm:h-11 sm:w-11 drop-shadow-sm" />
            <span className="absolute inset-0 rounded-2xl bg-red-500/20 blur-md -z-10" />
          </div>
          <div className="sm:hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-red-600">As seen on YouTube</p>
            <p className="text-lg font-extrabold text-heading">{CHANNEL_NAME}</p>
          </div>
        </div>

        {/* Copy + stat */}
        <div className="min-w-0 flex-1">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs font-semibold uppercase tracking-wide text-red-600">As seen on YouTube</span>
            <CheckCircle2 className="h-4 w-4 text-red-500" />
          </div>
          <h3 className="mt-1 text-xl font-extrabold leading-tight text-heading sm:text-2xl">
            Trusted by <span className="text-red-600">{SUBSCRIBERS}</span> learners
          </h3>
          <p className="mt-1 text-sm text-text-muted">
            The same teaching that grew a {SUBSCRIBERS.replace("+", "")}-strong YouTube community &mdash;
            now with full courses, notes &amp; practice on {CHANNEL_NAME}.
          </p>
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-bold text-white transition-all group-hover:bg-red-700 sm:w-auto">
            <Play className="h-4 w-4" fill="white" /> Visit our channel
          </span>
        </div>
      </div>
    </a>
  );
}
