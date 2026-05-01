"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface CouponItem {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  validUntil: string;
  isActive: boolean;
  applicablePlans: string[];
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(10);
  const [maxUses, setMaxUses] = useState(100);
  const [validUntil, setValidUntil] = useState("");

  useEffect(() => { fetchCoupons(); }, []);

  async function fetchCoupons() {
    try {
      const res = await api.get("/admin/coupons");
      setCoupons(res.data);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  }

  async function createCoupon() {
    if (!code || !validUntil) { toast.error("Fill all fields"); return; }
    try {
      await api.post("/admin/coupons", { code, discountPercent: discount, maxUses, validUntil });
      toast.success("Coupon created!");
      setShowForm(false);
      setCode("");
      fetchCoupons();
    } catch { toast.error("Failed to create"); }
  }

  async function toggleCoupon(id: string) {
    try {
      await api.patch(`/admin/coupons/${id}/toggle`);
      fetchCoupons();
    } catch { toast.error("Failed to toggle"); }
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success("Deleted");
      fetchCoupons();
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Coupons</h1>
          <p className="text-text-muted text-sm mt-1">Manage discount codes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Coupon
        </Button>
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text-bright mb-4">New Coupon</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Code</label>
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. PHYSICS20" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Discount %</label>
                <Input type="number" value={discount} onChange={(e) => setDiscount(parseInt(e.target.value) || 0)} />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Max Uses</label>
                <Input type="number" value={maxUses} onChange={(e) => setMaxUses(parseInt(e.target.value) || 100)} />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Valid Until</label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={createCoupon} className="flex-1">Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Coupons Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Tag className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">No coupons yet</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div key={c.id} className={`rounded-xl border bg-card p-5 ${c.isActive ? "border-accent/20" : "border-border opacity-60"}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-accent text-lg">{c.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.isActive ? "bg-success/10 text-success" : "bg-danger/10 text-danger"}`}>
                  {c.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-2xl font-bold text-text-bright mb-1">{c.discountPercent}% off</p>
              <p className="text-xs text-text-muted mb-3">
                Used {c.usedCount}/{c.maxUses} &bull; Expires {new Date(c.validUntil).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleCoupon(c.id)} className="p-1.5 hover:bg-surface-light rounded-lg transition-colors">
                  {c.isActive ? <ToggleRight className="w-5 h-5 text-success" /> : <ToggleLeft className="w-5 h-5 text-text-muted" />}
                </button>
                <button onClick={() => deleteCoupon(c.id)} className="p-1.5 hover:bg-danger/10 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
