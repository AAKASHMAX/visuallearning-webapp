"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, X, Pencil, Ban, DollarSign, Save } from "lucide-react";

interface SubRow {
  id: string;
  plan: string;
  classesAccess: string[];
  status: string;
  expiryDate: string;
  amount: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

// Will be loaded from settings API

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubs] = useState<SubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [showGrant, setShowGrant] = useState(false);
  const [editingSub, setEditingSub] = useState<SubRow | null>(null);

  // Grant form
  const [grantForm, setGrantForm] = useState({ userId: "", plan: "MONTHLY", durationDays: 30, classesAccess: [] as string[] });
  // Edit form
  const [editForm, setEditForm] = useState({ plan: "", status: "", expiryDate: "", classesAccess: [] as string[] });

  // Classes for selection
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  // Plan labels from settings
  const [planLabels, setPlanLabels] = useState<Record<string, string>>({});
  const [planKeys, setPlanKeys] = useState<string[]>([]);
  
  // Subject pricing
  const [subjectPricing, setSubjectPricing] = useState<any[]>([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [editingPrice, setEditingPrice] = useState<{ id: string; price: number } | null>(null);

  useEffect(() => {
    api.get("/courses/classes").then(({ data }) => setClasses(data.data));
    api.get("/admin/settings").then(({ data }) => {
      const plans = data.data.plansConfig || {};
      const labels: Record<string, string> = {};
      Object.entries(plans).forEach(([k, v]: [string, any]) => { labels[k] = v.label; });
      setPlanLabels(labels);
      setPlanKeys(Object.keys(plans));
    });
    loadSubjectPricing();
  }, []);

  const loadSubjectPricing = () => {
    setLoadingPricing(true);
    api.get("/admin/subject-access").then(({ data }) => {
      setSubjectPricing(data.data);
    }).finally(() => setLoadingPricing(false));
  };

  const updateSubjectPrice = async (id: string, price: number) => {
    try {
      await api.put(`/admin/subjects/${id}`, { price });
      toast.success("Price updated");
      setEditingPrice(null);
      loadSubjectPricing();
    } catch {
      toast.error("Failed to update price");
    }
  };

  const load = () => {
    setLoading(true);
    api.get(`/admin/subscriptions?page=${page}&status=${statusFilter}`).then(({ data }) => {
      setSubs(data.data.subscriptions);
      setTotalPages(data.data.totalPages);
    }).finally(() => setLoading(false));
  };

  useEffect(load, [page, statusFilter]);

  const handleGrant = async () => {
    try {
      await api.post("/admin/subscriptions", grantForm);
      toast.success("Subscription granted");
      setShowGrant(false);
      setGrantForm({ userId: "", plan: "MONTHLY", durationDays: 30, classesAccess: [] });
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to grant subscription");
    }
  };

  const handleUpdate = async () => {
    if (!editingSub) return;
    try {
      await api.put(`/admin/subscriptions/${editingSub.id}`, editForm);
      toast.success("Subscription updated");
      setEditingSub(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this subscription?")) return;
    try {
      await api.delete(`/admin/subscriptions/${id}`);
      toast.success("Subscription cancelled");
      load();
    } catch { toast.error("Failed to cancel"); }
  };

  const startEdit = (sub: SubRow) => {
    setEditingSub(sub);
    setEditForm({
      plan: sub.plan,
      status: sub.status,
      expiryDate: sub.expiryDate.split("T")[0],
      classesAccess: sub.classesAccess || [],
    });
  };

  const toggleClassInForm = (classId: string, form: "grant" | "edit") => {
    if (form === "grant") {
      setGrantForm((prev) => ({
        ...prev,
        classesAccess: prev.classesAccess.includes(classId)
          ? prev.classesAccess.filter((c) => c !== classId)
          : [...prev.classesAccess, classId],
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        classesAccess: prev.classesAccess.includes(classId)
          ? prev.classesAccess.filter((c) => c !== classId)
          : [...prev.classesAccess, classId],
      }));
    }
  };

  const needsClassSelect = (plan: string) => ["SINGLE_CLASS", "MULTI_CLASS"].includes(plan);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Subscription Management</h1>
        <Button onClick={() => setShowGrant(!showGrant)}>
          {showGrant ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Grant Subscription</>}
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 mb-4">
        {["", "ACTIVE", "EXPIRED", "CANCELLED"].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? "bg-primary text-white" : "bg-white border text-gray-600"}`}>
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Grant Form */}
      {showGrant && (
        <Card className="mb-6">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold mb-2">Grant New Subscription</h3>
            <Input label="User ID" value={grantForm.userId} onChange={(e) => setGrantForm({ ...grantForm, userId: e.target.value })} placeholder="Paste user ID" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select value={grantForm.plan} onChange={(e) => setGrantForm({ ...grantForm, plan: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full">
                {planKeys.map((k) => <option key={k} value={k}>{planLabels[k] || k}</option>)}
              </select>
            </div>
            <Input label="Duration (days)" type="number" value={grantForm.durationDays} onChange={(e) => setGrantForm({ ...grantForm, durationDays: parseInt(e.target.value) || 30 })} />
            {needsClassSelect(grantForm.plan) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Classes</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" checked={grantForm.classesAccess.includes(c.id)} onChange={() => toggleClassInForm(c.id, "grant")} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={handleGrant}>Grant Subscription</Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {editingSub && (
        <Card className="mb-6 border-blue-200">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Editing: {editingSub.user.name} ({editingSub.user.email})</h3>
              <button onClick={() => setEditingSub(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select value={editForm.plan} onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full">
                {planKeys.map((k) => <option key={k} value={k}>{planLabels[k] || k}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                className="border rounded-lg px-3 py-2 text-sm w-full">
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <Input label="Expiry Date" type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} />
            {needsClassSelect(editForm.plan) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classes Access</label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-1.5 text-sm">
                      <input type="checkbox" checked={editForm.classesAccess.includes(c.id)} onChange={() => toggleClassInForm(c.id, "edit")} />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <Button onClick={handleUpdate}>Save Changes</Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {loading ? <PageLoader /> : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-gray-50">
                  <th className="p-4">User</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Classes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b last:border-0">
                    <td className="p-4">
                      <p className="font-medium">{sub.user.name}</p>
                      <p className="text-xs text-gray-400">{sub.user.email}</p>
                    </td>
                    <td className="p-4"><Badge variant="info">{planLabels[sub.plan] || sub.plan}</Badge></td>
                    <td className="p-4 text-xs text-gray-500">
                      {sub.classesAccess.length > 0
                        ? classes.filter((c) => sub.classesAccess.includes(c.id)).map((c) => c.name).join(", ") || "All"
                        : "All"}
                    </td>
                    <td className="p-4">
                      <Badge variant={sub.status === "ACTIVE" ? "success" : sub.status === "EXPIRED" ? "default" : "danger"}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(sub.expiryDate).toLocaleDateString("en-IN")}</td>
                    <td className="p-4 text-gray-500">Rs {sub.amount / 100}</td>
                    <td className="p-4 flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => startEdit(sub)}><Pencil className="w-4 h-4" /></Button>
                      {sub.status === "ACTIVE" && (
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleCancel(sub.id)}><Ban className="w-4 h-4" /></Button>
                      )}
                    </td>
                  </tr>
                ))}
                {subscriptions.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-gray-400">No subscriptions found.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex gap-2 mt-4 justify-center">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      {/* Subject Pricing Section */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold">Subject Pricing (Custom Plans)</h2>
        </div>
        
        {loadingPricing ? <PageLoader /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjectPricing.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-bold text-gray-900">{cls.name}</h3>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {cls.subjects.map((sub: any) => (
                      <div key={sub.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{sub.name}</span>
                          {!sub.enabled && <Badge variant="default" className="text-[9px] h-4">Disabled</Badge>}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {editingPrice?.id === sub.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-400">₹</span>
                              <Input 
                                type="number" 
                                className="w-24 h-8 text-sm" 
                                value={editingPrice!.price} 
                                onChange={(e) => setEditingPrice({ ...editingPrice!, price: parseInt(e.target.value) || 0 })}
                              />
                              <Button size="sm" className="h-8 px-2" onClick={() => updateSubjectPrice(sub.id, editingPrice!.price)}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setEditingPrice(null)}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-gray-900">₹{sub.price || 0}</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setEditingPrice({ id: sub.id, price: sub.price || 0 })}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
