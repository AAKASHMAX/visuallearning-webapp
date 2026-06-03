"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin } from "lucide-react";

const quickLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Contact Us", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "https://www.visuallearning.in/privacy-policy" },
  { label: "Refund Policy", href: "https://www.visuallearning.in/refund-policy" },
  { label: "Terms of Service", href: "https://www.visuallearning.in/terms-of-service" },
];

export function Footer() {
  return (
    <footer className="bg-primary-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/images/logo2.png" alt="VL" width={42} height={42} className="rounded-md" />
              <div>
                <span className="text-lg font-bold text-text-bright">
                  Physics<span className="text-accent">Lab</span>
                </span>
                <p className="text-[10px] text-text-bright tracking-wider uppercase -mt-0.5">
                  Visual Learning
                </p>
              </div>
            </Link>
            <p className="text-text-muted text-sm leading-relaxed max-w-md mb-6">
              Master physics through stunning 3D animations, interactive simulations,
              and expert-guided lectures. From mechanics to modern physics, we make
              every concept click.
            </p>
            <div className="flex flex-col gap-2 text-sm text-text-muted">
              <a href="mailto:visuallearning247@gmail.com" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Mail className="w-4 h-4" />
                visuallearning247@gmail.com
              </a>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                India
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-bright font-semibold mb-4">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted text-sm hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-text-bright font-semibold mb-4">Legal</h4>
            <ul className="flex flex-col gap-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-text-muted text-sm hover:text-accent transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} Visual Learning. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Made with passion for physics education
          </p>
        </div>
      </div>
    </footer>
  );
}
