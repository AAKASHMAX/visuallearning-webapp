"use client";

import { useEffect, useRef, useState } from "react";
import { Mail, MessageCircle, Phone, X } from "lucide-react";
import api from "@/lib/api";

type ContactInfo = {
  email: string;
  phone: string;
};

const fallbackContact: ContactInfo = {
  email: "visuallearning247@gmail.com",
  phone: "+91 9718154204",
};

function phoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

function displayPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return fallbackContact.phone;
  return trimmed.startsWith("+") ? trimmed : `+91 ${trimmed}`;
}

export function FloatingContact() {
  const closeTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState<ContactInfo>(fallbackContact);

  useEffect(() => {
    api.get("/admin/public-settings")
      .then(({ data }) => {
        const info = data.data?.contactInfo || {};
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
      <div className={`overflow-hidden rounded-2xl border border-primary/15 bg-white/95 shadow-2xl shadow-primary/20 backdrop-blur-xl transition-all duration-300 ${open ? "w-[min(20rem,calc(100vw-2.5rem))]" : "w-14"}`}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex w-full items-center gap-3 bg-gradient-to-r from-primary to-accent text-left text-white transition-opacity hover:opacity-95 ${open ? "px-4 py-3" : "h-14 justify-center"}`}
          aria-label="Ask to Admin"
          aria-expanded={open}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
            <MessageCircle className="h-5 w-5 text-white" />
          </span>
          {open && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black uppercase tracking-wide">Ask to Admin</span>
                <span className="block text-xs text-white/80">Contact support</span>
              </span>
              <X className="h-4 w-4 shrink-0 text-white/80" />
            </>
          )}
        </button>

        {open && (
          <div className="space-y-3 px-4 pb-4 pt-3">
            <a
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm text-gray-600 transition-colors hover:border-primary/25 hover:text-primary"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{contact.email}</span>
            </a>

            <a
              href={phoneHref(displayPhone(contact.phone))}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-surface px-3 py-3 text-sm text-gray-600 transition-colors hover:border-success/25 hover:text-success"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                <Phone className="h-4 w-4" />
              </span>
              <span className="min-w-0 truncate">{displayPhone(contact.phone)}</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
