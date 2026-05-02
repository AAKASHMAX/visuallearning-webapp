"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  return (
    <>
    <nav className="bg-primary-dark bg-gradient-to-r from-primary-dark to-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-0 font-bold">
            <Image src="/images/logo2.png" alt="VL" width={42} height={42} className="rounded-md" priority />
            <span className="text-white leading-none text-base text-center">Visual<br />Learning</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-accent transition-colors" prefetch>Home</Link>
            <Link href="/courses" className="hover:text-accent transition-colors" prefetch>Courses</Link>
            <Link href="/subscription" className="hover:text-accent transition-colors" prefetch>Pricing</Link>
            <Link href="/feedback" className="hover:text-accent transition-colors" prefetch>Feedback</Link>
            <Link href="/contact" className="hover:text-accent transition-colors" prefetch>Contact Us</Link>

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-4 ml-2">
                <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
                  <Button variant="accent" size="sm">Dashboard</Button>
                </Link>
                <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <button onClick={() => { logout(); window.location.href = "/"; }} className="hover:text-accent ml-2">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : mounted ? (
              <div className="flex items-center gap-3">
                <Link href="/auth/login"><Button variant="ghost" size="sm" className="text-white">Login</Button></Link>
                <Link href="/auth/signup"><Button variant="accent" size="sm">Sign Up</Button></Link>
              </div>
            ) : null}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link href="/" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="/courses" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Courses</Link>
            <Link href="/subscription" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Pricing</Link>
            <Link href="/feedback" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Feedback</Link>
            <Link href="/contact" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Contact Us</Link>

            {mounted && isAuthenticated ? (
              <>
                <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <Link href="/profile" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Profile</Link>
                <button onClick={() => { logout(); window.location.href = "/"; }} className="block py-2 text-red-300">Logout</button>
              </>
            ) : mounted ? (
              <>
                <Link href="/auth/login" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
