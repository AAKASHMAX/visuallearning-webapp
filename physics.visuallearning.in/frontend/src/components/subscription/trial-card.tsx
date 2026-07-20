"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Check, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";

// 3-day free trial card: full access for 3 days, activated in one click with no
// payment step at all. Hidden for users who already have an active subscription
// or have already used their trial.
export function TrialCard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [show, setShow] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    api
      .get("/subscription/my-subscription")
      .then(({ data }) => {
        const active = data && data.status === "ACTIVE" && (!data.expiryDate || new Date(data.expiryDate) > new Date());
        const usedTrial = data && data.plan === "TRIAL";
        setShow(!active && !usedTrial);
      })
      .catch(() => setShow(true)); // not logged in / no subscription -> eligible
  }, []);

  if (!show) return null;

  async function startTrial() {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/pricing");
      return;
    }
    setPaying(true);
    try {
      const { data } = await api.post("/subscription/activate-free", { plan: "TRIAL" });
      toast.success(data?.message || "Free trial activated!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Could not start your free trial");
      setPaying(false);
    }
  }

  const perks = [
    "All Physics courses & chapters",
    "3D videos, notes, NCERT, PYQ & quizzes",
    "Full access for 3 days",
  ];

  return (
    <div className="mx-auto max-w-5xl mb-10 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-card to-secondary/10 p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
            <Gift className="h-3.5 w-3.5" /> LIMITED-TIME OFFER
          </span>
          <h2 className="mt-3 text-2xl font-bold text-text-bright">Start your 3-day free trial</h2>
          <p className="mt-1 text-sm text-text-muted">
            Unlock everything for 3 days. No payment required — no card, no charge.
          </p>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-text-bright">
                <Check className="h-4 w-4 shrink-0 text-accent" /> {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full shrink-0 lg:w-64">
          <div className="rounded-xl border border-border bg-card/60 p-4 text-center">
            <div className="text-3xl font-extrabold text-text-bright">
              ₹0<span className="ml-1 align-middle text-sm font-semibold text-text-muted">/ 3 days</span>
            </div>
            <div className="mt-0.5 text-[11px] text-text-muted">No payment required</div>
            <button
              onClick={startTrial}
              disabled={paying}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-primary transition-all hover:bg-accent/90 disabled:opacity-60"
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Free Trial"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
