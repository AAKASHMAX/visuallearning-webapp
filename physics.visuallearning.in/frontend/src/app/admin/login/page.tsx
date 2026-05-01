"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Atom, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, hydrate } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMIN") {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.user.role !== "ADMIN") {
        toast.error("Admin access only");
        return;
      }
      login(res.data.user, res.data.token);
      toast.success("Welcome, Admin!");
      router.push("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary bg-grid px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent to-secondary flex items-center justify-center mb-4">
            <Atom className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-bright">Admin Login</h1>
          <p className="text-text-muted text-sm mt-1">PhysicsLab Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-text-muted mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input
                type="email"
                placeholder="admin@physicslab.in"
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
                placeholder="Enter password"
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

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Logging in..." : (
              <span className="flex items-center gap-2">
                Login <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
