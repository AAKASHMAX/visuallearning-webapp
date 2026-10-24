"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/lib/auth";
import { safeInternalRedirect } from "@/lib/auth-redirect";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  return <Suspense fallback={<PageLoader />}><AdminLoginContent /></Suspense>;
}
function AdminLoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeInternalRedirect(searchParams.get("next"));
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.data.user.role !== "ADMIN") { toast.error("This workspace is for administrator accounts."); return; }
      login(data.data.user, data.data.token);
      router.push(next || "/admin/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "We couldn’t sign you in. Check your details and try again.");
    } finally { setLoading(false); }
  };
  return <AuthShell admin title="Your workspace awaits." eyebrow="VisualLearning / Administration" description="Sign in to manage your courses, content, and learning community.">
    <form onSubmit={handleSubmit} className="vl-auth-form">
      <Input label="Work email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@visuallearning.in" required />
      <PasswordInput autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Opening your workspace…" : <>Sign in to workspace <ArrowRight size={16} /></>}</Button>
    </form>
    <p className="vl-auth-security"><ShieldCheck size={16} />Secure access for your team.</p>
  </AuthShell>;
}
