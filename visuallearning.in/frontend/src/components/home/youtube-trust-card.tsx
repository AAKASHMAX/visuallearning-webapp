"use client";

import { Youtube, CheckCircle2, Play } from "lucide-react";

// ── Channel details ───────────────────────────────────────────────────────────
const CHANNEL_URL = "https://www.youtube.com/@visuallearning3D";
const CHANNEL_NAME = "Visual Learning";
const SUBSCRIBERS = "3,00,000+";
// ──────────────────────────────────────────────────────────────────────────────

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
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/30 sm:h-16 sm:w-16">
            <Youtube className="h-8 w-8 text-white sm:h-9 sm:w-9" fill="white" strokeWidth={1.5} />
            <span className="absolute inset-0 rounded-2xl bg-red-500/40 blur-md -z-10 animate-pulse" />
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
