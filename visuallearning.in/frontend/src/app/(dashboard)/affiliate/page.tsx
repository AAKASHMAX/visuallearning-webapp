"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Check, IndianRupee, Clock, TrendingUp } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Settings = { enabled: boolean; defaultCommissionPercent: number; buyerDiscountPercent: number; minPayoutRupees: number };
type Affiliate = { code: string; status: "PENDING" | "APPROVED" | "BLOCKED"; commissionPercent: number; payoutMethod: string | null; payoutDetails: string | null };
type Totals = { pendingPaise: number; paidPaise: number; sales: number };
type Commission = { saleAmount: number; commissionAmount: number; status: string; createdAt: string };

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function AffiliatePage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [totals, setTotals] = useState<Totals>({ pendingPaise: 0, paidPaise: 0, sales: 0 });
  const [recent, setRecent] = useState<Commission[]>([]);
  const [copied, setCopied] = useState(false);

  // Apply form
  const [payoutMethod, setPayoutMethod] = useState("UPI");
  const [payoutDetails, setPayoutDetails] = useState("");
  const [applying, setApplying] = useState(false);

  const load = () =>
    api.get("/affiliate/me")
      .then(({ data }) => {
        setSettings(data.data.settings);
        setAffiliate(data.data.affiliate);
        if (data.data.totals) setTotals(data.data.totals);
        if (data.data.recent) setRecent(data.data.recent);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const apply = async () => {
    if (!payoutDetails.trim()) { toast.error("Enter your payout details"); return; }
    setApplying(true);
    try {
      await api.post("/affiliate/apply", { payoutMethod, payoutDetails });
      toast.success("Application submitted!");
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to apply");
    } finally { setApplying(false); }
  };

  const link = affiliate ? `https://www.visuallearning.in/?ref=${affiliate.code}` : "";
  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10"><Gift className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-black text-heading">Affiliate Program</h1>
          <p className="text-sm text-text-muted">Earn commission for every subscription you refer.</p>
        </div>
      </div>

      {/* Not an affiliate yet → apply */}
      {!affiliate && settings?.enabled && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 grid grid-cols-3 gap-3 text-center">
            <Stat icon={TrendingUp} label="You earn" value={`${settings.defaultCommissionPercent}%`} sub="of each sale" />
            <Stat icon={Gift} label="Buyer gets" value={`${settings.buyerDiscountPercent}%`} sub="discount" />
            <Stat icon={IndianRupee} label="Min payout" value={`₹${settings.minPayoutRupees}`} sub="to withdraw" />
          </div>
          <h2 className="mt-2 font-bold text-heading">Join in 30 seconds</h2>
          <p className="mb-4 text-sm text-text-muted">Get a personal referral code. When someone subscribes with it, you earn — and they get a discount.</p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-heading">Payout method</label>
              <div className="flex gap-2">
                {["UPI", "BANK"].map((m) => (
                  <button key={m} onClick={() => setPayoutMethod(m)}
                    className={`rounded-lg border px-4 py-2 text-sm font-bold ${payoutMethod === m ? "border-primary bg-primary text-white" : "border-gray-200 text-heading"}`}>
                    {m === "UPI" ? "UPI" : "Bank transfer"}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label={payoutMethod === "UPI" ? "UPI ID" : "Bank account details"}
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              placeholder={payoutMethod === "UPI" ? "yourname@upi" : "A/C no, IFSC, name"}
            />
            <Button onClick={apply} disabled={applying} className="w-full">{applying ? "Submitting..." : "Become an Affiliate"}</Button>
          </div>
        </div>
      )}

      {!affiliate && !settings?.enabled && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          The affiliate program isn&apos;t open right now. Please check back soon.
        </div>
      )}

      {/* Pending */}
      {affiliate?.status === "PENDING" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <Clock className="mx-auto mb-2 h-8 w-8 text-amber-600" />
          <h2 className="font-black text-heading">Application under review</h2>
          <p className="mt-1 text-sm text-amber-800">We&apos;re reviewing your application. You&apos;ll get your referral link once approved.</p>
        </div>
      )}

      {/* Blocked */}
      {affiliate?.status === "BLOCKED" && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          Your affiliate account is currently inactive. Contact support if you think this is a mistake.
        </div>
      )}

      {/* Approved dashboard */}
      {affiliate?.status === "APPROVED" && (
        <div className="space-y-6">
          {/* Referral link */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Your referral link</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-sm text-heading">{link}</code>
              <Button size="sm" onClick={copy} className="shrink-0 gap-1.5">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Code <span className="font-black text-heading">{affiliate.code}</span> — you earn{" "}
              <span className="font-bold text-primary">{affiliate.commissionPercent}%</span>, buyers get{" "}
              <span className="font-bold text-primary">{settings?.buyerDiscountPercent}%</span> off.
            </p>
          </div>

          {/* Earnings */}
          <div className="grid grid-cols-3 gap-3">
            <Stat icon={TrendingUp} label="Referred sales" value={String(totals.sales)} />
            <Stat icon={Clock} label="Pending" value={rupees(totals.pendingPaise)} />
            <Stat icon={IndianRupee} label="Paid out" value={rupees(totals.paidPaise)} />
          </div>

          {/* Recent */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5">
            <h3 className="mb-3 font-bold text-heading">Recent referrals</h3>
            {recent.length === 0 ? (
              <p className="text-sm text-text-muted">No referrals yet. Share your link to start earning.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {recent.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="text-text-muted">{new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                    <span className="text-text-muted">Sale {rupees(c.saleAmount)}</span>
                    <span className="font-bold text-heading">+{rupees(c.commissionAmount)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-text-muted">
            Payouts are sent to your {affiliate.payoutMethod} once your pending balance crosses ₹{settings?.minPayoutRupees}.
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
      <Icon className="mx-auto mb-1 h-4 w-4 text-primary" />
      <div className="text-lg font-black text-heading">{value}</div>
      <div className="text-[11px] text-text-muted">{label}{sub ? ` ${sub}` : ""}</div>
    </div>
  );
}
