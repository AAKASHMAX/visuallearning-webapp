"use client";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import api from "@/lib/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Building2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

type ContactInfo = {
  companyName: string;
  address: string;
  phone: string;
  email: string;
};

const fallbackContact: ContactInfo = {
  companyName: "VISUALLEARNING AI PRIVATE LIMITED",
  address:
    "4th floor, Balaji Business center, Pune-Mumbai Highway, National Highway 4, next to hotel Spice Court, Baner, Pune, Maharashtra 411045",
  phone: "+91 9718154204",
  email: "support@visuallearning.in",
};

function normalizePhoneHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : undefined;
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactInfo>(fallbackContact);

  useEffect(() => {
    api.get("/admin/public-settings")
      .then(({ data }) => {
        const info = data?.data?.contactInfo || data?.data?.contact_info || {};
        setContact({
          companyName: info.companyName || info.company_name || fallbackContact.companyName,
          address: info.address || fallbackContact.address,
          phone: info.phone || fallbackContact.phone,
          email: info.email || fallbackContact.email,
        });
      })
      .catch(() => setContact(fallbackContact));
  }, []);

  const contactCards = [
    {
      title: "Email Support",
      value: contact.email,
      href: `mailto:${contact.email}`,
      icon: Mail,
      accent: "text-accent",
      bg: "bg-accent/10",
      border: "hover:border-accent/45",
    },
    {
      title: "Phone",
      value: contact.phone,
      href: normalizePhoneHref(contact.phone),
      icon: Phone,
      accent: "text-success",
      bg: "bg-success/10",
      border: "hover:border-success/45",
    },
    {
      title: "Company",
      value: contact.companyName,
      icon: Building2,
      accent: "text-secondary-light",
      bg: "bg-secondary/10",
      border: "hover:border-secondary/45",
    },
    {
      title: "Location",
      value: contact.address,
      icon: MapPin,
      accent: "text-energy",
      bg: "bg-energy/10",
      border: "hover:border-energy/45",
    },
  ];

  return (
    <main className="min-h-screen bg-primary text-text">
      <Navbar />

      <section className="relative overflow-hidden bg-grid px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/8 blur-[120px]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-surface/80 px-4 py-2 text-sm text-text-muted">
              <MessageCircle className="h-4 w-4 text-accent" />
              Contact Visual Learning
            </div>
            <h1 className="mb-5 text-4xl font-extrabold leading-tight text-text-bright sm:text-5xl">
              Contact Us
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-text-muted">
              Need help with PhysicsLab courses, payments, dashboard access, or learning support?
              Reach the Visual Learning team directly.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {contactCards.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className={`group h-full rounded-lg border border-border bg-card/90 p-5 transition-all duration-300 ${item.border}`}>
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${item.bg} ${item.accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="text-base font-bold text-text-bright">{item.title}</h2>
                  </div>
                  <p className="break-words text-sm leading-relaxed text-text-muted group-hover:text-text">
                    {item.value}
                  </p>
                </div>
              );

              return item.href ? (
                <a key={item.title} href={item.href} className="block">
                  {content}
                </a>
              ) : (
                <div key={item.title}>{content}</div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-accent/25 bg-surface/80 p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Clock className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-bold text-text-bright">Support Response</h2>
                  <p className="text-sm text-text-muted">Most questions are answered within 24 hours.</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-text-muted">
                For faster support, include your registered mobile number or email,
                course name, and payment ID if your question is about billing.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card/90 p-6">
              <h2 className="mb-3 font-bold text-text-bright">Looking for courses?</h2>
              <p className="mb-5 text-sm leading-relaxed text-text-muted">
                Browse the PhysicsLab course catalog and choose the plan that matches your learning level.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-primary transition-all duration-300 hover:bg-accent-light hover:shadow-[0_0_24px_rgba(0,212,255,0.25)]"
              >
                View Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
