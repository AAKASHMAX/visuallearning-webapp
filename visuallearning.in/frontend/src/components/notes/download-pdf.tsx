"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Download, Loader2, Lock, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { authLink } from "@/lib/auth-redirect";
import { cn } from "@/lib/utils";

/**
 * "Download PDF" for a Notes / NCERT / PYQ document. Chapter 1 of every subject is free for anyone
 * signed in; every other PDF needs a yearly plan. The server decides; the popup explains.
 */

type Gate = "signup-free" | "signup-paid" | "yearly";

const GATES: Record<Gate, { title: string; body: string }> = {
  "signup-free": {
    title: "Download this PDF free",
    body: "Create your free account to download it. Chapter 1 PDFs (Notes, NCERT solutions and PYQs) of every subject are free for everyone who signs up.",
  },
  "signup-paid": {
    title: "PDF download is on the yearly plan",
    body: "Downloading this PDF is available only on the yearly subscription. With a free account you can read every chapter online and download Chapter 1 PDFs of every subject.",
  },
  yearly: {
    title: "PDF download is on the yearly plan",
    body: "PDF download is available only on the yearly subscription. Chapter 1 PDFs of every subject are free to download.",
  },
};

export function DownloadPdfButton({
  noteId,
  freeChapter,
  canDownload,
  returnTo,
  className,
}: {
  noteId: string;
  /** First chapter of its subject: free for anyone signed in. */
  freeChapter?: boolean;
  /** Known from the server (course viewer). Left out on public pages, where the server is asked on click. */
  canDownload?: boolean;
  /** Where sign-up / log-in brings the student back to. */
  returnTo?: string;
  className?: string;
}) {
  const { isAuthenticated } = useAuth();
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState<Gate | null>(null);
  const locked = isAuthenticated ? canDownload === false : !freeChapter;

  const start = async () => {
    if (!isAuthenticated) return setGate(freeChapter ? "signup-free" : "signup-paid");
    if (canDownload === false) return setGate("yearly");
    setBusy(true);
    try {
      const { data } = await api.post(`/courses/notes/${noteId}/download`);
      // A file response: the browser saves it and stays on this page.
      window.location.assign(`${api.defaults.baseURL}${data.data.url}`);
    } catch (err: any) {
      const status = err?.response?.status;
      const reason = err?.response?.data?.errors?.reason;
      if (reason === "yearly_required") setGate("yearly");
      else if (status === 401) setGate(freeChapter ? "signup-free" : "signup-paid");
      else if (reason === "not_ready") toast("This PDF is being prepared. Please try again a little later.");
      else if (status === 429) toast.error("Too many downloads at once. Please try again in a few minutes.");
      else toast.error("Couldn't start the download. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={start} disabled={busy} aria-label="Download PDF" className={className}>
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : locked ? <Lock className="h-3.5 w-3.5" aria-hidden="true" /> : <Download className="h-3.5 w-3.5" aria-hidden="true" />}
        <span>Download PDF</span>
      </button>
      {gate && <DownloadGate gate={gate} returnTo={returnTo} onClose={() => setGate(null)} />}
    </>
  );
}

function DownloadGate({ gate, returnTo, onClose }: { gate: Gate; returnTo?: string; onClose: () => void }) {
  const primary = useRef<HTMLAnchorElement>(null);
  const { title, body } = GATES[gate];
  const signup = gate !== "yearly";

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-gate-title"
        className="relative w-full max-w-md rounded-t-2xl border border-card-border bg-card p-6 text-left shadow-2xl sm:rounded-2xl"
        style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-text-muted hover:bg-card-hover hover:text-heading">
          <X className="h-4 w-4" />
        </button>
        <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", gate === "signup-free" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300")}>
          {gate === "signup-free" ? <Download className="h-6 w-6" aria-hidden="true" /> : <Lock className="h-6 w-6" aria-hidden="true" />}
        </span>
        <h2 id="download-gate-title" className="mt-4 text-lg font-black text-heading">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">{body}</p>
        <div className="mt-5 flex gap-3">
          {signup ? (
            <>
              <Link href={authLink("/auth/login", returnTo)} className="flex-1 rounded-lg border border-card-border px-4 py-2.5 text-center text-sm font-black text-heading hover:bg-card-hover">
                Log in
              </Link>
              <Link ref={primary} href={authLink("/auth/signup", returnTo)} className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-black text-primary-dark hover:bg-accent-light">
                Sign up free
              </Link>
            </>
          ) : (
            <>
              <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-card-border px-4 py-2.5 text-sm font-black text-heading hover:bg-card-hover">
                Not now
              </button>
              <Link ref={primary} href="/pricing" className="flex-1 rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-black text-primary-dark hover:bg-accent-light">
                See yearly plans
              </Link>
            </>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
