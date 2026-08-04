"use client";

import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Check, Ban, IndianRupee, Save } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Totals = { pendingPaise: number; paidPaise: number; sales: number };
type Affiliate = {
  id: string; code: string; status: "PENDING" | "APPROVED" | "BLOCKED";
  commissionPercent: number; customRate: boolean;
  payoutMethod: string | null; payoutDetails: string | null;
  user: { name: string; email: string; phone: string | null };
  totals: Totals;
};
type Settings = { enabled: boolean; defaultCommissionPercent: number; buyerDiscountPercent: number; minPayoutRupees: number };

const rupees = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export default function AdminAffiliatesPage() {
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [settings, setSettings] = useState<Settings>({ enabled: true, defaultCommissionPercent: 20, buyerDiscountPercent: 10, minPayoutRupees: 500 });
  const [savingSettings, setSavingSettings] = useState(false);

  const load = () =>
    api.get("/admin/affiliates")
      .then(({ data }) => { setAffiliates(data.data.affiliates || []); if (data.data.settings) setSettings(data.data.settings); })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const update = async (id: string, body: any, msg: string) => {
    try { await api.patch(`/admin/affiliates/${id}`, body); toast.success(msg); load(); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const markPaid = async (id: string) => {
    if (!confirm("Mark all pending commissions for this affiliate as PAID? Do this after you've sent the payout.")) return;
    try { const { data } = await api.post(`/admin/affiliates/${id}/mark-paid`, {}); toast.success(data.message); load(); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try { await api.put("/admin/settings/affiliate", { settings }); toast.success("Settings saved"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSavingSettings(false); }
  };

  const setS = (k: keyof Settings, v: any) => setSettings((p) => ({ ...p, [k]: v }));

  if (loading) return <PageLoader />;

  const pending = affiliates.filter((a) => a.status === "PENDING");
  const others = affiliates.filter((a) => a.status !== "PENDING");

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Affiliates</h1>
          <p className="text-sm text-gray-500">Approve affiliates, set commission, and record payouts.</p>
        </div>
      </div>

      {/* Program settings */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 font-semibold">Program Settings</h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={settings.enabled} onChange={(e) => setS("enabled", e.target.checked)} className="h-5 w-5 accent-primary" />
            Program open
          </label>
          <NumField label="Commission %" value={settings.defaultCommissionPercent} onChange={(v) => setS("defaultCommissionPercent", v)} />
          <NumField label="Buyer discount %" value={settings.buyerDiscountPercent} onChange={(v) => setS("buyerDiscountPercent", v)} />
          <NumField label="Min payout ₹" value={settings.minPayoutRupees} onChange={(v) => setS("minPayoutRupees", v)} max={100000} />
          <Button size="sm" onClick={saveSettings} disabled={savingSettings} className="gap-1.5"><Save className="h-4 w-4" />{savingSettings ? "Saving..." : "Save"}</Button>
        </div>
        <p className="mt-2 text-xs text-gray-400">Commission % / buyer discount apply to affiliates without a custom rate. Changing the buyer discount updates each affiliate&apos;s coupon on their next approval.</p>
      </div>

      {/* Pending approvals */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-amber-600">Pending approval ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <p className="font-bold text-heading">{a.user.name} <span className="font-mono text-xs text-gray-500">({a.code})</span></p>
                  <p className="text-xs text-gray-600">{a.user.email}{a.user.phone ? ` · ${a.user.phone}` : ""} · Payout: {a.payoutMethod} — {a.payoutDetails}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => update(a.id, { status: "APPROVED" }, "Affiliate approved")} className="gap-1.5"><Check className="h-4 w-4" />Approve</Button>
                  <Button size="sm" variant="outline" onClick={() => update(a.id, { status: "BLOCKED" }, "Rejected")}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All affiliates */}
      <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-gray-500">Affiliates ({others.length})</h2>
      {others.length === 0 ? (
        <p className="text-sm text-gray-400">No approved affiliates yet.</p>
      ) : (
        <div className="space-y-2">
          {others.map((a) => (
            <div key={a.id} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-heading">
                    {a.user.name} <span className="font-mono text-xs text-gray-500">({a.code})</span>
                    <span className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold ${a.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{a.status}</span>
                  </p>
                  <p className="text-xs text-gray-600">{a.user.email} · Payout: {a.payoutMethod} — {a.payoutDetails}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span title="Referred sales" className="text-gray-600">{a.totals.sales} sales</span>
                  <span title="Pending" className="font-bold text-amber-600">{rupees(a.totals.pendingPaise)} due</span>
                  <span title="Paid" className="text-emerald-600">{rupees(a.totals.paidPaise)} paid</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-3">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  Rate %
                  <input type="number" min={0} max={100} defaultValue={a.commissionPercent}
                    onBlur={(e) => { const v = parseInt(e.target.value); if (v !== a.commissionPercent) update(a.id, { commissionPercent: v }, "Rate updated"); }}
                    className="w-16 rounded-lg border border-gray-200 px-2 py-1" />
                  {!a.customRate && <span className="text-gray-400">(default)</span>}
                </label>
                <Button size="sm" onClick={() => markPaid(a.id)} disabled={a.totals.pendingPaise === 0} className="gap-1.5"><IndianRupee className="h-3.5 w-3.5" />Mark paid</Button>
                {a.status === "APPROVED"
                  ? <Button size="sm" variant="outline" onClick={() => update(a.id, { status: "BLOCKED" }, "Blocked")} className="gap-1.5"><Ban className="h-3.5 w-3.5" />Block</Button>
                  : <Button size="sm" variant="outline" onClick={() => update(a.id, { status: "APPROVED" }, "Re-activated")} className="gap-1.5"><Check className="h-3.5 w-3.5" />Activate</Button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange, max = 100 }: { label: string; value: number; onChange: (v: number) => void; max?: number }) {
  return (
    <div className="w-32">
      <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
      <input type="number" min={0} max={max} value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(max, parseInt(e.target.value) || 0)))}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
    </div>
  );
}
