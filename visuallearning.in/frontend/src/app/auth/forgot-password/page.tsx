"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { authLink, safeInternalRedirect } from "@/lib/auth-redirect";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  return <Suspense fallback={<PageLoader />}><ForgotPasswordContent /></Suspense>;
}
function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");
  const next = safeInternalRedirect(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "We couldn’t send the reset link. Please try again.");
    } finally { setLoading(false); }
  };
  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token: resetToken, password });
      toast.success("Password reset successfully!");
      window.location.href = authLink("/auth/login", next);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "We couldn’t reset your password. Please request a new link.");
    } finally { setLoading(false); }
  };

  return <AuthShell title={resetToken ? "A fresh start." : sent ? "Check your inbox." : "It happens to all of us."} eyebrow="Let’s get you back in" description={resetToken ? "Set a new password and get back to your next discovery." : sent ? "A little help is on its way to your email." : "Forgot your password? Share your email and we’ll send you a reset link."}>
    {resetToken ? <form onSubmit={handleReset} className="vl-auth-form"><PasswordInput label="New password" autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required /><Button type="submit" disabled={loading} className="w-full">{loading ? "Resetting password…" : <>Save new password <ArrowRight size={16} /></>}</Button></form>
      : sent ? <div className="vl-auth-status" role="status"><span className="vl-auth-status-icon"><MailCheck size={29} /></span><strong>Open the link in your email</strong><p>Look for a password reset email at <b>{email}</b>. Check your spam folder if you don’t see it.</p><button type="button" onClick={() => setSent(false)}>Try a different email</button></div>
      : <form onSubmit={handleForgot} className="vl-auth-form"><Input label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /><Button type="submit" disabled={loading} className="w-full">{loading ? "Sending your link…" : <>Send reset link <ArrowRight size={16} /></>}</Button></form>}
    <p className="vl-auth-switch"><Link href={authLink("/auth/login", next)}><ArrowLeft size={13} />Back to log in</Link></p>
  </AuthShell>;
}
