"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import api from "@/lib/api";
import { Gift, Check, Info } from "lucide-react";

// "7-Day Free Trial" card for the courses page. Free access to everything for
// 7 days (no document downloads); Razorpay collects its ₹1 minimum as a
// transaction fee. Hidden for users who already have an active subscription.
export function TrialCard() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    api
      .get("/subscription/my-subscription")
      .then(({ data }) => {
        const subs = Array.isArray(data?.data) ? data.data : [];
        setShow(subs.length === 0); // no active subscription -> eligible to see the trial
      })
      .catch(() => setShow(true)); // on error, still show; the backend enforces eligibility
  }, []);

  if (!show) return null;

  const perks = [
    "All classes, subjects & chapters",
    "3D animated videos, notes, NCERT, PYQ & quizzes",
    "Full access for 7 days — cancel anytime",
  ];

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#00c896]/30 bg-gradient-to-br from-[#062a4d] via-[#0a3b63] to-[#0b5a53] p-6 shadow-lg">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00c896]/20 px-3 py-1 text-xs font-bold text-[#7cf2d0]">
            <Gift className="h-3.5 w-3.5" /> LIMITED-TIME OFFER
          </span>
          <h2 className="mt-3 text-2xl font-black text-white">Start your 7-day free trial</h2>
          <p className="mt-1 text-sm text-white/70">
            Unlock the entire platform free for a week — pay only Razorpay&apos;s ₹1 transaction fee.
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
              ₹0<span className="ml-1 align-middle text-sm font-semibold text-white/60">/ 7 days</span>
            </div>
            <div className="mt-0.5 text-[11px] text-white/55">+ ₹1 Razorpay transaction fee</div>
            <RazorpayButton
              plan="TRIAL"
              amount={1}
              label="7-Day Free Trial"
              classesAccess={[]}
              billingCycle="yearly"
              downloadAddon={false}
              buttonLabel="Start Free Trial"
              onSuccess={() => router.push("/dashboard")}
              className="mt-3 w-full bg-[#00c896] text-white hover:bg-[#00b184]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
