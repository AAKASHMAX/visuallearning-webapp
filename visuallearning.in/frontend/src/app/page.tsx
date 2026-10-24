"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronDown, FlaskConical, Globe2, Layers3, Microscope, Play, Presentation, Smartphone, Sparkles, Target } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CellWorld } from "@/components/home/cell-world";
import { ScienceArt } from "@/components/home/science-art";
import { AboutSection } from "@/components/home/about-section";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";
import api from "@/lib/api";

const formats = [
  { number: "01", title: "See it.", name: "3D animated lessons", text: "Step inside the concepts your textbook can only describe.", icon: Play, href: "/demo/video" },
  { number: "02", title: "Understand it.", name: "Lectures & visual notes", text: "Connect the dots with clear explanations and illustrated notes.", icon: BookOpen, href: "/demo/visual-notes" },
  { number: "03", title: "Apply it.", name: "NCERT & solved questions", text: "Turn understanding into answers, one worked solution at a time.", icon: Layers3, href: "/demo/ncert-solution" },
  { number: "04", title: "Make it stick.", name: "Chapter-wise quizzes", text: "Test what you know. Find your gaps. Go into exams with clarity.", icon: Target, href: "/demo/quiz" },
];
const subjects = [
  { name: "Physics", kind: "atom" as const, label: "THE RULES OF EVERYTHING", text: "From the tiniest particles to the forces that move our world.", tags: ["Motion", "Electricity", "Optics"], color: "sage" },
  { name: "Chemistry", kind: "molecule" as const, label: "SMALL THINGS. BIG REACTIONS.", text: "Get closer to the elements, bonds, and reactions all around you.", tags: ["Atoms", "Reactions", "Organic chemistry"], color: "peach" },
  { name: "Biology", kind: "dna" as const, label: "A WORLD WITHIN YOU", text: "Explore the remarkable systems that make life possible.", tags: ["Cells", "Genetics", "Human physiology"], color: "lilac" },
];
const faqs = [
  { q: "Can I try Visual Learning for free?", a: "Yes. Explore our demo lessons, notes, NCERT solutions, and quizzes without a subscription. Create a free account to explore the course library and the first-chapter previews." },
  { q: "Which classes and subjects can I study?", a: "Visual Learning is built for Classes 9–12, with Physics, Chemistry, and Biology content. Choose your class in the course library to see the subjects and chapters currently available." },
  { q: "Are lessons available in English and Hinglish?", a: "Yes. Choose English or Hinglish from the language menu. Available languages can vary by lesson; the player shows the options for each chapter." },
  { q: "How do subscriptions work?", a: "Choose Single Class, Dual Class, or Full Access, then select monthly, quarterly, or yearly billing. Visit the plans page for current pricing and included access." },
  { q: "Can teachers use the learning resources?", a: "Teachers can explore chapter-wise visual materials and presentations alongside the student learning content. Sign in to browse the teacher resources and check access for your plan." },
];

