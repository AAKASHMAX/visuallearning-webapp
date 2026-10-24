import Link from "next/link";
import { ArrowUpRight, Heart, Smartphone } from "lucide-react";
import { Brand } from "./brand";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

const groups = [
  { title: "Keep exploring", links: [{ label: "Our courses", href: "/courses" }, { label: "Try a free demo", href: "/demo" }, { label: "Virtual lab", href: "/courses/virtual-lab" }, { label: "Plans & pricing", href: "/pricing" }] },
  { title: "Here for you", links: [{ label: "About VisualLearning", href: "/#about" }, { label: "Get in touch", href: "/contact" }, { label: "Share feedback", href: "/feedback" }, { label: "Refer & earn", href: "/affiliate" }] },
];

export function Footer() {
  return <footer className="vl-footer">
    <div className="vl-footer-inner">
      <div className="vl-footer-top">
        <div className="vl-footer-brand"><Brand inverse /><p>For every curious mind.<br />A whole new way to see science.</p><span className="vl-footer-caption">Made for learners in Classes 9–12.</span>{APP_PUBLISHED && <a className="vl-footer-app" href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"><Smartphone size={18} /><span>Learning, wherever you are.<strong>Get the Android app</strong></span><ArrowUpRight size={17} /></a>}</div>
        {groups.map((group) => <div className="vl-footer-group" key={group.title}><h2>{group.title}</h2>{group.links.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div>)}
        <div className="vl-footer-note"><span className="vl-footer-orbit" aria-hidden="true">✳</span><h2>Big ideas.<br />Brighter possibilities.</h2><Link href="/auth/signup">Let’s start learning <ArrowUpRight size={18} /></Link></div>
      </div>
      <div className="vl-footer-bottom"><p>© {new Date().getFullYear()} VisualLearning.</p><nav aria-label="Legal"><Link href="/privacy-policy">Privacy</Link><Link href="/terms-of-service">Terms</Link><Link href="/refund-policy">Refund policy</Link><Link href="/affiliate-terms">Affiliate terms</Link></nav><span>Made with curiosity <Heart size={12} aria-hidden="true" /></span></div>
    </div>
  </footer>;
}
