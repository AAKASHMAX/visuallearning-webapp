"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Atom, BookOpen, CalendarDays, Check, ChevronRight, FlaskConical, GraduationCap, Layers, MonitorPlay, NotebookPen, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import type { ClassItem, Subscription } from "@/types";

interface SubjectInfo { subjectId: string; subjectName: string; classId: string; className: string }
interface PricingClass { id: string; name: string; subjects: { id: string; name: string }[] }
function subjectTrackKey(name: string) { const n = name.toLowerCase(); return n.includes("chemistry") ? "chemistry" : n.includes("biology") ? "biology" : "physics"; }
function planMeta(plan: string) {
  const metadata: Record<string, { title: string; href: string }> = {
    STUDENTS_PLAN: { title: "Students plan", href: "/courses/students" },
    TEACHERS_PLAN: { title: "Teachers plan", href: "/courses/teachers" },
    PROFESSIONAL_PLAN: { title: "Professional subjects", href: "/courses/professional" },
    FLEXI_PLAN: { title: "Your custom subjects", href: "/courses/my-custom-plan" },
    SINGLE_CLASS: { title: "Single class", href: "/courses" },
    DUAL_CLASS: { title: "Dual class", href: "/courses" },
    FULL_ACCESS: { title: "Full access", href: "/courses" },
  };
  return metadata[plan] || { title: plan.replace(/_/g, " ").toLowerCase().replace(/^./, c => c.toUpperCase()), href: "/courses" };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [allClasses, setAllClasses] = useState<ClassItem[]>([]);
  const [subjectAccessBySubId, setSubjectAccessBySubId] = useState<Record<string, SubjectInfo[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const [subRes, classRes] = await Promise.all([api.get("/subscription/my-subscription"), api.get("/courses/classes")]);
      const subs: Subscription[] = Array.isArray(subRes.data.data) ? subRes.data.data : [subRes.data.data].filter(Boolean);
      setSubscriptions(subs);
      setAllClasses(Array.isArray(classRes.data.data) ? classRes.data.data : []);
      const subjectSubs = subs.filter(s => s.status === "ACTIVE" && s.subjectsAccess?.length > 0);
      if (subjectSubs.length) {
        const { data: pricingRes } = await api.get("/courses/pricing/subjects");
        const pricingClasses = (pricingRes.data || []) as PricingClass[];
        const subjects = pricingClasses.flatMap(cls => cls.subjects.map(s => ({ subjectId: s.id, subjectName: s.name, classId: cls.id, className: cls.name })));
        const nextMap: Record<string, SubjectInfo[]> = {};
        for (const sub of subjectSubs) nextMap[sub.id] = sub.subjectsAccess.flatMap(access => {
          const exact = subjects.find(s => s.subjectId === access);
          return exact ? [exact] : subjects.filter(s => s.subjectName.toLowerCase().includes(access.toLowerCase()));
        });
        setSubjectAccessBySubId(nextMap);
      }
    } catch { setError(true); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const activeSubs = subscriptions.filter(s => s.status === "ACTIVE" && new Date(s.expiryDate) > new Date());
  const firstName = user?.name?.split(" ")[0] || "there";

  return <div className="learning-page learn-dashboard-page">
    <header className="learn-page-header"><div><span className="learn-eyebrow"><span /> YOUR LEARNING SPACE</span><h1>Welcome back, {firstName}.<br /><em>Stay a little curious.</em></h1><p>Your classes, your pace, your next discovery. Pick up a subject and see where it takes you today.</p></div><Link className="learn-button" href="/courses">Explore the library <ArrowUpRight size={17} /></Link></header>
    <div className="learn-dashboard-summary"><div><span className="learn-resource-icon"><Layers size={21} /></span><div><strong>{loading ? "…" : activeSubs.length}</strong><span>Active {activeSubs.length === 1 ? "plan" : "plans"}</span></div></div><div><span className="learn-resource-icon"><GraduationCap size={21} /></span><div><strong>Class 9–12</strong><span>A world of science</span></div></div><Link href="/courses/virtual-lab"><span className="learn-resource-icon"><FlaskConical size={21} /></span><div><strong>The virtual lab</strong><span>Learn by experimenting</span></div><ArrowUpRight size={19} /></Link></div>
    <section className="learn-section" aria-labelledby="active-learning-plans"><div className="learn-section-heading"><div><span className="learn-step">MADE FOR YOUR LEARNING JOURNEY</span><h2 id="active-learning-plans">Your classroom, right here.</h2></div><Link className="learn-text-link" href="/pricing">Manage your access <ArrowUpRight size={16} /></Link></div>
      {loading ? <div className="learn-subscription-grid" role="status" aria-label="Loading your plans">{[1, 2].map(i => <div className="learn-subscription-card learn-skeleton" key={i} />)}</div> : error ? <div className="learn-empty" role="alert"><BookOpen /><h3>We couldn’t load your learning space.</h3><p>Your plans are still there. Please try again in a moment.</p><button className="learn-button" onClick={() => void load()}>Reload my plans <ArrowRight size={16} /></button></div> : activeSubs.length ? <div className="learn-subscription-grid">{activeSubs.map(sub => <SubscriptionCard key={sub.id} sub={sub} subjects={subjectAccessBySubId[sub.id] || []} allClasses={allClasses} />)}</div> : <div className="learn-dashboard-empty"><span className="learn-empty-illustration"><BookOpen size={46} strokeWidth={1.25} /></span><div><span className="learn-step">EVERY JOURNEY STARTS SOMEWHERE</span><h3>Your first discovery is waiting.</h3><p>You don’t have an active plan yet. Explore the free study resources, or find a plan to unlock animated lessons and more.</p><div className="learn-inline-actions"><Link href="/courses" className="learn-button">Start exploring <ArrowUpRight size={16} /></Link><Link href="/pricing" className="learn-text-link">Find your plan <ArrowRight size={16} /></Link></div></div></div>}
    </section>
    <section className="learn-section"><div className="learn-section-heading"><div><span className="learn-step">A LITTLE INSPIRATION FOR TODAY</span><h2>How will you learn?</h2></div></div><div className="learn-dashboard-shortcuts">{[{ href: "/courses", icon: MonitorPlay, title: "See the big picture", text: "Turn abstract concepts into animated explanations.", label: "Explore lessons" }, { href: "/courses", icon: NotebookPen, title: "Make it stay with you", text: "Read, revise, and practise at your own pace.", label: "Find study resources" }, { href: "/courses/virtual-lab", icon: FlaskConical, title: "Let curiosity take over", text: "Step into interactive science experiments.", label: "Enter the lab" }].map(item => <Link key={item.title} href={item.href} className="learn-resource-card"><span className="learn-resource-icon"><item.icon size={24} strokeWidth={1.5} /></span><h3>{item.title}</h3><p>{item.text}</p><span className="learn-resource-action">{item.label} <ArrowRight size={16} /></span></Link>)}</div></section>
    <div className="learn-discovery-banner"><span className="learn-banner-icon"><Sparkles size={26} /></span><div><h2>Understanding grows with every question.</h2><p>You don’t have to know it all. You just have to begin.</p></div><Link className="learn-button learn-button-light" href="/courses">Keep exploring <ArrowUpRight size={17} /></Link></div>
  </div>;
}

function SubscriptionCard({ sub, subjects, allClasses }: { sub: Subscription; subjects: SubjectInfo[]; allClasses: ClassItem[] }) {
  const meta = planMeta(sub.plan);
  const daysLeft = Math.max(0, Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000));
  const isProfessional = sub.plan === "PROFESSIONAL_PLAN";
  const subjectPlan = sub.plan === "FLEXI_PLAN" || isProfessional || (sub.subjectsAccess?.length || 0) > 0;
  const visibleSubjects = isProfessional ? [...new Map(subjects.map(s => [subjectTrackKey(s.subjectName), s])).values()] : subjects;
  const classes = allClasses.filter(cls => !sub.classesAccess?.length || sub.classesAccess.includes(cls.id));
  const href = !subjectPlan && sub.course ? `/courses/view-course/${sub.course.slug}` : meta.href;
  return <article className="learn-subscription-card"><div className="learn-subscription-heading"><span className="learn-resource-icon">{subjectPlan ? <Atom size={23} /> : <GraduationCap size={23} />}</span><span className="learn-status-dot">Active</span></div><span className="learn-step">{sub.plan.replace(/_/g, " ")}</span><h3>{!subjectPlan && sub.course ? sub.course.name : meta.title}</h3><div className="learn-subscription-expiry"><CalendarDays size={14} /><span>Until {new Date(sub.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span><strong>{daysLeft} days left</strong></div>
    <div className="learn-subscription-resources">{subjectPlan ? visibleSubjects.length ? visibleSubjects.map(s => <Link key={s.subjectId} href={isProfessional ? `/courses/professional/${subjectTrackKey(s.subjectName)}` : `/courses/${s.classId}/${s.subjectId}`}><span><strong>{s.subjectName}</strong><small>{isProfessional ? "Professional subject" : s.className}</small></span><ChevronRight size={17} /></Link>) : <p>Your selected subjects are included in this plan.</p> : sub.course ? <p><Check size={16} /> Your assigned course is ready to explore.</p> : classes.map(cls => <Link key={cls.id} href={`/courses/${cls.id}`}><span><strong>{cls.name}</strong><small>Explore subjects & chapters</small></span><ChevronRight size={17} /></Link>)}</div>
    <Link href={href} className="learn-button learn-button-outline">Enter your classroom <ArrowUpRight size={17} /></Link>
  </article>;
}
