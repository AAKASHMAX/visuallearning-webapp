"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/subscription", label: "Pricing" },
    { href: "/feedback", label: "Feedback" },
    { href: "/contact", label: "Contact Us" },
  ];

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
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative py-1 text-sm font-medium transition-all duration-200 hover:text-accent",
                    isActive ? "text-accent" : "text-white/90"
                  )}
                  prefetch
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                  )}
                </Link>
              );
            })}

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-4 ml-2">
                <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
                  <Button variant="accent" size="sm">Dashboard</Button>
                </Link>
                <Link 
                  href="/profile" 
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm",
                    pathname === "/profile" ? "bg-accent text-primary-dark" : "bg-white/10 hover:bg-white/20"
                  )}
                >
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
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block py-2.5 px-4 rounded-xl text-sm font-black transition-all",
                    isActive ? "bg-accent text-primary-dark" : "hover:text-accent"
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}

            {mounted && isAuthenticated ? (
              <>
                <Link 
                  href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} 
                  className={cn(
                    "block py-2.5 px-4 rounded-xl text-sm font-black",
                    (pathname === "/dashboard" || pathname === "/admin/dashboard") ? "bg-accent text-primary-dark" : "hover:text-accent"
                  )} 
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/profile" 
                  className={cn(
                    "block py-2.5 px-4 rounded-xl text-sm font-black",
                    pathname === "/profile" ? "bg-accent text-primary-dark" : "hover:text-accent"
                  )} 
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
                <button onClick={() => { logout(); window.location.href = "/"; }} className="block py-2 text-red-300 w-full text-left px-4">Logout</button>
              </>
            ) : mounted ? (
              <>
                <Link href="/auth/login" className="block py-2 hover:text-accent px-4" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link href="/auth/signup" className="block py-2 hover:text-accent px-4" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
    </>
  );
}
