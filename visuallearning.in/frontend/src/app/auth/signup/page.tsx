"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageLoader } from "@/components/ui/loading";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useAuth } from "@/lib/auth";
import { authLink, safeInternalRedirect } from "@/lib/auth-redirect";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { SignupWelcomeModal } from "@/components/subscription/signup-welcome-modal";

export default function SignupPage() {
  return <Suspense fallback={<PageLoader />}><SignupContent /></Suspense>;
}
function SignupContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeInternalRedirect(searchParams.get("next"));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^91(?=\d{10}$)/, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) { toast.error("Enter a valid 10-digit mobile number"); return; }
    if (password !== confirm) { toast.error("Passwords don’t match"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", { name, email, phone: cleanPhone, password });
      login(data.data.user, data.data.token);
      setWelcome(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "We couldn’t create your account just now. Please try again.");
    } finally { setLoading(false); }
  };
  const closeWelcome = () => { setWelcome(false); router.push(next || "/courses"); };

  return <AuthShell compact title="Let curiosity begin." eyebrow="Your first step, a brighter way" description="Create your free account and see learning in a whole new light.">
    {welcome && <SignupWelcomeModal onClose={closeWelcome} />}
    <form onSubmit={handleSubmit} className="vl-auth-form">
      <Input label="Full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" required />
      <Input label="Email address" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
      <Input label="Mobile number" type="tel" autoComplete="tel-national" inputMode="numeric" maxLength={10} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder="Your 10-digit mobile number" required />
      <div className="vl-auth-password-row"><PasswordInput autoComplete="new-password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required /><PasswordInput label="Confirm password" autoComplete="new-password" minLength={6} value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="One more time" required /></div>
      <p className="vl-auth-terms">By creating an account, you agree to our <Link href="/terms-of-service">Terms of Service</Link> and <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating your account…" : <>Create free account <ArrowRight size={16} /></>}</Button>
    </form>
    <p className="vl-auth-switch">Already part of the journey? <Link href={authLink("/auth/login", next)}>Log in</Link></p>
  </AuthShell>;
}
