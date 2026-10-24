"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { hasActiveSubscription } from "@/lib/subscription-access";
import { authLink, safeInternalRedirect } from "@/lib/auth-redirect";
import toast from "react-hot-toast";

export default function LoginPage() {
  return <Suspense fallback={<PageLoader />}><LoginContent /></Suspense>;
}
function LoginContent() {
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
      login(data.data.user, data.data.token);
      toast.success("Welcome back!");
      if (next) {
        router.push(next);
      } else if (data.data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        let subscribed = false;
        try {
          const { data: subRes } = await api.get("/subscription/my-subscription");
          subscribed = hasActiveSubscription(subRes);
        } catch { subscribed = false; }
        router.push(subscribed ? "/dashboard" : "/courses");
      }
    } catch (error: any) {
      const apiMessage = error.response?.data?.message;
      const validation = Array.isArray(error.response?.data?.errors) ? error.response.data.errors.filter((item: unknown) => typeof item === "string").join(" ") : "";
      const networkError = error.code === "ERR_NETWORK" || error.message === "Network Error";
      toast.error(apiMessage || validation || (networkError ? "We couldn’t connect just now. Check your connection and try again." : "We couldn’t sign you in. Please check your details and try again."));
    } finally { setLoading(false); }
  };

  return <AuthShell title="Welcome back." eyebrow="Good to see you again" description="Your next discovery is waiting. Let’s pick up where you left off.">
    <form onSubmit={handleSubmit} className="vl-auth-form">
      <Input label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
      <PasswordInput autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
      <div className="vl-auth-form-options"><span><ShieldCheck size={14} />Your learning, safely saved</span><Link href={authLink("/auth/forgot-password", next)}>Forgot password?</Link></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Signing you in…" : <>Let’s keep learning <ArrowRight size={16} /></>}</Button>
    </form>
    <p className="vl-auth-switch">New to VisualLearning? <Link href={authLink("/auth/signup", next)}>Create an account <ArrowUpRightIcon /></Link></p>
  </AuthShell>;
}
function ArrowUpRightIcon() { return <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 9 9 3M3 3h6v6" stroke="currentColor" strokeWidth="1.2" /></svg>; }
