"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, BookOpen, User, MessageSquare, Phone, CreditCard, LogOut, Gift, Languages, Check } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/language";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/subscription", label: "Subscription", icon: CreditCard },
  { href: "/affiliate", label: "Earn (Affiliate)", icon: Gift },
  { href: "/contact", label: "Contact Us", icon: Phone },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/profile", label: "Profile", icon: User },
];

// Only the two languages we have content in.
const LANG_OPTIONS = [
  { value: "HINDI", label: "Hinglish" },
  { value: "ENGLISH", label: "English" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { language, setLanguage, hydrate } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => { hydrate(); }, [hydrate]);

  const currentLabel = LANG_OPTIONS.find((l) => l.value === language)?.label || "Hinglish";

  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-4rem)] hidden lg:flex flex-col sticky top-16">
      <nav className="p-4 space-y-1 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === link.href || pathname.startsWith(`${link.href}/`)
                ? "bg-primary text-white"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <link.icon className="w-5 h-5" />
            {link.label}
          </Link>
        ))}

        {/* Language preference */}
        <button
          type="button"
          onClick={() => setLangOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          <Languages className="w-5 h-5" />
          <span className="flex-1 text-left">Language</span>
          <span className="text-xs font-semibold text-primary">{currentLabel}</span>
        </button>
      </nav>

      <div className="border-t border-gray-100 p-4">
        <button
          type="button"
          onClick={() => { logout(); window.location.href = "/"; }}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>

      {/* Language picker modal */}
      {langOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setLangOpen(false)}>
          <div className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-heading">Choose your language</h3>
            </div>
            <p className="mb-4 text-xs text-gray-500">Every chapter will open in the language you pick.</p>
            <div className="space-y-2">
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l.value}
                  onClick={() => { setLanguage(l.value); setLangOpen(false); }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition-all",
                    language === l.value ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-heading hover:border-primary/40"
                  )}
                >
                  {l.label}
                  {language === l.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
