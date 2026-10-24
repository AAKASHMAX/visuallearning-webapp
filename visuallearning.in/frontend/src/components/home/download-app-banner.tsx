"use client";
import { ArrowUpRight, Smartphone } from "lucide-react";
import { APP_PUBLISHED, PLAY_STORE_URL } from "@/lib/app-links";

export function DownloadAppBanner() {
  if (!APP_PUBLISHED) return null;
  return <aside className="vl-download-banner"><div><p><Smartphone size={13}/> LEARNING, WHEREVER YOU ARE</p><h2>Take a little curiosity with you.</h2><p>Find your lessons, notes, and quizzes in the Visual Learning app.</p></div><a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer"><Smartphone size={16}/> Get the Android app <ArrowUpRight size={16}/></a></aside>;
}
