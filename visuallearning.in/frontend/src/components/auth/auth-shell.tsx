import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Brand } from "@/components/layout/brand";
import type { ReactNode } from "react";

interface AuthShellProps {
  children: ReactNode;
  title: string;
  description: string;
  eyebrow?: string;
  compact?: boolean;
  admin?: boolean;
}

export function AuthShell({ children, title, description, eyebrow = "Your next chapter", compact = false, admin = false }: AuthShellProps) {
  return <main className={`vl-auth-shell${compact ? " vl-auth-compact" : ""}${admin ? " vl-auth-admin" : ""}`}>
    <aside className="vl-auth-story">
      <Brand inverse />
      <div className="vl-auth-story-copy"><span className="vl-auth-eyebrow">{admin ? "A space to make a difference" : "See it. Understand it. Remember it."}</span><h2>{admin ? <>Behind every<br />bright <em>idea.</em></> : <>A little curiosity.<br />A whole new <em>world.</em></>}</h2><p>{admin ? "Bring lessons to life and help curious minds find their next discovery." : "Make the difficult feel simple. Discover science through a different lens."}</p></div>
      <div className="vl-auth-science" aria-hidden="true">
        <svg viewBox="0 0 600 370" fill="none">
          <defs><radialGradient id="auth-cell"><stop stopColor="#7c3aed" stopOpacity=".17"/><stop offset="1" stopColor="#7c3aed" stopOpacity="0"/></radialGradient><linearGradient id="auth-orbit" x1="100" y1="40" x2="490" y2="350" gradientUnits="userSpaceOnUse"><stop stopColor="#00d4ff" stopOpacity=".75"/><stop offset="1" stopColor="#7c3aed" stopOpacity=".12"/></linearGradient></defs>
          <circle cx="304" cy="183" r="178" fill="url(#auth-cell)"/>
          <circle cx="304" cy="183" r="126" stroke="#5ce1ff" strokeOpacity=".2" strokeDasharray="2 7"/>
          <circle cx="304" cy="183" r="163" stroke="#5ce1ff" strokeOpacity=".11"/>
          <ellipse cx="304" cy="183" rx="190" ry="64" transform="rotate(-30 304 183)" stroke="url(#auth-orbit)" strokeWidth="1.3"/>
          <ellipse cx="304" cy="183" rx="190" ry="64" transform="rotate(33 304 183)" stroke="url(#auth-orbit)" strokeWidth="1.3"/>
          <ellipse cx="304" cy="183" rx="64" ry="168" transform="rotate(5 304 183)" stroke="url(#auth-orbit)" strokeWidth="1.3"/>
          <circle cx="304" cy="183" r="32" fill="#a78bfa" fillOpacity=".09" stroke="#a78bfa" strokeOpacity=".5"/>
          <circle cx="304" cy="183" r="17" fill="#00d4ff"/>
          <circle cx="304" cy="183" r="8" fill="#050815"/>
          <circle cx="140" cy="277" r="7" fill="#00d4ff"/><circle cx="455" cy="277" r="5" fill="#f59e0b"/><circle cx="317" cy="18" r="6" fill="#00d4ff"/>
          <path d="M389 73h85l15-15M162 130H98l-20 20M336 322h94l18 18" stroke="#5ce1ff" strokeOpacity=".35"/>
          <text x="454" y="49" fontSize="9" fill="#94a3b8" letterSpacing="2">DISCOVER</text><text x="25" y="166" fontSize="9" fill="#94a3b8" letterSpacing="2">UNDERSTAND</text><text x="453" y="352" fontSize="9" fill="#94a3b8" letterSpacing="2">CONNECT</text>
          <path d="M76 310v12m-6-6h12M490 144v10m-5-5h10M218 33v10m-5-5h10" stroke="#a78bfa" strokeOpacity=".45"/>
        </svg>
        <span className="vl-auth-science-label">There’s a whole universe in the details. <ArrowUpRight size={14} /></span>
      </div>
      <div className="vl-auth-story-bottom"><span><Check size={13} /> Made for curious minds</span><span>Classes 9–12</span></div>
    </aside>
    <section className="vl-auth-main">
      <div className="vl-auth-top"><Link href="/"><ArrowLeft size={14} />Back to home</Link><span>{admin ? "ADMIN WORKSPACE" : "LET CURIOSITY LEAD"}</span></div>
      <div className="vl-auth-form-wrap"><span className="vl-auth-form-eyebrow">{eyebrow}</span><h1>{title}</h1><p className="vl-auth-description">{description}</p>{children}</div>
      <div className="vl-auth-legal"><span>© {new Date().getFullYear()} VisualLearning</span><div><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link></div></div>
    </section>
  </main>;
}