export default function HomePage() {
  const [activeClass, setActiveClass] = useState(9);
  const [classes, setClasses] = useState<{id: string; name: string}[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useEffect(() => { let active = true; api.get("/courses/classes").then(({data}) => { if (active && Array.isArray(data.data)) setClasses(data.data); }).catch(() => {}); return () => { active = false; }; }, []);
  const selectedClass = classes.find(c => new RegExp(`\\b${activeClass}\\b`).test(c.name));
  const courseLink = selectedClass ? `/courses/${selectedClass.id}` : "/courses";
  return <div className="vl-home">
    <Navbar />
    <main id="main-content">
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="hero-grain" aria-hidden="true" />
        <div className="home-wrap hero-content">
          <p className="home-eyebrow hero-eyebrow"><span className="status-dot" /> A LITTLE CURIOSITY. A WHOLE NEW WORLD.</p>
          <h1 id="hero-heading">Don’t just<br/>learn science.<br/><em>Step inside it.</em></h1>
          <p className="hero-description">A cell becomes a world. A formula becomes a story. Discover science through 3D lessons that make it all click.</p>
          <div className="hero-actions"><Link href="/courses" className="home-button home-button-accent">Explore courses <ArrowUpRight size={18}/></Link><Link href="/demo/video" className="hero-watch"><span><Play size={14} fill="currentColor"/></span> Watch a lesson</Link></div>
          <div className="hero-note"><Check size={14}/> Free chapter previews <span/> Made for Classes 9–12</div>
        </div>
        <div className="hero-world"><CellWorld /></div>
        <div className="home-wrap hero-bottom"><a href="#discover"><ArrowDown size={15}/> THERE’S MORE TO DISCOVER</a><span>BIG IDEAS. SMALL DETAILS. REAL UNDERSTANDING.</span></div>
      </section>
      <div className="home-context-strip"><div className="home-wrap"><span><Globe2 size={17}/> CBSE &amp; State Boards</span><span><BookOpen size={17}/> Classes 9–12</span><span><Microscope size={17}/> Physics · Chemistry · Biology</span><span><Sparkles size={17}/> English &amp; Hinglish</span></div></div>
      <section id="discover" className="home-section home-wrap">
        <div className="home-section-heading"><div><p className="home-eyebrow">THE WAY LEARNING SHOULD FEEL</p><h2>Less memorising.<br/><em>More lightbulb moments.</em></h2></div><p>Everything works together. Watch a concept come alive, build your understanding, then put it into practice.</p></div>
        <div className="learning-loop">{formats.map(f => <Link key={f.number} href={f.href} className="loop-item"><div className="loop-top"><span>{f.number}</span><f.icon size={22} strokeWidth={1.5}/></div><h3>{f.title}</h3><h4>{f.name}</h4><p>{f.text}</p><span className="loop-link">Take a look <ArrowUpRight size={16}/></span></Link>)}</div>
      </section>
      <section id="curriculum" className="home-curriculum"><div className="home-wrap home-section">
        <div className="home-section-heading"><div><p className="home-eyebrow">FOLLOW YOUR CURIOSITY</p><h2>Your class.<br/><em>A universe to explore.</em></h2></div><div className="home-class-picker" aria-label="Choose your class">{[9,10,11,12].map(n => <button key={n} type="button" onClick={() => setActiveClass(n)} aria-pressed={n===activeClass} className={n===activeClass?"is-active":""}>Class {n}</button>)}</div></div>
        <div className="home-subject-grid">{subjects.map(s=><Link key={s.name} href={courseLink} className={`subject-discovery subject-${s.color}`}><div className="subject-art"><span>CLASS {activeClass}</span><ScienceArt kind={s.kind}/><div className="subject-arrow"><ArrowUpRight size={21}/></div></div><div className="subject-info"><p className="home-eyebrow">{s.label}</p><h3>{s.name}</h3><p>{s.text}</p><div className="subject-tags">{s.tags.map(t=><span key={t}>{t}</span>)}</div></div></Link>)}</div>
        <div className="curriculum-foot"><span>A fresh perspective on your school syllabus.</span><Link href={courseLink}>Explore Class {activeClass} <ArrowRight size={17}/></Link></div>
      </div></section>
      <section className="home-wrap home-section">
        <div className="lab-feature"><div className="lab-feature-copy"><p className="home-eyebrow">LEARNING, HANDS ON</p><h2>A lab without<br/><em>the lab coat.</em></h2><p>Look closer. Change your perspective. Explore interactive experiments and 3D models that turn “what if?” into “now I get it.”</p><Link href="/courses/virtual-lab" className="home-button home-button-dark">Enter the virtual lab <ArrowUpRight size={18}/></Link><span className="lab-small">Sign in to explore · Access varies by plan</span></div><div className="lab-art"><div className="lab-orbit orbit-one"/><div className="lab-orbit orbit-two"/><div className="lab-center"><FlaskConical size={65} strokeWidth={1}/><div className="lab-liquid"/></div><div className="lab-float lab-float-top"><span className="status-dot"/> TRY. OBSERVE. UNDERSTAND.</div><div className="lab-float lab-float-bottom"><Microscope size={19}/><div><strong>Let curiosity lead.</strong><span>There’s a discovery in every experiment.</span></div></div><span className="lab-dot dot-one"/><span className="lab-dot dot-two"/><span className="lab-dot dot-three"/></div></div>
        <div className="teacher-strip"><span className="teacher-icon"><Presentation size={25}/></span><div><h3>For the minds shaping young minds.</h3><p>Bring your classroom to life with visual notes and ready-to-teach presentations.</p></div><Link href="/courses/teachers">Explore teacher resources <ArrowUpRight size={17}/></Link></div>
      </section>
      <AboutSection />
      <section className="home-wrap home-section home-faq"><div><p className="home-eyebrow">GOOD QUESTIONS</p><h2>A little clarity<br/><em>before you begin.</em></h2><p>Still curious about something?</p><Link href="/contact">Talk to our team <ArrowUpRight size={17}/></Link></div><div className="faq-items">{faqs.map((f,i)=><div key={f.q} className={`faq-item ${openFaq===i?"is-open":""}`}><h3><button type="button" onClick={()=>setOpenFaq(openFaq===i?null:i)} aria-expanded={openFaq===i} aria-controls={`faq-answer-${i}`}>{f.q}<ChevronDown size={19}/></button></h3><div id={`faq-answer-${i}`} hidden={openFaq!==i}><p>{f.a}</p></div></div>)}</div></section>
      {APP_PUBLISHED && <section className="home-wrap home-app"><div className="app-icon"><Smartphone size={30} strokeWidth={1.5}/></div><div><p className="home-eyebrow">YOUR CURIOSITY. TO GO.</p><h2>Big ideas, now pocket-sized.</h2><p>Keep learning wherever your day takes you.</p></div><a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="home-button home-button-dark"><Smartphone size={18}/> Get the Android app <ArrowUpRight size={17}/></a></section>}
      <section className="home-final"><div className="home-wrap"><p className="home-eyebrow">YOUR NEXT LIGHTBULB MOMENT STARTS HERE</p><h2>The world is fascinating.<br/><em>Let’s make sense of it.</em></h2><Link href="/auth/signup" className="home-button home-button-accent">Start exploring for free <ArrowUpRight size={18}/></Link><p>No subscription needed to get started.</p></div><div className="final-orbit" aria-hidden="true"/></section>
    </main><Footer />
  </div>;
}
