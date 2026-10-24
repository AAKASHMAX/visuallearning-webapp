"use client";
import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpRight, Check, Heart, MessageCircle, Send, Sparkles } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setForm((previous) => ({ ...previous, [event.target.name]: event.target.value })); };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/feedback", form);
      toast.success(data.message || "Thank you for sharing your feedback!");
      setForm({ name: "", email: "", subject: "", message: "" });
      setSubmitted(true);
    } catch (error: any) {
      const result = error.response?.data;
      toast.error(result?.errors?.length ? result.errors.join(", ") : result?.message || "We couldn’t send your feedback. Please try again.");
    } finally { setLoading(false); }
  };
  return <div className="vl-account-public-page"><Navbar /><main className="vl-feedback-page">
    <header className="vl-account-page-heading"><span>BETTER, TOGETHER</span><h1>Your ideas.<br /><em>Our next chapter.</em></h1><p>Tell us what’s working, what could be better,<br />or what you’d love to discover next.</p></header>
    <div className="vl-feedback-grid"><aside className="vl-feedback-aside"><span className="vl-feedback-big-icon"><MessageCircle size={32} /></span><h2>Every perspective<br />makes a difference.</h2><p>This space gets better with you. Big ideas, small suggestions, and honest experiences are all welcome.</p><ul><li><Sparkles size={17} />Share an idea or suggestion</li><li><Heart size={17} />Tell us about your experience</li><li><MessageCircle size={17} />Help us spot an issue</li></ul><div>Need help with your account?<Link href="/contact">Get in touch <ArrowUpRight size={14} /></Link></div></aside>
      <section className="vl-account-card vl-feedback-card">{submitted ? <div className="vl-feedback-success" role="status"><span><Check size={31} /></span><h2>We’re glad you shared.</h2><p>Thanks for helping shape a better learning experience. Your feedback has reached our team.</p><Button type="button" variant="outline" onClick={() => setSubmitted(false)}>Share another thought</Button></div> : <><div className="vl-account-card-heading"><div><h2>What’s on your mind?</h2><p>A few words can make a big difference.</p></div></div><form onSubmit={handleSubmit} className="vl-feedback-form"><div className="vl-feedback-form-row"><Input label="Your name" name="name" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Your name" required /><Input label="Email address" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required /></div><Input label="A little context" name="subject" value={form.subject} onChange={handleChange} placeholder="Give your thought a title" required /><div><label htmlFor="feedback-message">Your message</label><textarea id="feedback-message" name="message" value={form.message} onChange={handleChange} placeholder="We’re listening. Tell us a little more…" rows={6} required /></div><div className="vl-feedback-form-bottom"><span>We read every message.</span><Button type="submit" disabled={loading}>{loading ? "Sending your thoughts…" : <>Send feedback <Send size={15} /></>}</Button></div></form></>}</section>
    </div>
  </main><Footer /></div>;
}
