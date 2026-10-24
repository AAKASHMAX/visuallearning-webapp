"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";

// The homepage FAQ, moved out of the previous homepage unchanged.
const faqs = [
  { q: "Can I try Visual Learning for free?", a: "Yes. Explore our demo lessons, notes, NCERT solutions, and quizzes without a subscription. Create a free account to explore the course library and the first-chapter previews." },
  { q: "Which classes and subjects can I study?", a: "Visual Learning is built for Classes 9–12, with Physics, Chemistry, and Biology content. Choose your class in the course library to see the subjects and chapters currently available." },
  { q: "Are lessons available in English and Hinglish?", a: "Yes. Choose English or Hinglish from the language menu. Available languages can vary by lesson; the player shows the options for each chapter." },
  { q: "How do subscriptions work?", a: "Choose Single Class, Dual Class, or Full Access, then select monthly, quarterly, or yearly billing. Visit the plans page for current pricing and included access." },
  { q: "Can teachers use the learning resources?", a: "Teachers can explore chapter-wise visual materials and presentations alongside the student learning content. Sign in to browse the teacher resources and check access for your plan." },
];

export function HomeFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  return (
    <section className="home-wrap home-section home-faq"><div><p className="home-eyebrow">GOOD QUESTIONS</p><h2>A little clarity<br/><em>before you begin.</em></h2><p>Still curious about something?</p><Link href="/contact">Talk to our team <ArrowUpRight size={17}/></Link></div><div className="faq-items">{faqs.map((f,i)=><div key={f.q} className={`faq-item ${openFaq===i?"is-open":""}`}><h3><button type="button" onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i} aria-controls={`faq-answer-${i}`}>{f.q}<ChevronDown size={19}/></button></h3><div id={`faq-answer-${i}`} hidden={openFaq!==i}><p>{f.a}</p></div></div>)}</div></section>
  );
}
