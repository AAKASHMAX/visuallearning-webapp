"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Lock } from "lucide-react";
import { VideoRoom } from "@/components/live-class/video-room";

export default function WatchLiveClassPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, hydrate } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    hydrate();
    setHydrated(true);
  }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) { setLoading(false); return; }

    api.get(`/live-classes/join/${id}`)
      .then(({ data }) => {
        setToken(data.data.token);
        setClassInfo(data.data);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || "Failed to join live class";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id, isAuthenticated, hydrated]);

  if (!hydrated || loading) return <PageLoader />;

  if (!isAuthenticated) {
    return (
      <div className="max-w-lg mx-auto mt-12 text-center">
        <Card>
          <CardContent className="p-8">
            <Lock className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Login Required</h2>
            <p className="text-sm text-gray-500 mb-4">Please login to join the live class.</p>
            <Button onClick={() => router.push("/auth/login")}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <button onClick={() => router.back()} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <Card>
          <CardContent className="p-8 text-center">
            <Lock className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Cannot Join</h2>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/courses/live-classes")}>Back to Live Classes</Button>
              <Button onClick={() => router.push("/subscription")}>View Plans</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (token && classInfo) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => router.push("/courses/live-classes")} className="text-sm text-primary flex items-center gap-1 hover:underline">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <h1 className="text-lg font-bold">{classInfo.title}</h1>
          <span className="text-sm text-gray-400">by {classInfo.teacher.name}</span>
        </div>
        <VideoRoom
          token={token}
          userName={user?.name || "Student"}
          onLeave={() => router.push("/courses/live-classes")}
        />
      </div>
    );
  }

  return null;
}
