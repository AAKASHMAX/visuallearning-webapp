"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Ticket, Plus, Trash2, X, Copy } from "lucide-react";

const ALL_PLANS = [
  { key: "SINGLE_CLASS", label: "Single Class Plan" },
  { key: "MULTI_CLASS", label: "Multi Class Pack" },
  { key: "FULL_ACCESS", label: "Full Access Plan" },
  { key: "MONTHLY", label: "Monthly Plan" },
  { key: "YEARLY", label: "Yearly Plan" },
  { key: "LIVE_CLASS", label: "Live Classes" },
];

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  applicablePlans: string[];
  createdAt: string;
}

export default function CouponSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  // New coupon form
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(10);
  const [newMaxUses, setNewMaxUses] = useState(0);
  const [newValidUntil, setNewValidUntil] = useState("");
  const [newApplicablePlans, setNewApplicablePlans] = useState<string[]>([]);

  const loadCoupons = () => {
    api.get("/admin/coupons").then(({ data }) => {
      setCoupons(data.data.coupons);
    }).finally(() => setLoading(false));
  };

  useEffect(loadCoupons, []);

  const togglePlanSelection = (planKey: string) => {
    setNewApplicablePlans((prev) =>
      prev.includes(planKey) ? prev.filter((p) => p !== planKey) : [...prev, planKey]
    );
  };

  const createCoupon = async () => {
    if (!newCode.trim()) { toast.error("Coupon code is required"); return; }
    if (!newValidUntil) { toast.error("Expiry date is required"); return; }
    setSaving(true);
    try {
      await api.post("/admin/coupons", {
        code: newCode.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        discountPercent: newDiscount,
        maxUses: newMaxUses,
        validUntil: newValidUntil,
        applicablePlans: newApplicablePlans,
      });
      toast.success("Coupon created");
      setNewCode("");
      setNewDiscount(10);
      setNewMaxUses(0);
      setNewValidUntil("");
      setNewApplicablePlans([]);
      setShowAdd(false);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const toggleCoupon = async (id: string) => {
    try {
      await api.patch(`/admin/coupons/${id}/toggle`);
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update coupon");
    }
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success("Coupon deleted");
      loadCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Coupon Codes</h1>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Manage Coupons</h2>
            </div>
            <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Create Coupon</>}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Create coupon codes to share with users. They can apply these during checkout for a discount.
          </p>

          {showAdd && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Create New Coupon</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input
                  label="Coupon Code"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. WELCOME20"
                />
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    min={1}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Max Uses (0 = unlimited)</label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(Math.max(0, parseInt(e.target.value) || 0))}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Valid Until</label>
                  <input
                    type="date"
                    value={newValidUntil}
                    onChange={(e) => setNewValidUntil(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm w-full"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-xs font-medium text-gray-500 mb-2">Applicable Plans (leave empty for all plans)</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PLANS.map((plan) => (
                    <button
                      key={plan.key}
                      type="button"
                      onClick={() => togglePlanSelection(plan.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        newApplicablePlans.includes(plan.key)
                          ? "bg-blue-100 border-blue-400 text-blue-700"
                          : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                    >
                      {newApplicablePlans.includes(plan.key) && "✓ "}{plan.label}
                    </button>
                  ))}
                </div>
                {newApplicablePlans.length === 0 && (
                  <p className="text-xs text-gray-400 mt-1">No plans selected — coupon will apply to all plans</p>
                )}
              </div>
              <Button size="sm" onClick={createCoupon} disabled={saving}>
                {saving ? "Creating..." : "Create Coupon"}
              </Button>
            </div>
          )}

          {/* Coupons List */}
          <div className="space-y-3">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.validUntil) < new Date();
              const isLimitReached = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;
              const planLabels = (coupon.applicablePlans || []).map(
                (k) => ALL_PLANS.find((p) => p.key === k)?.label || k
              );
              return (
                <div
                  key={coupon.id}
                  className={`p-4 rounded-lg border ${
                    coupon.active && !isExpired && !isLimitReached
                      ? "border-green-200 bg-green-50/30"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-lg">{coupon.code}</span>
                      <button onClick={() => copyCode(coupon.code)} className="text-gray-400 hover:text-gray-600">
                        <Copy className="w-4 h-4" />
                      </button>
                      <Badge variant={coupon.active && !isExpired && !isLimitReached ? "success" : "default"}>
                        {!coupon.active ? "Disabled" : isExpired ? "Expired" : isLimitReached ? "Limit Reached" : "Active"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={coupon.active}
                          onChange={() => toggleCoupon(coupon.id)}
                          className="sr-only peer"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${coupon.active ? "bg-green-500" : "bg-gray-300"}`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${coupon.active ? "translate-x-5" : ""}`} />
                        </div>
                      </label>
                      <button onClick={() => deleteCoupon(coupon.id, coupon.code)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="text-xs text-gray-400">Discount</span>
                      <p className="font-medium">{coupon.discountPercent}%</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Used</span>
                      <p className="font-medium">{coupon.usedCount}{coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : " (unlimited)"}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Valid Until</span>
                      <p className="font-medium">{new Date(coupon.validUntil).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400">Created</span>
                      <p className="font-medium">{new Date(coupon.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                  </div>
                  {planLabels.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">Applies to: </span>
                      {planLabels.map((label, i) => (
                        <Badge key={i} variant="default" className="mr-1 text-xs">{label}</Badge>
                      ))}
                    </div>
                  )}
                  {planLabels.length === 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-gray-400">Applies to: </span>
                      <span className="text-xs text-gray-500">All plans</span>
                    </div>
                  )}
                </div>
              );
            })}
            {coupons.length === 0 && (
              <p className="text-gray-400 text-center py-8">No coupons created yet. Click &quot;Create Coupon&quot; to get started.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
