"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Users, Radio, Loader2 } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Audience = "channel" | "users";

type Status = { configured: boolean; channel: string; connectedUsers: number; webhookUrl?: string | null; canAutoRegister?: boolean };

export default function AdminTelegramPage() {
  const [status, setStatus] = useState<Status | null>(null);
  const [audience, setAudience] = useState<Audience>("channel");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [registering, setRegistering] = useState(false);

  const loadStatus = () => api.get("/admin/telegram/status").then(({ data }) => setStatus(data.data)).catch(() => {});
  useEffect(() => { loadStatus(); }, []);

  const registerWebhook = async () => {
    setRegistering(true);
    try {
      const { data } = await api.post("/admin/telegram/register-webhook");
      toast.success(`Webhook registered: ${data.data.url}`);
      loadStatus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to register webhook");
    } finally { setRegistering(false); }
  };

  const draft = async () => {
    if (topic.trim().length < 3) { toast.error("Enter a topic first"); return; }
    setDrafting(true);
    try {
      const { data } = await api.post("/admin/telegram/draft", { topic, audience });
      setMessage(data.data.draft);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to draft");
    } finally { setDrafting(false); }
  };

  const send = async () => {
    if (!message.trim()) { toast.error("Nothing to send"); return; }
    const where = audience === "channel" ? `the ${status?.channel || "channel"}` : `${status?.connectedUsers ?? 0} connected user(s)`;
    if (!window.confirm(`Send this message to ${where}?`)) return;
    setSending(true);
    try {
      const { data } = await api.post("/admin/telegram/send", { text: message, audience });
      toast.success(data.message || "Sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send");
    } finally { setSending(false); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center"><Send className="w-5 h-5 text-[#229ED9]" /></div>
        <div>
          <h1 className="text-2xl font-bold">Telegram Outreach</h1>
          <p className="text-sm text-gray-500">AI-draft a message, review it, and send to your channel or connected users.</p>
        </div>
      </div>

      {status && !status.configured && (
        <div className="my-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Telegram bot isn’t configured yet. Set <code>TELEGRAM_BOT_TOKEN</code> (and <code>ANTHROPIC_API_KEY</code>) in the backend env, then reload.
        </div>
      )}

      {status?.configured && (
        <div className="my-4 flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Bot webhook</span>{" "}
            <span className="text-gray-500">(needed for “Connect Telegram”): </span>
            {status.webhookUrl
              ? <span className="font-medium text-emerald-600">Registered ✓</span>
              : <span className="text-gray-500">not registered yet</span>}
          </div>
          <Button onClick={registerWebhook} disabled={registering} variant="outline" className="shrink-0 gap-1.5">
            {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {status.webhookUrl ? "Re-register" : "Register webhook"}
          </Button>
        </div>
      )}

      <Card className="mt-4">
        <CardContent className="p-6 space-y-5">
          {/* Audience */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Send to</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setAudience("channel")} className={`rounded-xl border p-3 text-left transition-all ${audience === "channel" ? "border-[#229ED9] bg-[#229ED9]/5" : "border-gray-200 hover:border-gray-300"}`}>
                <Radio className="w-4 h-4 mb-1 text-[#229ED9]" />
                <div className="text-sm font-bold">Channel</div>
                <div className="text-xs text-gray-500">{status?.channel || "@visuallearning3D"}</div>
              </button>
              <button onClick={() => setAudience("users")} className={`rounded-xl border p-3 text-left transition-all ${audience === "users" ? "border-[#229ED9] bg-[#229ED9]/5" : "border-gray-200 hover:border-gray-300"}`}>
                <Users className="w-4 h-4 mb-1 text-[#229ED9]" />
                <div className="text-sm font-bold">Connected users</div>
                <div className="text-xs text-gray-500">{status?.connectedUsers ?? 0} linked</div>
              </button>
            </div>
          </div>

          {/* Topic → AI draft */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Topic / key points (for AI)</label>
            <div className="flex gap-2">
              <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. New Class 12 Physics lecture videos are live; free 3-day trial" />
              <Button onClick={draft} disabled={drafting} className="shrink-0 gap-1.5">
                {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Draft
              </Button>
            </div>
          </div>

          {/* Editable message */}
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">Message (edit before sending — Telegram HTML supported)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={7}
              placeholder="Write here, or use “Draft” to have AI write it…"
              className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#229ED9]" />
          </div>

          <div className="flex justify-end">
            <Button onClick={send} disabled={sending || !status?.configured} className="gap-1.5 bg-[#229ED9] hover:bg-[#1b8ec4]">
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send {audience === "channel" ? "to channel" : "to users"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
