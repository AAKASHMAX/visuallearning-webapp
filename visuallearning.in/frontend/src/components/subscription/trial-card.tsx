"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Gift, Check, Info } from "lucide-react";
import toast from "react-hot-toast";

type Trial = { enabled: boolean; label: string; durationDays: number };
const DEFAULT_TRIAL: Trial = { enabled: true, label: "3-Day Free Trial", durationDays: 3 };

// Free-trial card. Duration, name and on/off all come from the admin panel
// (Settings -> Free Trial). Activated in one click with no payment step at all.
// Full access for the trial window, minus document downloads. Hidden for users
// who already have an active subscription. Logged-out visitors (e.g. on the
// public home page) are routed to sign up first (a trial is one per account).
export function TrialCard() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasSub, setHasSub] = useState(false);
  const [starting, setStarting] = useState(false);
  const [trial, setTrial] = useState<Trial>(DEFAULT_TRIAL);

  useEffect(() => {
    // Public endpoint — works for logged-out visitors too.
    api.get("/admin/public-settings")
      .then(({ data }) => { if (data?.data?.trial) setTrial({ ...DEFAULT_TRIAL, ...data.data.trial }); })
      .catch(() => {});

    const token = typeof window !== "undefined" ? localStorage.getItem("vl_token") : null;
    if (!token) { setLoggedIn(false); setReady(true); return; }
    setLoggedIn(true);
    api
      .get("/subscription/my-subscription")
      .then(({ data }) => {
        const subs = Array.isArray(data?.data) ? data.data : [];
        setHasSub(subs.length > 0); // has an active subscription -> not eligible
      })
      .catch(() => setHasSub(false)) // on error still show; backend enforces eligibility
      .finally(() => setReady(true));
  }, []);

  const startTrial = async () => {
    setStarting(true);
    try {
      await api.post("/subscription/start-trial", {});
      toast.success(`Your ${trial.durationDays}-day free trial is active!`);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not start your free trial");
      setStarting(false);
    }
  };

  if (!ready || hasSub || !trial.enabled) return null;

  const days = `${trial.durationDays} day${trial.durationDays === 1 ? "" : "s"}`;
  const perks = [
    "All classes, subjects & chapters",
    "3D animated videos, notes, NCERT, PYQ & quizzes",
    `Full access for ${days} — cancel anytime`,
  ];

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#00c896]/30 bg-gradient-to-br from-[#062a4d] via-[#0a3b63] to-[#0b5a53] p-6 shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00c896]/20 px-3 py-1 text-xs font-bold text-[#7cf2d0]">
            <Gift className="h-3.5 w-3.5" /> LIMITED-TIME OFFER
          </span>
          <h2 className="mt-3 text-2xl font-black text-white">
            {loggedIn ? `Start your ${trial.durationDays}-day free trial` : `Sign up & get a ${trial.durationDays}-day free trial`}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {loggedIn
              ? `Unlock the entire platform free for ${days}. No payment required — no card, no charge.`
              : `Create your free account and instantly unlock the entire platform for ${days}. No payment required — no card, no charge.`}
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-white/85">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00c896]" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-white/55">
            <Info className="h-3.5 w-3.5" /> Document (PDF) downloads are not included in the trial.
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl bg-white/10 p-4 text-center backdrop-blur">
            <div className="text-3xl font-black text-white">
              ₹0<span className="ml-1 align-middle text-sm font-semibold text-white/60">/ {days}</span>
            </div>
            <div className="mt-0.5 text-[11px] text-white/55">No payment required</div>
            {loggedIn ? (
              <button
                onClick={startTrial}
                disabled={starting}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#00c896] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#00b184] disabled:opacity-60"
              >
                {starting ? "Activating..." : "Start Free Trial"}
              </button>
            ) : (
              <Link
                href="/auth/signup?redirect=/courses"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-[#00c896] px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-[#00b184]"
              >
                Sign Up &amp; Get Free Trial
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
