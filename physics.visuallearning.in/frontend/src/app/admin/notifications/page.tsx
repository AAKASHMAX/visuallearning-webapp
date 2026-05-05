"use client";

import { useEffect, useState } from "react";
import { Bell, Edit2, Plus, Send, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isPublished: boolean;
  publishedAt?: string | null;
  createdAt: string;
  _count?: { reads: number };
}

const notificationTypes = ["INFO", "UPDATE", "SUCCESS", "ALERT"];

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NotificationItem | null>(null);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("INFO");
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/admin/notifications");
      setNotifications(res.data);
    } catch {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setTitle("");
    setMessage("");
    setType("INFO");
    setIsPublished(true);
    setShowForm(true);
  }

  function openEdit(notification: NotificationItem) {
    setEditing(notification);
    setTitle(notification.title);
    setMessage(notification.message);
    setType(notification.type);
    setIsPublished(notification.isPublished);
    setShowForm(true);
  }

  async function saveNotification() {
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    const payload = { title: title.trim(), message: message.trim(), type, isPublished };

    try {
      if (editing) {
        await api.put(`/admin/notifications/${editing.id}`, payload);
        toast.success("Notification updated");
      } else {
        await api.post("/admin/notifications", payload);
        toast.success(isPublished ? "Notification published" : "Notification saved");
      }
      setShowForm(false);
      fetchNotifications();
    } catch {
      toast.error("Failed to save notification");
    }
  }

  async function publishNotification(id: string) {
    try {
      await api.patch(`/admin/notifications/${id}/publish`);
      toast.success("Notification published");
      fetchNotifications();
    } catch {
      toast.error("Failed to publish notification");
    }
  }

  async function deleteNotification(id: string) {
    if (!confirm("Delete this notification?")) return;
    try {
      await api.delete(`/admin/notifications/${id}`);
      toast.success("Notification deleted");
      fetchNotifications();
    } catch {
      toast.error("Failed to delete notification");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">Notifications</h1>
          <p className="text-text-muted text-sm mt-1">Publish updates to every student bell</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Notification
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-text-bright">{editing ? "Edit Notification" : "Create Notification"}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-muted mb-1">Title</label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. New chapter added" />
              </div>

              <div>
                <label className="block text-sm text-text-muted mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  placeholder="Write the notification students should see"
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-muted mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-text focus:border-accent focus:outline-none"
                  >
                    {notificationTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 mt-6 sm:mt-0">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(event) => setIsPublished(event.target.checked)}
                    className="w-4 h-4 accent-cyan-400"
                  />
                  <span className="text-sm text-text-bright">Publish immediately</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={saveNotification} className="flex-1">
                {isPublished ? <Send className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                {editing ? "Save Changes" : isPublished ? "Publish" : "Save Draft"}
              </Button>
              <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => <div key={index} className="h-28 rounded-xl bg-card animate-pulse" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Bell className="w-8 h-8 text-text-muted mx-auto mb-2" />
          <p className="text-text-muted">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-xl border border-border bg-card p-5 hover:border-accent/25 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={cn(
                      "text-[11px] font-bold px-2 py-1 rounded-full",
                      notification.isPublished ? "bg-success/10 text-success" : "bg-energy/10 text-energy"
                    )}>
                      {notification.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-accent/10 text-accent">
                      {notification.type}
                    </span>
                    <span className="text-xs text-text-muted">
                      {notification.isPublished && notification.publishedAt
                        ? `Published ${new Date(notification.publishedAt).toLocaleDateString()}`
                        : `Created ${new Date(notification.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text-bright">{notification.title}</h3>
                  <p className="text-sm text-text-muted leading-relaxed mt-1">{notification.message}</p>
                  <p className="text-xs text-text-muted/70 mt-3">{notification._count?.reads || 0} students viewed</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notification.isPublished && (
                    <button onClick={() => publishNotification(notification.id)} className="p-2 rounded-lg hover:bg-success/10 transition-colors" title="Publish">
                      <Send className="w-4 h-4 text-success" />
                    </button>
                  )}
                  <button onClick={() => openEdit(notification)} className="p-2 rounded-lg hover:bg-surface-light transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4 text-text-muted" />
                  </button>
                  <button onClick={() => deleteNotification(notification.id)} className="p-2 rounded-lg hover:bg-danger/10 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4 text-danger" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
