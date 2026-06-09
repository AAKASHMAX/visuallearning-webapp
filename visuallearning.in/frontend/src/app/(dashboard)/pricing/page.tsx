"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { Check, GraduationCap, Layers, Crown, Sparkles, type LucideIcon } from "lucide-react";

type BillingCycle = "monthly" | "yearly";

interface Plan {
  id: string;
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  classSelection?: number;
}

const PLAN_ORDER = ["SINGLE_CLASS", "DUAL_CLASS", "FULL_ACCESS"];

const PLAN_META: Record<string, { tagline: string; icon: LucideIcon; gradient: string; popular?: boolean }> = {
  SINGLE_CLASS: { tagline: "Pick any 1 class", icon: GraduationCap, gradient: "from-sky-500 to-cyan-500" },
  DUAL_CLASS: { tagline: "Pick any 2 classes", icon: Layers, gradient: "from-violet-500 to-purple-600", popular: true },
  FULL_ACCESS: { tagline: "All 4 classes (9–12)", icon: Crown, gradient: "from-amber-500 to-orange-600" },
};

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [cycle, setCycle] = useState<BillingCycle>("yearly");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/subscription/plans").then(({ data }) => {
      setPlans(data.data?.plans || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const ordered = useMemo(
    () => PLAN_ORDER.map((id) => plans.find((p) => p.id === id)).filter(Boolean) as Plan[],
    [plans]
  );

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-wider text-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Plans &amp; Pricing
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-heading sm:text-4xl">Choose your plan</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-text-muted sm:text-base">
          Pick a single class, any two, or unlock everything. You choose exactly which classes at checkout.
        </p>

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
          {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`rounded-full px-5 py-2 text-sm font-bold capitalize transition-all ${cycle === c ? "bg-primary text-white" : "text-text-muted hover:text-heading"}`}
            >
              {c}
              {c === "yearly" && <span className="ml-1.5 text-[10px] font-black text-emerald-500">Save</span>}
            </button>
          ))}
        </div>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-text-muted shadow-sm">No plans available right now.</div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          {ordered.map((plan) => {
            const meta = PLAN_META[plan.id] || PLAN_META.SINGLE_CLASS;
            const Icon = meta.icon;
            const price = cycle === "monthly" ? plan.monthlyPrice || 0 : plan.yearlyPrice || 0;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 ${meta.popular ? "ring-2 ring-primary" : "border border-gray-100"}`}
              >
                {meta.popular && (
                  <span className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">Popular</span>
                )}
                <div className={`bg-gradient-to-br ${meta.gradient} px-6 py-6 text-white`}>
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black">{plan.name}</h3>
                  <p className="mt-0.5 text-sm text-white/80">{meta.tagline}</p>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-5">
                    <span className="text-3xl font-black text-heading">₹{price.toLocaleString("en-IN")}</span>
                    <span className="text-sm font-medium text-text-muted">/{cycle === "monthly" ? "month" : "year"}</span>
                  </div>

                  <ul className="mb-6 space-y-2.5">
                    {(plan.features || []).map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-text-muted">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => router.push(`/subscription?plan=${plan.id}&billing=${cycle}`)}
                    className={`mt-auto w-full rounded-xl bg-gradient-to-r py-3 text-sm font-black text-white transition-all hover:opacity-90 ${meta.gradient}`}
                  >
                    Choose {plan.name}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
