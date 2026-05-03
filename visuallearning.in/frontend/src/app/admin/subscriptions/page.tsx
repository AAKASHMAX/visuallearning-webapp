"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Plus, X, Pencil, Ban, Save, Users, CheckCircle2,
  Clock, IndianRupee, Search, ChevronLeft, ChevronRight,
  Atom, FlaskConical, Dna, Calculator, Sparkles
} from "lucide-react";

interface SubRow {
  id: string; plan: string; classesAccess: string[];
  status: string; expiryDate: string; amount: number;
  createdAt: string; user: { id: string; name: string; email: string };
}

function statusColor(s: string) {
  if (s === "ACTIVE")    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (s === "EXPIRED")   return "bg-gray-100 text-gray-500 border-gray-200";
  if (s === "CANCELLED") return "bg-rose-100 text-rose-600 border-rose-200";
  return "bg-gray-100 text-gray-500 border-gray-200";
}

function planColor(plan: string) {
  const p = plan.toLowerCase();
  if (p.includes("foundation") || p.includes("free")) return "bg-sky-100 text-sky-700 border-sky-200";
  if (p.includes("academic") || p.includes("plus"))   return "bg-blue-100 text-blue-700 border-blue-200";
  if (p.includes("elite") || p.includes("premium"))   return "bg-purple-100 text-purple-700 border-purple-200";
  if (p.includes("flexi") || p.includes("custom"))    return "bg-indigo-100 text-indigo-700 border-indigo-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function subjectIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes("physics"))   return { Icon: Atom,        grad: "from-sky-400 to-blue-600",    bg: "from-sky-50 to-blue-50",    border: "border-sky-100",    text: "text-sky-600" };
  if (n.includes("chemistry")) return { Icon: FlaskConical, grad: "from-emerald-400 to-teal-500", bg: "from-emerald-50 to-teal-50", border: "border-emerald-100", text: "text-emerald-600" };
  if (n.includes("biology"))   return { Icon: Dna,          grad: "from-rose-400 to-fuchsia-500", bg: "from-rose-50 to-pink-50",   border: "border-rose-100",   text: "text-rose-500" };
  if (n.includes("math"))      return { Icon: Calculator,   grad: "from-violet-400 to-purple-600", bg: "from-violet-50 to-purple-50", border: "border-violet-100", text: "text-violet-600" };
  return                              { Icon: Sparkles,     grad: "from-cyan-400 to-teal-500",    bg: "from-cyan-50 to-teal-50",   border: "border-cyan-100",   text: "text-cyan-600" };
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function AdminSubscriptionsPage() {
  const [subs,          setSubs]          = useState<SubRow[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [page,          setPage]          = useState(1);
  const [totalPages,    setTotalPages]    = useState(1);
  const [statusFilter,  setStatusFilter]  = useState("");
  const [search,        setSearch]        = useState("");
  const [showGrant,     setShowGrant]     = useState(false);
  const [editingSub,    setEditingSub]    = useState<SubRow | null>(null);
  const [classes,       setClasses]       = useState<{ id: string; name: string }[]>([]);
  const [planLabels,    setPlanLabels]    = useState<Record<string, string>>({});
  const [planKeys,      setPlanKeys]      = useState<string[]>([]);
  const [activeClassTab, setActiveClassTab] = useState<string>("");

  // Subject pricing
  const [subjectPricing,  setSubjectPricing]  = useState<any[]>([]);
  const [loadingPricing,  setLoadingPricing]  = useState(false);
  const [editingPrice,    setEditingPrice]    = useState<{ id: string; price: number } | null>(null);
  const [savingPrice,     setSavingPrice]     = useState(false);

  // Grant form
  const [grantForm, setGrantForm] = useState({ userId: "", plan: "", durationDays: 365, classesAccess: [] as string[] });
  // Edit form
  const [editForm,  setEditForm]  = useState({ plan: "", status: "", expiryDate: "", classesAccess: [] as string[] });

  useEffect(() => {
    api.get("/courses/classes").then(({ data }) => {
      const cls = data.data;
      setClasses(cls);
      setActiveClassTab(cls[0]?.id ?? "");
    });
    api.get("/admin/settings").then(({ data }) => {
      const plans = data.data.plansConfig || {};
      const labels: Record<string, string> = {};
      Object.entries(plans).forEach(([k, v]: [string, any]) => { labels[k] = v.label; });
      setPlanLabels(labels);
      setPlanKeys(Object.keys(plans));
      setGrantForm((f) => ({ ...f, plan: Object.keys(plans)[0] ?? "" }));
    });
    loadSubjectPricing();
  }, []);

  const loadSubjectPricing = () => {
    setLoadingPricing(true);
    api.get("/admin/subject-access").then(({ data }) => setSubjectPricing(data.data))
      .finally(() => setLoadingPricing(false));
  };

  const updateSubjectPrice = async (id: string, price: number) => {
    setSavingPrice(true);
    try {
      await api.put(`/admin/subjects/${id}`, { price });
      toast.success("Price updated");
      setEditingPrice(null);
      loadSubjectPricing();
    } catch { toast.error("Failed to update price"); }
    finally { setSavingPrice(false); }
  };

  const load = () => {
    setLoading(true);
    api.get(`/admin/subscriptions?page=${page}&status=${statusFilter}`)
      .then(({ data }) => { setSubs(data.data.subscriptions); setTotalPages(data.data.totalPages); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, statusFilter]);

  const handleGrant = async () => {
    try {
      await api.post("/admin/subscriptions", grantForm);
      toast.success("Subscription granted");
      setShowGrant(false);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed to grant"); }
  };

  const handleUpdate = async () => {
    if (!editingSub) return;
    try {
      await api.put(`/admin/subscriptions/${editingSub.id}`, editForm);
      toast.success("Updated");
      setEditingSub(null);
      load();
    } catch (err: any) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this subscription?")) return;
    try { await api.delete(`/admin/subscriptions/${id}`); toast.success("Cancelled"); load(); }
    catch { toast.error("Failed"); }
  };

  const startEdit = (sub: SubRow) => {
    setEditingSub(sub);
    setEditForm({ plan: sub.plan, status: sub.status, expiryDate: sub.expiryDate.split("T")[0], classesAccess: sub.classesAccess || [] });
  };

  const toggleClass = (classId: string, form: "grant" | "edit") => {
    if (form === "grant") setGrantForm((p) => ({ ...p, classesAccess: p.classesAccess.includes(classId) ? p.classesAccess.filter((c) => c !== classId) : [...p.classesAccess, classId] }));
    else setEditForm((p) => ({ ...p, classesAccess: p.classesAccess.includes(classId) ? p.classesAccess.filter((c) => c !== classId) : [...p.classesAccess, classId] }));
  };

  // Stats
  const active    = subs.filter((s) => s.status === "ACTIVE").length;
  const expired   = subs.filter((s) => s.status === "EXPIRED").length;
  const revenue   = subs.reduce((sum, s) => sum + (s.amount || 0), 0);

  const filtered = search
    ? subs.filter((s) => s.user.name.toLowerCase().includes(search.toLowerCase()) || s.user.email.toLowerCase().includes(search.toLowerCase()))
    : subs;

  const activeClassData = subjectPricing.find((c) => c.id === activeClassTab);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Subscription Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage user subscriptions and grant access</p>
        </div>
        <Button onClick={() => { setShowGrant(!showGrant); setEditingSub(null); }}
          className="flex items-center gap-2 rounded-xl font-bold shadow-sm">
          {showGrant ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Grant Subscription</>}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active",  value: active,  icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Expired", value: expired, icon: Clock,        color: "text-gray-500",    bg: "bg-gray-50",    border: "border-gray-100" },
          { label: "Revenue", value: `₹${(revenue / 100).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`rounded-2xl border ${border} ${bg} p-4 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center border ${border}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</p>
              <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grant Form */}
      {showGrant && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-6">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Grant New Subscription
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">User ID</label>
              <input value={grantForm.userId} onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })}
                placeholder="Paste user ID" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Plan</label>
              <select value={grantForm.plan} onChange={(e) => setGrantForm({ ...grantForm, plan: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                {planKeys.map((k) => <option key={k} value={k}>{planLabels[k] || k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Duration (days)</label>
              <input type="number" value={grantForm.durationDays} onChange={(e) => setGrantForm({ ...grantForm, durationDays: parseInt(e.target.value) || 365 })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <Button onClick={handleGrant} className="rounded-xl font-bold">Grant Access</Button>
        </div>
      )}

      {/* Edit Form */}
      {editingSub && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900">
              Editing: <span className="text-primary">{editingSub.user.name}</span>
              <span className="text-gray-400 font-normal text-sm ml-2">({editingSub.user.email})</span>
            </h3>
            <button onClick={() => setEditingSub(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Plan</label>
              <select value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                {planKeys.map((k) => <option key={k} value={k}>{planLabels[k] || k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Expiry Date</label>
              <input type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdate} className="w-full rounded-xl font-bold">
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {["", "ACTIVE", "EXPIRED", "CANCELLED"].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                statusFilter === s ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}>
              {s || "All"}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary/40 w-64" />
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">User</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Plan</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry</th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400">Amount</th>
                  <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-black text-primary">{initials(sub.user.name)}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[13px]">{sub.user.name}</p>
                          <p className="text-[11px] text-gray-400">{sub.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${planColor(planLabels[sub.plan] || sub.plan)}`}>
                        {planLabels[sub.plan] || sub.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColor(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[13px] text-gray-500 font-medium">
                      {new Date(sub.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-black text-gray-700">
                      ₹{(sub.amount / 100).toLocaleString("en-IN")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(sub)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {sub.status === "ACTIVE" && (
                          <button onClick={() => handleCancel(sub.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-all">
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No subscriptions found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-1.5">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 hover:border-gray-300 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40 hover:border-gray-300 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Subject Pricing (Custom / FlexiLearn Plans) ── */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900">FlexiLearn Subject Pricing</h2>
            <p className="text-xs text-gray-500">Set per-subject prices for the Customized Learning plan</p>
          </div>
        </div>

        {/* Class tabs */}
        <div className="flex gap-2 mb-5 mt-4 overflow-x-auto pb-1">
          {subjectPricing.map((cls) => (
            <button key={cls.id} onClick={() => setActiveClassTab(cls.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
                activeClassTab === cls.id
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
              }`}>
              {cls.name}
            </button>
          ))}
        </div>

        {/* Subject cards for active class */}
        {loadingPricing ? <PageLoader /> : activeClassData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeClassData.subjects.map((sub: any) => {
              const t = subjectIcon(sub.name);
              const isEditing = editingPrice?.id === sub.id;
              return (
                <div key={sub.id} className={`bg-gradient-to-br ${t.bg} border ${t.border} rounded-2xl p-4 transition-all`}>
                  {/* Icon + name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.grad} flex items-center justify-center shadow-sm`}>
                      <t.Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-gray-900 truncate">{sub.name}</h4>
                      <span className={`text-[10px] font-bold ${sub.enabled ? "text-emerald-600" : "text-gray-400"}`}>
                        {sub.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center flex-1 border border-gray-300 rounded-xl overflow-hidden bg-white">
                        <span className="px-2 text-sm font-bold text-gray-400">₹</span>
                        <input
                          type="number"
                          value={editingPrice!.price}
                          onChange={(e) => setEditingPrice({ ...editingPrice!, price: parseInt(e.target.value) || 0 })}
                          className="flex-1 py-2 pr-2 text-sm font-black focus:outline-none"
                          autoFocus
                        />
                      </div>
                      <button onClick={() => updateSubjectPrice(sub.id, editingPrice!.price)} disabled={savingPrice}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors">
                        <Save className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingPrice(null)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-black ${t.text}`}>₹{sub.price || 0}</span>
                      <button onClick={() => setEditingPrice({ id: sub.id, price: sub.price || 0 })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all">
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm text-center py-8">No subjects found.</p>
        )}
      </div>
    </div>
  );
}
