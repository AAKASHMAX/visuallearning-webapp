"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ExternalLink, Mail, MessageSquareText, RefreshCw, Star, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  rating?: number | null;
  message: string;
  pageUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  user?: { id: string; name: string; email: string } | null;
}

type FilterType = "all" | "unread";

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  const unreadCount = useMemo(() => feedback.filter((item) => !item.isRead).length, [feedback]);

  async function fetchFeedback() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/feedback?status=${filter}`);
      setFeedback(res.data || []);
    } catch {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }

  async function markRead(id: string) {
    try {
      await api.patch(`/admin/feedback/${id}/read`);
      setFeedback((items) => filter === "unread"
        ? items.filter((item) => item.id !== id)
        : items.map((item) => item.id === id ? { ...item, isRead: true } : item)
      );
      toast.success("Marked as read");
    } catch {
      toast.error("Failed to update feedback");
    }
  }

  async function deleteFeedback(id: string) {
    if (!confirm("Delete this feedback?")) return;
    try {
      await api.delete(`/admin/feedback/${id}`);
      setFeedback((items) => items.filter((item) => item.id !== id));
      toast.success("Feedback deleted");
    } catch {
      toast.error("Failed to delete feedback");
    }
  }

  function renderStars(rating?: number | null) {
    const value = rating || 0;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={`h-4 w-4 ${star <= value ? "fill-energy text-energy" : "text-text-muted/40"}`} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-bright">User Feedback</h1>
          <p className="mt-1 text-sm text-text-muted">Review feedback submitted from the student popup form</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setFilter("all")}
              className={cn("rounded-lg px-4 py-2 text-sm font-bold transition-colors", filter === "all" ? "bg-accent text-primary" : "text-text-muted hover:text-text-bright")}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={cn("rounded-lg px-4 py-2 text-sm font-bold transition-colors", filter === "unread" ? "bg-accent text-primary" : "text-text-muted hover:text-text-bright")}
            >
              Unread
            </button>
          </div>
          <Button variant="outline" onClick={fetchFeedback}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Loaded Feedback</p>
          <p className="mt-2 text-3xl font-black text-text-bright">{feedback.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Unread</p>
          <p className="mt-2 text-3xl font-black text-accent">{unreadCount}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-text-muted">Latest</p>
          <p className="mt-2 text-sm font-semibold text-text-bright">
            {feedback[0] ? new Date(feedback[0].createdAt).toLocaleString("en-IN") : "No feedback yet"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, index) => <div key={index} className="h-40 animate-pulse rounded-2xl bg-card" />)}
        </div>
      ) : feedback.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <MessageSquareText className="mx-auto mb-3 h-10 w-10 text-text-muted" />
          <p className="font-semibold text-text-bright">No feedback found</p>
          <p className="mt-1 text-sm text-text-muted">New submissions will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item.id} className={cn("rounded-2xl border bg-card p-5 transition-colors", item.isRead ? "border-border" : "border-accent/40 shadow-lg shadow-accent/5")}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", item.isRead ? "bg-surface text-text-muted" : "bg-accent/10 text-accent")}>
                      {item.isRead ? "Read" : "Unread"}
                    </span>
                    {renderStars(item.rating)}
                    <span className="text-xs text-text-muted">{new Date(item.createdAt).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="mb-3">
                    <h2 className="text-lg font-bold text-text-bright">{item.name}</h2>
                    <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1.5 text-sm text-text-muted transition-colors hover:text-accent">
                      <Mail className="h-3.5 w-3.5" />
                      {item.email}
                    </a>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-muted">{item.message}</p>

                  {item.pageUrl && (
                    <a href={item.pageUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs text-accent transition-colors hover:text-accent-light">
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open submitted page
                    </a>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!item.isRead && (
                    <button onClick={() => markRead(item.id)} className="rounded-lg p-2 transition-colors hover:bg-success/10" title="Mark as read">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </button>
                  )}
                  <a href={`mailto:${item.email}?subject=Reply from PhysicsLab Admin`} className="rounded-lg p-2 transition-colors hover:bg-accent/10" title="Reply by email">
                    <Mail className="h-4 w-4 text-accent" />
                  </a>
                  <button onClick={() => deleteFeedback(item.id)} className="rounded-lg p-2 transition-colors hover:bg-danger/10" title="Delete">
                    <Trash2 className="h-4 w-4 text-danger" />
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
