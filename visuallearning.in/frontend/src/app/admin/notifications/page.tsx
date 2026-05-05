"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Pencil, Plus, Send, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ALERT";
  linkUrl?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  _count?: { reads: number };
}

const emptyForm = {
  title: "",
  message: "",
  type: "INFO" as AdminNotification["type"],
  linkUrl: "",
  published: false,
};

function typeColor(type: string) {
  if (type === "ALERT") return "bg-red-100 text-red-700 border-red-200";
  if (type === "WARNING") return "bg-amber-100 text-amber-700 border-amber-200";
  if (type === "SUCCESS") return "bg-emerald-100 text-emerald-700 border-emerald-200";
  return "bg-sky-100 text-sky-700 border-sky-200";
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/notifications");
      setNotifications(data.data || []);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (notification: AdminNotification) => {
    setEditingId(notification.id);
    setForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      linkUrl: notification.linkUrl || "",
      published: notification.published,
    });
    setShowForm(true);
  };

  const save = async () => {
    try {
      const payload = { ...form, linkUrl: form.linkUrl.trim() || null };
      if (editingId) {
        await api.put(`/admin/notifications/${editingId}`, payload);
        toast.success("Notification updated");
      } else {
        await api.post("/admin/notifications", payload);
        toast.success(form.published ? "Notification published" : "Notification saved");
      }
      resetForm();
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save notification");
    }
  };

  const togglePublish = async (id: string) => {
    try {
      const { data } = await api.patch(`/admin/notifications/${id}/toggle`);
      toast.success(data.message || "Notification updated");
      load();
    } catch {
      toast.error("Failed to update notification");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      toast.success("Notification deleted");
      load();
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Publish updates that appear in every user's notification bell.</p>
        </div>
        <Button onClick={() => showForm ? resetForm() : setShowForm(true)} className="rounded-xl font-bold">
          {showForm ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Plus className="mr-2 h-4 w-4" /> New Notification</>}
        </Button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. New chapters added" />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as AdminNotification["type"] })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="WARNING">Warning</option>
                <option value="ALERT">Alert</option>
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                placeholder="Write the notification users should see..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Input label="Optional Link URL" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." />
            <label className="flex items-center gap-2 self-end rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-600">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publish immediately
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save} className="rounded-xl font-bold">
              <Send className="mr-2 h-4 w-4" /> {editingId ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      )}

      {loading ? <PageLoader /> : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Notification</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Reads</th>
                <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notifications.map((notification) => (
                <tr key={notification.id} className="hover:bg-gray-50/70">
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <p className="font-black text-gray-900">{notification.title}</p>
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${typeColor(notification.type)}`}>{notification.type}</span>
                        </div>
                        <p className="max-w-2xl whitespace-pre-wrap text-xs leading-relaxed text-gray-500">{notification.message}</p>
                        {notification.linkUrl && <p className="mt-1 text-[11px] font-mono text-gray-400">{notification.linkUrl}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${notification.published ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {notification.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-500">{notification._count?.reads || 0}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => togglePublish(notification.id)} className="rounded-lg">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> {notification.published ? "Unpublish" : "Publish"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => startEdit(notification)} className="h-8 w-8 p-0"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(notification.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {notifications.length === 0 && (
                <tr><td colSpan={4} className="p-12 text-center text-gray-400">No notifications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
