"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, Play, Trash2, UserPlus, X, Search, Square } from "lucide-react";
import { VideoRoom } from "@/components/live-class/video-room";

interface AccessUser {
  id: string;
  user: { id: string; name: string; email: string };
}

interface SearchResult {
  id: string;
  name: string;
  email: string;
}

export default function ManageLiveClassPage() {
  const { id } = useParams();
  const router = useRouter();
  const [liveClass, setLiveClass] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [accessList, setAccessList] = useState<AccessUser[]>([]);

  // Go Live state
  const [notifyTarget, setNotifyTarget] = useState<"ALL" | "SUBSCRIBED" | "GROUP">("ALL");
  const [goingLive, setGoingLive] = useState(false);

  // Student groups
  const [groups, setGroups] = useState<{id: string; name: string; _count: {members: number}}[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");

  // Active video session
  const [hmsToken, setHmsToken] = useState<string | null>(null);

  // User search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const loadClass = useCallback(async () => {
    try {
      const [classRes, accessRes] = await Promise.all([
        api.get("/live-classes/my-classes"),
        api.get(`/live-classes/${id}/access`),
      ]);
      const cls = classRes.data.data.find((c: any) => c.id === id);
      if (!cls) { toast.error("Live class not found"); router.push("/admin/live-classes"); return; }
      setLiveClass(cls);
      setNotifyTarget(cls.notifyTarget);
      setAccessList(accessRes.data.data);

      // If already live, get token to rejoin
      if (cls.status === "LIVE") {
        const tokenRes = await api.get(`/live-classes/${id}/token`);
        setHmsToken(tokenRes.data.data.token);
      }
    } catch {
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    loadClass();
    api.get("/student-groups").then(({ data }) => setGroups(data.data)).catch(() => {});
  }, [loadClass]);

  const handleGoLive = async () => {
    if (notifyTarget === "GROUP" && !selectedGroupId) return toast.error("Please select a student group");
    setGoingLive(true);
    try {
      const payload: any = { notifyTarget };
      if (notifyTarget === "GROUP") payload.studentGroupId = selectedGroupId;
      const { data } = await api.post(`/live-classes/${id}/go-live`, payload);
      toast.success("You are now live!");
      setHmsToken(data.data.token);
      setLiveClass({ ...liveClass, status: "LIVE", hmsRoomId: data.data.hmsRoomId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to go live");
    } finally {
      setGoingLive(false);
    }
  };

  const handleEndClass = async () => {
    if (!confirm("End this live class? All participants will be disconnected.")) return;
    try {
      // Clear token first to unmount VideoRoom and stop the connection
      setHmsToken(null);
      await api.post(`/live-classes/${id}/end`);
      toast.success("Live class ended");
      router.push("/admin/live-classes");
    } catch (err: any) {
      console.error("End class error:", err);
      toast.error(err.response?.data?.message || "Failed to end class");
      // Still redirect since the class might have ended
      router.push("/admin/live-classes");
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setSearching(true);
    try {
      const { data } = await api.get(`/live-classes/search-users?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.data);
    } catch {
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  };

  const addUser = async (userId: string) => {
    try {
      await api.post(`/live-classes/${id}/access`, { userIds: [userId] });
      toast.success("User added");
      setSearchResults(searchResults.filter((u) => u.id !== userId));
      loadClass();
    } catch {
      toast.error("Failed to add user");
    }
  };

  const removeUser = async (userId: string) => {
    try {
      await api.delete(`/live-classes/${id}/access/${userId}`);
      toast.success("User removed");
      setAccessList(accessList.filter((a) => a.user.id !== userId));
    } catch {
      toast.error("Failed to remove user");
    }
  };

  if (loading) return <PageLoader />;
  if (!liveClass) return null;

  // If live and has token, show the video room
  if (liveClass.status === "LIVE" && hmsToken) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{liveClass.title}</h1>
            <Badge variant="success" className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> LIVE
            </Badge>
          </div>
          <Button variant="destructive" onClick={handleEndClass}>
            <Square className="w-4 h-4 mr-2" /> End Class
          </Button>
        </div>
        <VideoRoom token={hmsToken} userName={liveClass.teacher.name} isHost />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="text-sm text-primary flex items-center gap-1 mb-4 hover:underline">
        <ArrowLeft className="w-3 h-3" /> Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">{liveClass.title}</h1>
        <Badge variant={liveClass.status === "LIVE" ? "success" : "default"}>{liveClass.status}</Badge>
      </div>

      {/* Go Live Section */}
      {liveClass.status === "SCHEDULED" && (
        <Card className="mb-6 border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-red-500" /> Go Live
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Send Notification To</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={notifyTarget === "ALL"} onChange={() => setNotifyTarget("ALL")} className="accent-primary" />
                    <span className="text-sm">All Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={notifyTarget === "SUBSCRIBED"} onChange={() => setNotifyTarget("SUBSCRIBED")} className="accent-primary" />
                    <span className="text-sm">Subscribed Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={notifyTarget === "GROUP"} onChange={() => setNotifyTarget("GROUP")} className="accent-primary" />
                    <span className="text-sm">Student Group</span>
                  </label>
                </div>
                {notifyTarget === "GROUP" && (
                  <div className="mt-3">
                    <select
                      value={selectedGroupId}
                      onChange={(e) => setSelectedGroupId(e.target.value)}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                    >
                      <option value="">Select a group...</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} ({g._count.members} members)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Clicking "Go Live" will create a video room and notify users. Your camera and microphone will be requested.
              </p>
              <Button onClick={handleGoLive} disabled={goingLive} className="bg-red-500 hover:bg-red-600 text-white">
                {goingLive ? "Starting..." : "Go Live Now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Users Section */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5" /> Add Users to Live Class
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Manually grant access to specific users (they can join even without a subscription).
          </p>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={searching} variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-lg mb-4 max-h-48 overflow-y-auto">
              {searchResults.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 border-b last:border-0 hover:bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <Button size="sm" onClick={() => addUser(u.id)}>
                    <UserPlus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          <h3 className="text-sm font-medium mb-2">Users with Access ({accessList.length})</h3>
          {accessList.length === 0 ? (
            <p className="text-sm text-gray-400">No manual access granted yet.</p>
          ) : (
            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {accessList.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{a.user.name}</p>
                    <p className="text-xs text-gray-400">{a.user.email}</p>
                  </div>
                  <button onClick={() => removeUser(a.user.id)} className="text-red-500 hover:text-red-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete */}
      {liveClass.status !== "LIVE" && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-2 text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-gray-500 mb-4">Deleting a live class cannot be undone.</p>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!confirm("Delete this live class?")) return;
                await api.delete(`/live-classes/${id}`);
                toast.success("Deleted");
                router.push("/admin/live-classes");
              }}
            >
              Delete Live Class
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
