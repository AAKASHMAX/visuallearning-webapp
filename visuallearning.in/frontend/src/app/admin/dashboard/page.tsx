"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import { Users, CreditCard, PlayCircle, TrendingUp, Eye, EyeOff, ArrowUpRight, BookOpen, Bell, RefreshCw } from "lucide-react";

interface Stats { totalUsers: number; activeSubscriptions: number; totalRevenue: number; totalVideos: number; recentUsers: { id: string; name: string; email: string; createdAt: string }[] }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const load = useCallback(async () => { setLoading(true); try { const {data} = await api.get("/admin/stats"); setStats(data.data); } catch { setStats(null); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  if (loading) return <PageLoader />;
  if (!stats) return <div className="learn-empty" role="alert"><RefreshCw/><h1>Your overview couldn’t load.</h1><p>Please try again in a moment.</p><Button onClick={()=>void load()}>Try again</Button></div>;
  const cards = [
    { label: "Total students", value: stats.totalUsers.toLocaleString("en-IN"), icon: Users, color: "sage", sensitive: true, note: "Your learning community" },
    { label: "Active subscriptions", value: stats.activeSubscriptions.toLocaleString("en-IN"), icon: CreditCard, color: "sage", sensitive: true, note: "Learning with full access" },
    { label: "Total revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "sand", sensitive: true, note: "Across your subscriptions" },
    { label: "Video library", value: stats.totalVideos.toLocaleString("en-IN"), icon: PlayCircle, color: "lilac", sensitive: false, note: "Lessons ready to discover" },
  ];
  return <div className="admin-overview">
    <header className="admin-overview-heading"><div><span className="learn-eyebrow"><span/> YOUR WORKSPACE, AT A GLANCE</span><h1>Good things are<br/><em>growing here.</em></h1><p>A little perspective on your learning community.</p></div><Button variant="outline" size="sm" onClick={()=>setShowStats(!showStats)} aria-pressed={showStats}>{showStats?<EyeOff size={15}/>:<Eye size={15}/>} {showStats?"Hide figures":"Show figures"}</Button></header>
    <div className="admin-overview-stats">{cards.map(c=><Card key={c.label}><CardContent><div className="admin-stat-top"><span>{c.label}</span><span className={`admin-stat-icon tone-${c.color}`}><c.icon size={19} strokeWidth={1.5}/></span></div><strong>{c.sensitive&&!showStats?"••••":c.value}</strong><p>{c.note}</p></CardContent></Card>)}</div>
    <div className="admin-overview-shortcuts">{[{title:"Shape the next lesson",text:"Manage your content library",href:"/admin/content",icon:BookOpen},{title:"Meet your learners",text:"Browse and manage accounts",href:"/admin/users",icon:Users},{title:"Keep everyone in the loop",text:"Create a learning update",href:"/admin/notifications",icon:Bell}].map(item=><Link key={item.href} href={item.href}><item.icon size={23} strokeWidth={1.5}/><div><h2>{item.title}</h2><p>{item.text}</p></div><ArrowUpRight size={17}/></Link>)}</div>
    <Card className="admin-recent"><div className="admin-recent-heading"><div><p className="learn-eyebrow">NEW FACES, NEW POSSIBILITIES</p><h2>The latest learners</h2></div><Link href="/admin/users">View everyone <ArrowUpRight size={15}/></Link></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th>Learner</th><th>Email address</th><th>Joined</th></tr></thead><tbody>{stats.recentUsers.map(u=><tr key={u.id} className="border-b last:border-0"><td><span className="admin-learner"><span>{u.name.charAt(0).toUpperCase()}</span>{u.name}</span></td><td className="text-text-muted">{u.email}</td><td className="text-text-muted">{new Date(u.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</td></tr>)}</tbody></table></div>{stats.recentUsers.length===0&&<p className="p-8 text-center text-sm text-text-muted">Your next learner’s story starts here.</p>}</Card>
  </div>;
}
