"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import api from "@/lib/api";
import { Check, Loader2, Sparkles, ArrowRight, CreditCard } from "lucide-react";

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  durationDays: number;
  features: string[];
}

const isYearly = (p: Plan) => (p.durationDays || 0) >= 180;

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    api.get("/subscription/plans")
      .then((r) => setPlans(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter((p) =>
    cycle === "yearly" ? isYearly(p) : !isYearly(p) && (p.durationDays || 0) > 0
  );

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-muted">Plans & Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-3">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-text-muted max-w-2xl mx-auto">
            Unlock all chapters — 3D videos, notes, NCERT & PYQ solutions, and quizzes.
          </p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            {(["monthly", "yearly"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCycle(c)}
                className={`rounded-lg px-5 py-2 text-sm font-semibold capitalize transition-all ${
                  cycle === c ? "bg-accent text-primary" : "text-text-muted hover:text-text-bright"
                }`}
              >
                {c}
                {c === "yearly" && <span className="ml-1.5 text-[10px] text-emerald-400">Save</span>}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="w-10 h-10 text-accent animate-spin mb-3" />
            <p className="text-text-muted text-sm">Loading plans...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-12 text-center">
            <CreditCard className="w-10 h-10 text-accent/40 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-text-bright mb-1">No {cycle} plans yet</h3>
            <p className="text-text-muted text-sm">Try the {cycle === "yearly" ? "monthly" : "yearly"} option, or check back soon.</p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <div key={p.id} className="relative flex flex-col rounded-2xl border border-border bg-card p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40">
                <h3 className="text-xl font-bold text-text-bright">{p.name}</h3>
                {p.description && <p className="mt-1 text-sm text-text-muted">{p.description}</p>}
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-lg text-text-muted">&#8377;</span>
                  <span className="text-3xl font-extrabold text-text-bright">{p.price.toLocaleString("en-IN")}</span>
                  <span className="mb-1 text-sm text-text-muted">/{isYearly(p) ? "year" : "month"}</span>
                </div>
                {p.features?.length > 0 && (
                  <div className="mt-5 flex-1 space-y-2.5">
                    {p.features.slice(0, 8).map((f) => (
                      <div key={f} className="flex items-center gap-3 text-sm text-text-bright">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent/10">
                          <Check className="h-3.5 w-3.5 text-accent" />
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>
                )}
                <Link href={`/subscription?plan=${p.code}`} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-primary transition-all hover:gap-3 hover:bg-accent/90">
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
