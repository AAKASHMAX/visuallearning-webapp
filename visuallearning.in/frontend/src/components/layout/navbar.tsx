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

  const [confirmLang, setConfirmLang] = useState<string | null>(null);
  const currentLang = enabledLanguages.find((l) => l.value === language);

  const handleLanguageSwitch = (langValue: string) => {
    if (langValue === language) return;
    if (language === "HINDI" && langValue !== "HINDI") {
      setConfirmLang(langValue);
    } else {
      setLanguage(langValue);
    }
    setLangOpen(false);
  };

  return (
    <>
    {/* Language switch warning dialog */}
    {confirmLang && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]" onClick={() => setConfirmLang(null)}>
        <div className="bg-white rounded-xl p-6 mx-4 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Switch Language?</h3>
          </div>
          <p className="text-gray-600 text-sm mb-5">All videos might not be available in other language than Hindi. Do you want to switch language?</p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmLang(null)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={() => { setLanguage(confirmLang); setConfirmLang(null); }} className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">Switch</button>
          </div>
        </div>
      </div>
    )}
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
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
                          handleLanguageSwitch(lang.value);
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
                <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}>
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
            <Link href="/feedback" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Feedback</Link>
            <Link href="/contact" className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Contact Us</Link>

            {/* Mobile Language Switcher */}
            {mounted && (
              <div className="py-2">
                <p className="text-xs text-white/60 mb-1 flex items-center gap-1"><Globe className="w-3 h-3" /> Language</p>
                <div className="flex flex-wrap gap-2">
                  {enabledLanguages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => { handleLanguageSwitch(lang.value); }}
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
                <Link href={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"} className="block py-2 hover:text-accent" onClick={() => setMenuOpen(false)}>Dashboard</Link>
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
