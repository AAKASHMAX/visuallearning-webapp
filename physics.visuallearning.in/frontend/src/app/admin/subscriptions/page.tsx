"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SubItem {
  id: string;
  plan: string;
  status: string;
  startDate: string;
  expiryDate: string;
  amount: number;
  user: { name: string; email: string };
}

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrant, setShowGrant] = useState(false);
  const [grantEmail, setGrantEmail] = useState("");
  const [grantPlan, setGrantPlan] = useState("BASIC");
  const [grantDays, setGrantDays] = useState(30);

  useEffect(() => { fetchSubs(); }, []);

  async function fetchSubs() {
    try {
      const res = await api.get("/admin/subscriptions");
      setSubs(res.data.subscriptions);
    } catch { toast.error("Failed to load"); }
    setLoading(false);
  }

  async function grantSub() {
    try {
      // Find user by email first
      const usersRes = await api.get(`/admin/users?search=${grantEmail}&limit=1`);
      const user = usersRes.data.users[0];
      if (!user) { toast.error("User not found"); return; }

      await api.post("/admin/subscriptions", { userId: user.id, plan: grantPlan, days: grantDays });
      toast.success("Subscription granted!");
      setShowGrant(false);
      setGrantEmail("");
      fetchSubs();
    } catch { toast.error("Failed to grant"); }
  }

  async function cancelSub(id: string) {
    if (!confirm("Cancel this subscription?")) return;
    try {
      await api.delete(`/admin/subscriptions/${id}`);
      toast.success("Cancelled");
      fetchSubs();
    } catch { toast.error("Failed to cancel"); }
  }

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-success/10 text-success",
    EXPIRED: "bg-energy/10 text-energy",
    CANCELLED: "bg-danger/10 text-danger",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Subscriptions</h1>
          <p className="text-text-muted text-sm mt-1">{subs.length} total</p>
        </div>
        <Button onClick={() => setShowGrant(true)}>
          <Plus className="w-4 h-4 mr-2" /> Grant Subscription
        </Button>
      </div>

      {/* Grant Modal */}
      {showGrant && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-text-bright mb-4">Grant Subscription</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">User Email</label>
                <Input value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="student@example.com" />
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Plan</label>
                <select value={grantPlan} onChange={(e) => setGrantPlan(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none">
                  <option value="BASIC">Basic</option>
                  <option value="ADVANCE">Advance</option>
                  <option value="BASIC_YEARLY">Basic Yearly</option>
                  <option value="ADVANCE_YEARLY">Advance Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-muted mb-1">Days</label>
                <Input type="number" value={grantDays} onChange={(e) => setGrantDays(parseInt(e.target.value) || 30)} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={grantSub} className="flex-1">Grant</Button>
              <Button variant="ghost" onClick={() => setShowGrant(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface-light/50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Plan</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Expiry</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-text-muted uppercase">Amount</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-text-muted uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-surface-light rounded animate-pulse" /></td>
                </tr>
              ))
            ) : subs.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-50" /> No subscriptions yet
              </td></tr>
            ) : (
              subs.map((sub) => (
                <tr key={sub.id} className="border-b border-border hover:bg-surface-light/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-text-bright font-medium">{sub.user.name}</p>
                    <p className="text-xs text-text-muted">{sub.user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-bright font-medium">{sub.plan}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[sub.status] || ""}`}>{sub.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-text-muted">{new Date(sub.expiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-text-bright">&#8377;{sub.amount}</td>
                  <td className="px-6 py-4 text-right">
                    {sub.status === "ACTIVE" && (
                      <button onClick={() => cancelSub(sub.id)} className="text-xs px-3 py-1.5 rounded-lg font-medium bg-danger/10 text-danger hover:bg-danger/20 transition-colors">
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
