"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles, Tag, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, callback: () => void) => void };
  }
}

interface PlanItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  isFreeOfferActive?: boolean;
  freeOfferUntil?: string | null;
  durationDays: number;
  features: string[];
  courses?: { id: string; name: string; tier: string }[];
}

interface SubscriptionItem {
  plan: string;
  status: string;
  expiryDate?: string;
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

function planPeriod(durationDays: number, price: number) {
  if (price <= 0 || durationDays <= 0) return "Free access";
  if (durationDays >= 365) return "per year";
  if (durationDays === 30) return "per month";
  return `${durationDays} days access`;
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, hydrate } = useAuth();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    async function load() {
      try {
        const [plansRes, subRes] = await Promise.all([
          api.get("/subscription/plans"),
          isAuthenticated ? api.get("/subscription/my-subscription") : Promise.resolve({ data: null }),
        ]);

        const activePlans = Array.isArray(plansRes.data) ? plansRes.data : [];
        setPlans(activePlans);
        setSubscription(subRes.data);

        const requestedPlan = searchParams.get("plan")?.toUpperCase();
        const requestedBilling = searchParams.get("billing") === "yearly" ? "yearly" : "monthly";
        const requestedBasePlan = requestedPlan?.replace(/_YEARLY$/, "");
        const firstPaidPlan = activePlans.find((plan: PlanItem) => plan.price > 0);
        const matchingPlan = activePlans.find((plan: PlanItem) => plan.code === requestedPlan)
          || activePlans.find((plan: PlanItem) => requestedBilling === "yearly" && plan.code === `${requestedBasePlan}_YEARLY`)
          || activePlans.find((plan: PlanItem) => requestedBilling === "monthly" && plan.code === requestedBasePlan);
        setSelectedPlan((matchingPlan || firstPaidPlan || activePlans[0])?.code || "");
      } catch {
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isAuthenticated, searchParams]);

  const selected = plans.find((plan) => plan.code === selectedPlan);
  const activePlan = subscription?.status === "ACTIVE" ? subscription.plan : "";
  const discountedPrice = useMemo(() => {
    if (!selected) return 0;
    return Math.max(0, Math.round(selected.price * (1 - discountPercent / 100)));
  }, [selected, discountPercent]);

