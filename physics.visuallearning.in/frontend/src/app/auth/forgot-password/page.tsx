"use client";

import { useState } from "react";
import Link from "next/link";
import { Atom, Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Password reset email sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary bg-grid px-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
            <Atom className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-bold text-text-bright">
            Physics<span className="text-accent">Lab</span>
          </span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <h1 className="text-2xl font-bold text-text-bright mb-2">Check Your Email</h1>
            <p className="text-text-muted mb-6">
              We&apos;ve sent a password reset link to <strong className="text-text-bright">{email}</strong>
            </p>
            <Link href="/auth/login">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-text-bright mb-2">Forgot Password</h1>
            <p className="text-text-muted mb-8">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-text-muted mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Sending..." : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-text-muted text-sm mt-8">
              <Link href="/auth/login" className="text-accent hover:text-accent-light transition-colors">
                <ArrowLeft className="w-3 h-3 inline mr-1" />
                Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
