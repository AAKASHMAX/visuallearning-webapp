"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCircle2, Info, Sparkles, TriangleAlert, X } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  publishedAt?: string | null;
  createdAt: string;
  read: boolean;
}

const typeStyles: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  INFO: { icon: Info, color: "text-accent", bg: "bg-accent/10" },
  SUCCESS: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10" },
  ALERT: { icon: TriangleAlert, color: "text-energy", bg: "bg-energy/10" },
  UPDATE: { icon: Sparkles, color: "text-secondary-light", bg: "bg-secondary/10" },
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const totalCount = notifications.length;
  const badgeCount = unreadCount > 0 ? unreadCount : totalCount;

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await api.get("/notifications");
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }

  async function markRead() {
    if (unreadCount === 0) return;
    try {
      await api.post("/notifications/mark-read");
      setUnreadCount(0);
      setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    } catch {}
  }

  useEffect(() => {
    fetchNotifications();
    const interval = window.setInterval(fetchNotifications, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleOpen() {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) markRead();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggleOpen}
        className="relative w-10 h-10 rounded-full border border-accent/30 bg-gradient-to-br from-accent/20 to-secondary/20 text-accent hover:text-white hover:border-accent/60 hover:shadow-[0_0_28px_rgba(0,212,255,0.28)] transition-all duration-300 flex items-center justify-center"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {badgeCount > 0 && (
          <span
            className={cn(
              "absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center border border-primary",
              unreadCount > 0 ? "bg-energy text-primary" : "bg-accent text-primary"
            )}
          >
            {badgeCount > 99 ? "99+" : badgeCount}
            {unreadCount > 0 && (
              <span className="absolute inset-0 rounded-full bg-energy animate-ping opacity-60" />
            )}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-card shadow-2xl shadow-primary/60 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface/70">
            <div>
              <h3 className="text-sm font-bold text-text-bright">Notifications</h3>
              <p className="text-xs text-text-muted">{totalCount} published updates</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-light text-text-muted hover:text-text-bright">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-16 rounded-xl bg-surface-light animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-60" />
                <p className="text-sm text-text-muted">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const style = typeStyles[notification.type] || typeStyles.INFO;
                const Icon = style.icon;

                return (
                  <div key={notification.id} className="p-4 border-b border-border/70 last:border-b-0 hover:bg-surface/70 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", style.bg)}>
                        <Icon className={cn("w-4 h-4", style.color)} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-text-bright">{notification.title}</h4>
                        <p className="text-xs text-text-muted leading-relaxed mt-1">{notification.message}</p>
                        <p className="text-[11px] text-text-muted/70 mt-2">
                          {new Date(notification.publishedAt || notification.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
