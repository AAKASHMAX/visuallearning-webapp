"use client";

import { PartyPopper, Check, Info } from "lucide-react";

// Shown once, right after signup: everyone gets free access to the study
// material (Notes, NCERT, PYQ, Quiz). Downloads require a subscription.
export function SignupWelcomeModal({ onClose }: { onClose: () => void }) {
  const perks = [
    "All Notes",
    "NCERT Solutions",
    "Previous Year Questions (PYQ)",
    "Quizzes & practice questions",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#062a4d] via-[#0a3b63] to-[#0b5a53] px-6 py-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/15">
            <PartyPopper className="h-8 w-8 text-[#7cf2d0]" />
          </div>
          <h2 className="text-2xl font-black">Congratulations! 🎉</h2>
          <p className="mt-1 text-white/80">Your account is ready</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm font-semibold text-heading">
            You can now access all of this <span className="text-cta">for free</span>:
          </p>
          <ul className="mt-3 space-y-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-text-muted">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00c896]" /> {p}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-xs text-amber-800">
              Downloads (PDFs) and 3D animated videos require a subscription — but reading and
              practising everything above is completely free.
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[#00c896] px-4 py-3 text-sm font-bold text-white transition-all hover:bg-[#00b184]"
          >
            Start Learning
          </button>
        </div>
      </div>
    </div>
  );
}
