"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Atom, Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = phone.replace(/\D/g, "");

    if (!name || !email || !phone || !password) {
      toast.error("Please fill all fields");
      return;
    }
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      toast.error("Enter a valid mobile number");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/signup", { name, email, phone: phone.trim(), password });
      toast.success("Account created! Please check your email to verify.");
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-primary bg-grid">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-accent/5 to-transparent" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-accent/8 rounded-full blur-[80px]" />

        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-8 animate-pulse-glow">
            <Atom className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-text-bright mb-4">
            Start Your Physics Journey
          </h2>
          <p className="text-text-muted leading-relaxed max-w-md">
            Join thousands of students who are mastering physics through visual
            learning. Create your free account and unlock the power of 3D
            animated physics.
          </p>

          {/* Feature highlights */}
          <div className="mt-10 space-y-4 text-left max-w-sm mx-auto">
            {[
              "500+ animated video lectures",
              "Interactive virtual lab experiments",
              "Chapter-wise MCQ quizzes",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-accent shrink-0" />
                <span className="text-sm text-text-muted">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Signup form */}
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

          <h1 className="text-2xl font-bold text-text-bright mb-2">
            Create Account
          </h1>
          <p className="text-text-muted mb-8">
            Start learning physics for free today
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-text-muted mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

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
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-muted mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-11 pr-11"
                  required
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

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-text-muted text-sm mt-8">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-accent hover:text-accent-light font-medium transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
