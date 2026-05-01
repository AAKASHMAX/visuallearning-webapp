"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

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
    </div>
  );
}
