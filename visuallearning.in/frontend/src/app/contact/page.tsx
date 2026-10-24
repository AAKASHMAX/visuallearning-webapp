"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArrowUpRight, Building2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import api from "@/lib/api";

interface ContactInfo { companyName: string; address: string; phone: string; email: string; }
const defaultContact: ContactInfo = {
  companyName: "VISUALLEARNING AI PRIVATE LIMITED",
  address: "4th floor, Balaji Business center, Pune-Mumbai Highway, National Highway 4, next to hotel Spice Court, Baner, Pune, Maharashtra 411045",
  phone: "9718154204",
  email: "visuallearning247@gmail.com",
};
export default function ContactPage() {
  const [contact, setContact] = useState<ContactInfo>(defaultContact);
  useEffect(() => {
    api.get("/admin/public-settings").then(({ data }) => { if (data.data?.contactInfo) setContact({ ...defaultContact, ...data.data.contactInfo }); }).catch(() => {});
  }, []);
  const phone = contact.phone.startsWith("+") ? contact.phone : `+91 ${contact.phone}`;
  return <div className="vl-account-public-page"><Navbar /><main className="vl-contact-page">
    <header className="vl-account-page-heading"><span>A CONVERSATION STARTS HERE</span><h1>Good questions.<br /><em>Real people.</em></h1><p>Have a question, an idea, or a little feedback?<br />We’re here to help you keep moving forward.</p></header>
    <div className="vl-contact-grid">
      <section className="vl-contact-intro"><span className="vl-contact-orbit" aria-hidden="true">✳</span><h2>Let’s figure it<br />out together.</h2><p>From finding the right course to getting the most out of a subscription, we’re just a message away.</p><a href={`mailto:${contact.email}`}>Say hello <ArrowUpRight size={19} /></a><span className="vl-contact-response">We typically reply within 24 hours.</span></section>
      <div className="vl-contact-details">
        <a className="vl-contact-item" href={`mailto:${contact.email}`}><span className="vl-contact-icon"><Mail size={21} /></span><div><span>WRITE TO US</span><h2>{contact.email}</h2><p>Questions, ideas, and everything in between.</p></div><ArrowUpRight size={19} /></a>
        <a className="vl-contact-item" href={`tel:${phone.replace(/[^\d+]/g, "")}`}><span className="vl-contact-icon"><Phone size={21} /></span><div><span>LET’S TALK</span><h2>{phone}</h2><p>A helping hand for your learning journey.</p></div><ArrowUpRight size={19} /></a>
        <div className="vl-contact-item"><span className="vl-contact-icon"><MapPin size={21} /></span><div><span>FIND US HERE</span><h2>Our home base</h2><p>{contact.address}</p></div></div>
        <div className="vl-contact-company"><Building2 size={16} /><span>{contact.companyName}</span></div>
      </div>
    </div>
    <div className="vl-contact-feedback"><MessageCircle size={21} /><span>Have something that could make learning even better?</span><Link href="/feedback">Share your feedback <ArrowUpRight size={16} /></Link></div>
  </main><Footer /></div>;
}