  async function validateCoupon() {
    if (!couponCode.trim() || !selected) {
      toast.error("Enter a coupon code first");
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/subscription?plan=${selected.code}`);
      return;
    }

    try {
      const res = await api.get(`/subscription/validate-coupon?code=${couponCode.trim().toUpperCase()}&plan=${selected.code}`);
      setDiscountPercent(res.data.discountPercent || 0);
      toast.success(`${res.data.discountPercent}% discount applied`);
    } catch (error: any) {
      setDiscountPercent(0);
      toast.error(error.response?.data?.message || "Invalid coupon");
    }
  }

  async function startPayment(plan: PlanItem) {
    if (plan.price <= 0) {
      if (!isAuthenticated) {
        router.push(`/auth/login?redirect=/subscription?plan=${plan.code}`);
        return;
      }
      setPaying(true);
      try {
        await api.post("/subscription/activate-free", { plan: plan.code });
        toast.success("Free access activated");
        router.push("/dashboard");
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to activate free access");
      } finally {
        setPaying(false);
      }
      return;
    }

    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/subscription?plan=${plan.code}`);
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
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

      const { data } = await api.post("/subscription/create-order", {
        plan: plan.code,
        couponCode: couponCode.trim().toUpperCase() || undefined,
      });

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount * 100,
        currency: data.currency || "INR",
        name: "PhysicsLab",
        description: `${plan.name} subscription`,
        order_id: data.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: { color: "#00d4ff" },
        handler: async (response: any) => {
          try {
            await api.post("/subscription/verify-payment", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              plan: plan.code,
              couponCode: couponCode.trim().toUpperCase() || undefined,
            });
            toast.success("Subscription activated");
            router.push("/dashboard");
          } catch (error: any) {
            toast.error(error.response?.data?.message || "Payment verification failed");
          }
        },
      });

      razorpay.on("payment.failed", () => toast.error("Payment failed. Please try again."));
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to start payment");
    } finally {
      setPaying(false);
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
              Choose Your <span className="gradient-text">Physics Plan</span>
            </h1>
            <p className="text-text-muted max-w-2xl mx-auto">
              Plans, prices, features, and course access are controlled from the admin panel.
            </p>
          </div>

          {activePlan && (
            <div className="max-w-3xl mx-auto mb-8 rounded-2xl border border-success/25 bg-success/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-success" />
                <div>
                  <p className="text-sm font-semibold text-text-bright">Active plan: {activePlan}</p>
                  {subscription?.expiryDate && (
                    <p className="text-xs text-text-muted">Expires {new Date(subscription.expiryDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Go to Dashboard</Button>
              </Link>
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => <div key={index} className="h-96 rounded-2xl bg-card animate-pulse" />)}
            </div>
          ) : (
            <div className="grid lg:grid-cols-[1fr_22rem] gap-8 items-start">
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan, index) => {
                  const selectedCard = selectedPlan === plan.code;
                  const isCurrentPlan = activePlan === plan.code;

                  return (
                    <button
                      key={plan.id || plan.code}
                      onClick={() => { setSelectedPlan(plan.code); setDiscountPercent(0); }}
                      className={cn(
                        "text-left rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40",
                        selectedCard ? "border-accent/60 shadow-xl shadow-accent/10" : "border-border",
                        index === 1 && "lg:scale-[1.02]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3 mb-5">
                        <div>
                          <p className="text-xs font-bold tracking-widest text-accent uppercase">{plan.code}</p>
                          <h3 className="text-xl font-bold text-text-bright mt-1">{plan.name}</h3>
                        </div>
                        {isCurrentPlan ? (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-success/10 text-success">Active</span>
                        ) : selectedCard ? (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-accent/10 text-accent">Selected</span>
                        ) : null}
                      </div>

                      <p className="text-sm text-text-muted leading-relaxed min-h-12">{plan.description}</p>

                      <div className="my-6">
                        {plan.isFreeOfferActive && (plan.originalPrice || 0) > plan.price && (
                          <p className="text-sm font-bold text-text-muted line-through">&#8377;{plan.originalPrice}</p>
                        )}
                        {plan.price > 0 && <span className="text-text-muted text-lg">&#8377;</span>}
                        <span className={`text-4xl font-extrabold ${plan.price <= 0 ? "text-success" : "text-text-bright"}`}>{plan.price > 0 ? plan.price : "FREE"}</span>
                        <span className="text-text-muted text-sm ml-2">{planPeriod(plan.durationDays, plan.price)}</span>
                        {plan.isFreeOfferActive && plan.freeOfferUntil && (
                          <p className="mt-1 text-xs text-success">Free until {new Date(plan.freeOfferUntil).toLocaleDateString("en-IN")}</p>
                        )}
                      </div>

                      <ul className="space-y-3">
                        {(plan.features || []).slice(0, 6).map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-sm">
                            <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                            <span className="text-text-muted">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
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
                        <span className="text-xs text-text-muted">{planPeriod(selected.durationDays, selected.price)}</span>
                        <div>
                          {discountPercent > 0 && (
                            <p className="text-xs text-success text-right">{discountPercent}% off applied</p>
                          )}
                          {selected.isFreeOfferActive && (selected.originalPrice || 0) > selected.price && (
                            <p className="text-xs text-text-muted line-through text-right">&#8377;{selected.originalPrice}</p>
                          )}
                          <p className={`text-2xl font-black ${discountedPrice <= 0 ? "text-success" : "text-text-bright"}`}>
                            {discountedPrice > 0 ? <>&#8377;{discountedPrice}</> : "FREE"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {selected.price > 0 && (
                      <div className="mb-5">
                        <label className="block text-sm text-text-muted mb-2">Coupon Code</label>
                        <div className="flex gap-2">
                          <Input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} placeholder="PHYSICS20" />
                          <Button variant="outline" onClick={validateCoupon} className="px-4">
                            <Tag className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      size="lg"
                      variant={selected.price > 0 ? "primary" : "outline"}
                      onClick={() => startPayment(selected)}
                      disabled={paying || isCurrentPlan(selected, activePlan)}
                    >
                      {paying ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : selected.price > 0 ? <Lock className="w-5 h-5 mr-2" /> : <Zap className="w-5 h-5 mr-2" />}
                      {isCurrentPlan(selected, activePlan) ? "Current Plan" : selected.price > 0 ? "Pay Securely" : "Start Free"}
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
