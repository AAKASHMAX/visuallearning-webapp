"use client";

import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X, LogIn, User, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isAuthenticated, user, logout, hydrate } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "glass py-3 shadow-lg shadow-primary/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/images/logo2.png" alt="VL" width={42} height={42} className="rounded-md" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-text-bright tracking-tight">
                Physics<span className="text-accent">Lab</span>
              </span>
              <span className="text-[10px] text-text-bright -mt-1 tracking-wider uppercase">
                Visual Learning
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/#courses"
              className="text-text-muted hover:text-accent transition-colors duration-300 text-sm font-medium"
            >
              Courses
            </Link>
            <Link
              href="/#features"
              className="text-text-muted hover:text-accent transition-colors duration-300 text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-text-muted hover:text-accent transition-colors duration-300 text-sm font-medium"
            >
              Pricing
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-secondary flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-text-muted">{user?.name?.split(" ")[0]}</span>
                  <button
                    onClick={logout}
                    className="text-text-muted hover:text-danger transition-colors ml-2"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-text-muted hover:text-accent transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                href="/#courses"
                className="text-text-muted hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <Link
                href="/#features"
                className="text-text-muted hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/#pricing"
                className="text-text-muted hover:text-accent transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={logout} className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button variant="ghost" size="sm" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button size="sm" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
