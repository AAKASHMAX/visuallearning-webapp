"use client";
import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Mail, Save, Send, ShieldCheck, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

const TG_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || "";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const telegramLink = TG_BOT && user?.id ? `https://telegram.me/${TG_BOT}?start=${user.id}` : "";
  useEffect(() => { setName(user?.name || ""); }, [user?.name]);
  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", { name });
      setUser(data.data);
      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "We couldn’t update your profile. Please try again.");
    } finally { setLoading(false); }
  };
  return <div className="vl-profile-page">
    <header className="vl-account-page-heading"><span>YOUR SPACE, YOUR WAY</span><h1>A little about you.</h1><p>Keep your details up to date, and make yourself at home.</p></header>
    <div className="vl-profile-grid">
      <aside className="vl-profile-summary"><div className="vl-profile-avatar">{user?.name?.charAt(0).toUpperCase() || "V"}<span><Check size={12} /></span></div><h2>{user?.name || "Your account"}</h2><p>{user?.email}</p><span className="vl-profile-role">{user?.role === "ADMIN" ? "Administrator" : "Curious learner"}</span><div className="vl-profile-summary-bottom"><ShieldCheck size={17} /><span>Your progress belongs to you.<br />Keep discovering at your pace.</span></div></aside>
      <section className="vl-account-card"><div className="vl-account-card-heading"><span><User size={19} /></span><div><h2>Account details</h2><p>The essentials, all in one place.</p></div></div><form onSubmit={handleUpdate} className="vl-profile-form"><Input label="Full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" required /><Input label="Email address" type="email" value={user?.email || ""} disabled /><p className="vl-field-help"><Mail size={13} />Your email keeps your learning account connected.</p><div className="vl-profile-form-bottom"><span>Account type: {user?.role === "ADMIN" ? "Administrator" : "Student"}</span><Button type="submit" disabled={loading}>{loading ? "Saving changes…" : <><Save size={15} />Save changes</>}</Button></div></form></section>
    </div>
    {telegramLink && <section className="vl-profile-telegram"><span className="vl-profile-telegram-icon"><Send size={23} /></span><div><h2>A little learning update, right in your chat.</h2><p>Connect Telegram for new content, trial reminders, and offers. Tap Start in the bot to connect.</p></div><a href={telegramLink} target="_blank" rel="noopener noreferrer">Connect Telegram <ArrowUpRight size={16} /></a></section>}
  </div>;
}
