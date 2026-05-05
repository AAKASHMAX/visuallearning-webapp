"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Atom, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      toast.success("Welcome back!");
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirect || "/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary bg-grid">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-secondary/5 to-transparent" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-56 h-56 bg-secondary/8 rounded-full blur-[80px]" />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-8 animate-pulse-glow">
            <Atom className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-4">
            Welcome to Physics<span className="text-accent">Lab</span>
          </h2>
          <p className="text-text-muted leading-relaxed max-w-md">
            See physics come alive through stunning 3D animations and interactive
            experiments. Your journey to mastering physics starts here.
          </p>

          {/* Floating formulas */}
          <div className="mt-12 flex justify-center gap-6">
            <div className="glass rounded-xl px-4 py-2 animate-float">
              <span className="text-accent font-mono text-sm">E = mc&sup2;</span>
            </div>
            <div className="glass rounded-xl px-4 py-2 animate-float delay-200">
              <span className="text-secondary-light font-mono text-sm">F = ma</span>
            </div>
            <div className="glass rounded-xl px-4 py-2 animate-float delay-400">
              <span className="text-energy font-mono text-sm">V = IR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
              <Atom className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-bold text-text-bright">
              Physics<span className="text-accent">Lab</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-text-bright mb-2">Log In</h1>
          <p className="text-text-muted mb-8">
            Continue your physics learning journey
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

            <div>
              <label className="block text-sm text-text-muted mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-accent hover:text-accent-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-accent hover:text-accent-light font-medium transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
