"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquareText, Send, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function FeedbackPopup() {
  const { user, hydrate } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user) return;
    setName((value) => value || user.name);
    setEmail((value) => value || user.email);
  }, [user]);

  async function submitFeedback() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill name, email, and feedback");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/feedback", {
        name: name.trim(),
        email: email.trim(),
        rating,
        message: message.trim(),
        pageUrl: window.location.href,
      });
      toast.success("Feedback submitted. Thank you!");
      setMessage("");
      setRating(5);
      setOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-[68] flex h-12 items-center gap-2 rounded-2xl border border-secondary/30 bg-card/95 px-4 text-secondary-light shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-secondary/50 hover:bg-secondary/15"
        aria-label="Open feedback form"
      >
        <MessageSquareText className="h-5 w-5" />
        <span className="text-sm font-bold text-text-bright">Feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-accent/25 bg-card shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-accent/12 to-secondary/12 px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-secondary text-white shadow-[0_0_26px_rgba(0,212,255,0.22)]">
                  <MessageSquareText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-text-bright">Share Feedback</h2>
                  <p className="text-xs text-text-muted">Tell us what we can improve</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-light hover:text-text-bright">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Name</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-text-muted">Email</label>
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-text-muted">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-lg p-1 transition-transform hover:scale-110"
                      aria-label={`${value} star rating`}
                    >
                      <Star className={`h-7 w-7 ${value <= rating ? "fill-energy text-energy" : "text-text-muted/50"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-text-muted">Feedback</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  maxLength={1500}
                  placeholder="Write your feedback here..."
                  className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none transition-colors focus:border-accent"
                />
                <p className="mt-1 text-right text-[11px] text-text-muted">{message.length}/1500</p>
              </div>

              <Button onClick={submitFeedback} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                Submit Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
