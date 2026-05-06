"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CalendarDays, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles, Tag, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function accessPeriod(durationDays: number) {
  if (durationDays >= 365) return `${Math.round(durationDays / 365)} year access`;
  if (durationDays === 30) return "30 days monthly access";
  if (durationDays > 0) return `${durationDays} days access`;
  return "Free access";
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function SubscriptionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, hydrate } = useAuth();
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionItem | null>(null);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [razorpayKeyId, setRazorpayKeyId] = useState(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "");
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
        const [plansRes, subRes, paymentConfigRes] = await Promise.all([
          api.get("/subscription/plans"),
          isAuthenticated ? api.get("/subscription/my-subscription") : Promise.resolve({ data: null }),
          api.get("/subscription/payment-config").catch(() => ({ data: null })),
        ]);

        const activePlans = Array.isArray(plansRes.data) ? plansRes.data : [];
        setPlans(activePlans);
        setSubscription(subRes.data);
        setRazorpayKeyId(paymentConfigRes.data?.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "");

        const requestedPlan = searchParams.get("plan")?.toUpperCase();
        const requestedBilling = searchParams.get("billing") === "yearly" ? "yearly" : "monthly";
        const requestedBasePlan = requestedPlan?.replace(/_YEARLY$/, "");
        const firstPaidPlan = activePlans.find((plan: PlanItem) => plan.price > 0);
        const matchingPlan = activePlans.find((plan: PlanItem) => plan.code === requestedPlan)
          || activePlans.find((plan: PlanItem) => requestedBilling === "yearly" && plan.code === `${requestedBasePlan}_YEARLY`)
          || activePlans.find((plan: PlanItem) => requestedBilling === "monthly" && (plan.code === requestedBasePlan || plan.code === `${requestedBasePlan}_MONTHLY`));
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
  const accessDates = useMemo(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + Math.max(selected?.durationDays || 0, 0));
    return { start, end };
  }, [selected?.code, selected?.durationDays]);
  const courseNames = selected?.courses?.length
    ? selected.courses.map((course) => course.name).join(", ")
    : selected?.name || "Selected course";

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

      const { data } = await api.post("/subscription/create-order", {
        plan: plan.code,
        couponCode: couponCode.trim().toUpperCase() || undefined,
      });

      const razorpay = new window.Razorpay({
        key: paymentKeyId,
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
                          <span className="ml-2 text-sm text-text-muted">{planPeriod(selected.durationDays, selected.price)}</span>
                          {selected.isFreeOfferActive && <FreeOfferCountdown until={selected.freeOfferUntil} />}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface/60 p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Time Period</p>
                        <p className="mt-2 text-lg font-bold text-text-bright">{accessPeriod(selected.durationDays)}</p>
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
                        <span className="text-xs text-text-muted">{planPeriod(selected.durationDays, selected.price)}</span>
                        <div>
                          {discountPercent > 0 && (
                            <p className="text-xs text-success text-right">{discountPercent}% off applied</p>
                          )}
                          {selected.isFreeOfferActive && (selected.originalPrice || 0) > selected.price && (
                            <p className="text-xs text-text-muted line-through text-right">&#8377;{selected.originalPrice}</p>
                          )}
                          <div className={`text-right ${discountedPrice > 0 ? "text-2xl font-black text-text-bright" : ""}`}>
                            {discountedPrice > 0 ? <>&#8377;{discountedPrice.toLocaleString("en-IN")}</> : <FreePriceHighlight size="sm" />}
                          </div>
                        </div>
                      </div>
                      {selected.isFreeOfferActive && <FreeOfferCountdown until={selected.freeOfferUntil} className="mt-3" />}
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
