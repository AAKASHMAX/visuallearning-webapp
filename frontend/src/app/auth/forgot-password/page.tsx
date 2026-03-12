"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const resetToken = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent to your email");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token: resetToken, password });
      toast.success("Password reset successfully!");
      window.location.href = "/auth/login";
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-primary">
              <BookOpen className="w-8 h-8 text-accent" />
              VisualLearning
            </Link>
            <p className="text-gray-500 mt-2">{resetToken ? "Set your new password" : "Reset your password"}</p>
          </div>
          {resetToken ? (
            <form onSubmit={handleReset} className="space-y-4">
              <Input label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required />
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Resetting..." : "Reset Password"}</Button>
            </form>
          ) : sent ? (
            <div className="text-center text-gray-600">
              <p>Check your email for a reset link.</p>
              <p className="text-sm mt-2 text-gray-400">Didn&apos;t receive it? Check spam folder or try again.</p>
            </div>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
              <Button type="submit" disabled={loading} className="w-full">{loading ? "Sending..." : "Send Reset Link"}</Button>
            </form>
          )}
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link href="/auth/login" className="text-primary font-medium hover:underline">Back to login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
