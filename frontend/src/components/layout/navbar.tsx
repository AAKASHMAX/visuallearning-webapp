"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Globe } from "lucide-react";

export function Navbar() {
  const { user, isAuthenticated, logout, hydrate } = useAuth();
  const { language, setLanguage, enabledLanguages, hydrate: hydrateLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrate();
    hydrateLanguage();
    setMounted(true);
  }, [hydrate, hydrateLanguage]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    if (!langOpen) return;
    const handler = () => setLangOpen(false);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [langOpen]);

  const currentLang = enabledLanguages.find((l) => l.value === language);

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Image src="/images/logo.png" alt="VL" width={36} height={36} className="rounded-md" />
            <span className="text-white">VisualLearning</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <Link href="/courses" className="hover:text-accent transition-colors">Courses</Link>
            <Link href="/subscription" className="hover:text-accent transition-colors">Pricing</Link>

            {/* Language Switcher */}
            {mounted && (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setLangOpen(!langOpen); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
                >
                  <Globe className="w-4 h-4" />
                  <span>{currentLang?.label || "English"}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl py-1 z-50">
                    {enabledLanguages.map((lang) => (
                      <button
                        key={lang.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLanguage(lang.value);
                          setLangOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          language === lang.value
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="accent" size="sm">Dashboard</Button>
                </Link>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{user?.name}</span>
                </div>
                <button onClick={() => { logout(); window.location.href = "/"; }} className="hover:text-accent">
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

            {/* Mobile Language Switcher */}
            {mounted && (
              <div className="py-2">
                <p className="text-xs text-white/60 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Language</p>
                <div className="flex flex-wrap gap-2">
                  {enabledLanguages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => { setLanguage(lang.value); }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        language === lang.value
                          ? "bg-accent text-primary-dark"
                          : "bg-white/10 hover:bg-white/20"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mounted && isAuthenticated ? (
              <>
                <Link href="/dashboard" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Dashboard</Link>
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
  );
}
