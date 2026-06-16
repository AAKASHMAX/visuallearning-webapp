"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CalendarDays, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { FreeOfferCountdown, FreePriceHighlight } from "@/components/subscription/free-offer";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: () => void) => void };
  }
}

interface PlanItem {
  id: string;
  code: string;
  baseCode?: string;
  billingCycle?: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  isFreeOfferActive?: boolean;
  freeOfferUntil?: string | null;
  durationDays: number;
  accessDurationDays?: number;
  features: string[];
  courses?: { id: string; name: string; tier: string }[];
}

interface SubscriptionItem {
  plan: string;
  status: string;
  expiryDate?: string;
  autoRenew?: boolean;
  billingCycle?: string;
}

function baseOf(code: string) {
  return code.replace(/_(MONTHLY|YEARLY)$/, "");
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function isYearly(plan: { code?: string; durationDays?: number } | undefined) {
  if (!plan) return true;
  if (plan.code?.endsWith("_MONTHLY")) return false;
  if (plan.code?.endsWith("_YEARLY")) return true;
  return (plan.durationDays || 0) >= 365;
}

function planPeriod(plan: PlanItem | undefined, price: number) {
  if (price <= 0) return "30-day free trial";
  return isYearly(plan) ? "per year" : "per month";
}

function accessPeriod(plan: PlanItem | undefined, price: number) {
  if (price <= 0) return "30 days free access";
  return isYearly(plan) ? "Renews every year" : "Renews every month";
}

function monthlyEquivalent(yearlyPrice: number) {
  return Math.round(yearlyPrice / 12).toLocaleString("en-IN");
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, hydrate } = useAuth();
  const requestedPlanParam = searchParams.get("plan");
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes, paymentConfigRes] = await Promise.all([
          api.get("/subscription/plans"),
          isAuthenticated ? api.get("/subscription/my-subscription") : Promise.resolve({ data: null }),
          api.get("/subscription/payment-config").catch(() => ({ data: null })),
        ]);

        const activePlans = Array.isArray(plansRes.data) ? plansRes.data : [];
        setPlans(activePlans);
        setSubscription(subRes.data);
        setRazorpayKeyId(paymentConfigRes.data?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "");

        const requestedPlan = requestedPlanParam?.toUpperCase().replace(/-/g, "_");
        const requestedBasePlan = requestedPlan?.replace(/_(YEARLY|MONTHLY)$/, "");
        // Match the EXACT requested billing cycle first so the checkout shows
        // (and bills) the plan the user picked. Bare codes default to monthly.
        const matchingPlan = activePlans.find((plan: PlanItem) => plan.code === requestedPlan)
          || activePlans.find((plan: PlanItem) => plan.code === `${requestedBasePlan}_MONTHLY`)
          || activePlans.find((plan: PlanItem) => plan.code === `${requestedBasePlan}_YEARLY`);
        setSelectedPlan(matchingPlan?.code || "");
      } catch {
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated, requestedPlanParam, searchParams]);

  const selected = plans.find((plan) => plan.code === selectedPlan);
  const selectedBase = baseOf(selected?.code || selectedPlan);
  const monthlyVariant = plans.find((plan) => plan.code === `${selectedBase}_MONTHLY`);
  const yearlyVariant = plans.find((plan) => plan.code === `${selectedBase}_YEARLY`);
  const currentCycle = selected && !isYearly(selected) ? "MONTHLY" : "YEARLY";
  const activePlan = subscription?.status === "ACTIVE" ? subscription.plan : "";
  const canCancelAutoRenew = subscription?.status === "ACTIVE" && subscription?.autoRenew;
  const discountedPrice = selected ? selected.price : 0;
  const selectedAccessDays = selected ? (discountedPrice <= 0 ? 30 : selected.accessDurationDays || selected.durationDays || 365) : 0;
  const accessDates = useMemo(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + Math.max(selectedAccessDays, 0));
    return { start, end };
  }, [selected?.code, selectedAccessDays]);
  const courseNames = selected?.courses?.length
    ? selected.courses.map((course) => course.name).join(", ")
    : selected?.name || "Selected course";

  if (!requestedPlanParam) {
    redirect("/courses");
  }

  async function startSubscription(plan: PlanItem) {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/subscription?plan=${plan.code}`);
      return;
    }

    const paymentKeyId = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!paymentKeyId) {
      toast.error("Payment key is not configured");
      return;
    }

    setPaying(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const { data } = await api.post("/subscription/create-subscription", {
        plan: plan.code,
      });
      const cycleLabel = data.billingCycle === "MONTHLY" ? "monthly" : "yearly";

      const razorpay = new window.Razorpay({
        key: paymentKeyId,
        subscription_id: data.subscriptionId,
        name: "PhysicsLab",
        description: `${plan.name} — ${cycleLabel} auto-renewal`,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#00d4ff" },
        handler: async (response: any) => {
          try {
            await api.post("/subscription/verify-subscription", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySubscriptionId: response.razorpay_subscription_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success(`Subscription active — auto-renews ${cycleLabel}`);
            router.push("/dashboard");
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment verification failed");
          }
        },
      });

      razorpay.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start subscription");
    } finally {
      setPaying(false);
    }
  }

  async function cancelAutoRenew() {
    if (!window.confirm("Cancel auto-renewal? You'll keep access until your current period ends.")) {
      return;
    }
    try {
      await api.post("/subscription/cancel-subscription");
      toast.success("Auto-renewal cancelled. Access continues until expiry.");
      const { data } = await api.get("/subscription/my-subscription");
      setSubscription(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel auto-renewal");
    }
  }

  return (
    <main className="min-h-screen bg-primary">
      <Navbar />
      <section className="pt-28 pb-16 bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
              <CreditCard className="w-4 h-4 text-accent" />
              <span className="text-sm text-text-muted">Secure Subscription</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-text-bright mb-4">
              Complete Your <span className="gradient-text">Subscription</span>
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto">
              Review your selected course plan before activating access.
            </p>
          </div>

          {activePlan && (
            <div className="max-w-3xl mx-auto mb-8 rounded-2xl border border-success/25 bg-success/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-semibold text-text-bright">Active plan: {activePlan}</p>
                  {subscription?.expiryDate && (
                    <p className="text-xs text-text-muted">
                      {canCancelAutoRenew ? "Auto-renews" : "Expires"} {new Date(subscription.expiryDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canCancelAutoRenew && (
                  <Button variant="outline" size="sm" onClick={cancelAutoRenew}>Cancel auto-renewal</Button>
                )}
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
              <div className="h-[28rem] rounded-2xl bg-card animate-pulse" />
              <div className="h-80 rounded-2xl bg-card animate-pulse" />
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl shadow-black/10">
                {selected ? (
                  <>
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-accent">{selected.code}</p>
                        <h2 className="mt-2 text-3xl font-black text-text-bright">{selected.name}</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-muted">
                          {selected.description || "A structured physics learning plan with animated concept videos, notes, practice, and guided course access."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm font-bold text-accent">
                        Selected Plan
                      </div>
                    </div>

                    {(monthlyVariant || yearlyVariant) && (
                      <div className="mt-6 inline-flex rounded-full border border-border bg-surface/60 p-1">
                        <button
                          type="button"
                          disabled={!monthlyVariant}
                          onClick={() => monthlyVariant && setSelectedPlan(monthlyVariant.code)}
                          className={`px-5 py-2 text-sm font-bold rounded-full transition ${currentCycle === "MONTHLY" ? "bg-accent text-primary" : "text-text-muted"} ${!monthlyVariant ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          Monthly
                        </button>
                        <button
                          type="button"
                          disabled={!yearlyVariant}
                          onClick={() => yearlyVariant && setSelectedPlan(yearlyVariant.code)}
                          className={`px-5 py-2 text-sm font-bold rounded-full transition ${currentCycle === "YEARLY" ? "bg-accent text-primary" : "text-text-muted"} ${!yearlyVariant ? "opacity-40 cursor-not-allowed" : ""}`}
                        >
                          Yearly
                          {monthlyVariant && yearlyVariant && (
                            <span className="ml-1 text-xs font-semibold opacity-80">save {Math.max(0, Math.round((1 - yearlyVariant.price / (monthlyVariant.price * 12)) * 100))}%</span>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-surface/60 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Course Name</p>
                        <p className="mt-2 text-lg font-bold text-text-bright">{courseNames}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface/60 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Price</p>
                        <div className="mt-2">
                          {selected.isFreeOfferActive && (selected.originalPrice || 0) > selected.price && (
                            <p className="text-sm font-bold text-text-muted line-through">&#8377;{selected.originalPrice}</p>
                          )}
                          {selected.price > 0 && <span className="text-text-muted text-lg">&#8377;</span>}
                          {selected.price > 0 ? (
                            <span className="text-3xl font-black text-text-bright">{selected.price.toLocaleString("en-IN")}</span>
                          ) : (
                            <FreePriceHighlight size="md" />
                          )}
                          <span className="ml-2 text-sm text-text-muted">{planPeriod(selected, selected.price)}</span>
                          {selected.price > 0 && isYearly(selected) && (
                            <p className="mt-1 text-sm font-bold text-accent">Only Rs {monthlyEquivalent(selected.price)}/month, billed yearly</p>
                          )}
                          {selected.isFreeOfferActive && <FreeOfferCountdown until={selected.freeOfferUntil} />}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface/60 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Time Period</p>
                        <p className="mt-2 text-lg font-bold text-text-bright">{accessPeriod(selected, discountedPrice)}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface/60 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Start & End Date</p>
                        <div className="mt-3 flex items-start gap-3 text-sm text-text-muted">
                          <CalendarDays className="h-4 w-4 text-accent" />
                          <div className="space-y-1">
                            <p>Start: <span className="font-bold text-text-bright">{formatDate(accessDates.start)}</span></p>
                            <p>End: <span className="font-bold text-text-bright">{formatDate(accessDates.end)}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {(selected.features || []).length > 0 && (
                      <div className="mt-8">
                        <h3 className="mb-4 text-lg font-bold text-text-bright">What You Get</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {selected.features.slice(0, 6).map((feature) => (
                            <div key={feature} className="flex items-start gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm">
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                              <span className="text-text-muted">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-16 text-center">
                    <Sparkles className="mx-auto mb-3 h-10 w-10 text-accent/60" />
                    <h2 className="text-xl font-bold text-text-bright">No plan selected</h2>
                    <p className="mt-2 text-sm text-text-muted">Please choose a course plan before checkout.</p>
                    <Link href="/courses" className="mt-5 inline-block">
                      <Button>Explore Courses</Button>
                    </Link>
                  </div>
                )}
              </div>

              <aside className="rounded-2xl border border-border bg-card p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-energy" />
                  <h2 className="text-lg font-bold text-text-bright">Checkout</h2>
                </div>

                {selected ? (
                  <>
                    <div className="rounded-xl border border-border bg-surface/60 p-4 mb-5">
                      <p className="text-sm font-semibold text-text-bright">{selected.name}</p>
                      <p className="text-xs text-text-muted mt-1">{selected.description}</p>
                      <div className="flex items-end justify-between mt-4">
                        <span className="text-xs text-text-muted">{planPeriod(selected, selected.price)}</span>
                        <div>
                          <div className="text-right text-2xl font-black text-text-bright">
                            &#8377;{selected.price.toLocaleString("en-IN")}
                          </div>
                          {isYearly(selected) ? (
                            <p className="mt-1 text-right text-xs font-semibold text-accent">Rs {monthlyEquivalent(selected.price)}/month, billed yearly</p>
                          ) : (
                            <p className="mt-1 text-right text-xs font-semibold text-accent">billed monthly</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mb-5 rounded-xl border border-border bg-surface/40 p-3 text-xs text-text-muted">
                      Auto-renews {isYearly(selected) ? "every year" : "every month"} until you cancel. You can cancel anytime from this page or your dashboard.
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      variant="primary"
                      onClick={() => startSubscription(selected)}
                      disabled={paying || isCurrentPlan(selected, activePlan)}
                    >
                      {paying ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Lock className="w-5 h-5 mr-2" />}
                      {isCurrentPlan(selected, activePlan) ? "Current Plan" : "Subscribe & Auto-renew"}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-4">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      <span>Secured by Razorpay</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-muted">Select a plan to continue.</p>
                )}
              </aside>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function isCurrentPlan(plan: PlanItem, activePlan: string) {
  return activePlan === plan.code;
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-primary" />}>
      <SubscriptionContent />
    </Suspense>
  );
}
