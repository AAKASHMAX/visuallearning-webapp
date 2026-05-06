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
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      toast.error("Please enter name, email, and at least 10 characters of feedback");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/feedback", {
        name: name.trim(),
        email: email.trim(),
        subject: "Website Feedback",
        rating,
        message: message.trim(),
        pageUrl: window.location.href,
      });
      toast.success(data.message || "Feedback submitted successfully!");
      setMessage("");
      setRating(5);
      setOpen(false);
    } catch (error: any) {
      const errData = error.response?.data;
      const msg = errData?.errors?.length ? errData.errors.join(", ") : errData?.message || "Failed to submit feedback";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-[68] flex h-12 items-center gap-2 rounded-2xl border border-accent/25 bg-white/95 px-4 text-primary shadow-xl shadow-primary/15 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-accent/50 hover:bg-primary-light"
        aria-label="Open feedback form"
      >
        <MessageSquareText className="h-5 w-5" />
        <span className="text-sm font-bold">Feedback</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-primary-dark/65 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/40 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-primary to-accent px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <MessageSquareText className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black">Share Feedback</h2>
                  <p className="text-xs text-white/80">Tell us what we can improve</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded-lg p-1 transition-transform hover:scale-110"
                      aria-label={`${value} star rating`}
                    >
                      <Star className={`h-7 w-7 ${value <= rating ? "fill-cta text-cta" : "text-gray-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Feedback</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={5}
                  maxLength={1500}
                  placeholder="Write your feedback here..."
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1 text-right text-xs text-gray-400">{message.length}/1500</p>
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
