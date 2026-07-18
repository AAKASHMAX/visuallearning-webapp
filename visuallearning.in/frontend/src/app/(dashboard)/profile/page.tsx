"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put("/auth/profile", { name });
      setUser(data.data);
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">Account Information</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Email" value={user?.email || ""} disabled />
            <Input label="Role" value={user?.role || ""} disabled />
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update Profile"}</Button>
          </form>
        </CardContent>
      </Card>

      {telegramLink && (
        <Card className="mt-6">
          <CardHeader><h2 className="font-semibold">Get updates on Telegram</h2></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              Connect Telegram to get trial reminders, new-content alerts and offers directly in your chat. Free — just tap Start on our bot.
            </p>
            <a
              href={telegramLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#229ED9] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1b8ec4]"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white" aria-hidden>
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              Connect Telegram
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
