"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import api from "@/lib/api";

type ContactInfo = {
  email: string;
  phone: string;
};

const fallbackContact: ContactInfo = {
  email: "support@visuallearning.in",
  phone: "+91 9718154204",
};

function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

export function FloatingContact() {
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<ContactInfo>(fallbackContact);

  useEffect(() => {
    api.get("/admin/public-settings")
      .then((res) => {
        const info = res.data?.contact_info || {};
        setContact({
          email: info.email || fallbackContact.email,
          phone: info.phone || fallbackContact.phone,
        });
      })
      .catch(() => setContact(fallbackContact));
  }, []);

  function clearCloseTimer() {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setOpen(false), 900);
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-[70] flex justify-end"
      onMouseEnter={clearCloseTimer}
      onMouseLeave={scheduleClose}
    >
      <div className={`overflow-hidden rounded-2xl border border-accent/25 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl transition-all duration-300 ${open ? "w-[min(20rem,calc(100vw-2.5rem))]" : "w-14"}`}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full items-center gap-3 bg-gradient-to-r from-accent/18 to-secondary/18 text-left transition-colors hover:from-accent/25 hover:to-secondary/25 ${open ? "px-4 py-3" : "h-14 justify-center"}`}
          aria-label="Ask to Admin"
          aria-expanded={open}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-secondary shadow-[0_0_24px_rgba(0,212,255,0.25)]">
            <MessageCircle className="h-5 w-5 text-white" />
          </span>
          {open && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black uppercase tracking-wide text-text-bright">Ask to Admin</span>
                <span className="block text-xs text-text-muted">Contact support</span>
              </span>
              <X className="h-4 w-4 shrink-0 text-text-muted" />
            </>
          )}
        </button>

        {open && (
          <div className="space-y-3 px-4 pb-4 pt-3">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-3 py-3 text-sm text-text-muted transition-colors hover:border-accent/30 hover:text-accent"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{contact.email}</span>
            </a>

            <a
              href={phoneHref(contact.phone)}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface/80 px-3 py-3 text-sm text-text-muted transition-colors hover:border-success/30 hover:text-success"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Phone className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{contact.phone}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
