"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Radio, Clock, CheckCircle, Trash2, Play, Square, Users } from "lucide-react";

interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  status: "SCHEDULED" | "LIVE" | "ENDED";
  notifyTarget: "ALL" | "SUBSCRIBED" | "GROUP";
  studentGroup?: { id: string; name: string } | null;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
  teacher: { id: string; name: string; email?: string };
  _count: { accessList: number };
}

const statusConfig = {
  SCHEDULED: { label: "Scheduled", icon: Clock, variant: "default" as const, color: "text-blue-600" },
  LIVE: { label: "Live Now", icon: Radio, variant: "success" as const, color: "text-red-600" },
  ENDED: { label: "Ended", icon: CheckCircle, variant: "default" as const, color: "text-gray-500" },
};

export default function LiveClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === "ADMIN";

  const load = () => {
    setLoading(true);
    const endpoint = isAdmin ? "/live-classes/all" : "/live-classes/my-classes";
    api.get(endpoint).then(({ data }) => setClasses(data.data)).finally(() => setLoading(false));
  };

  useEffect(load, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this live class?")) return;
    try {
      const endpoint = isAdmin ? `/live-classes/admin/${id}` : `/live-classes/${id}`;
      await api.delete(endpoint);
      toast.success("Live class deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEnd = async (id: string) => {
    try {
      await api.post(`/live-classes/${id}/end`);
      toast.success("Live class ended");
      load();
    } catch {
      toast.error("Failed to end class");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isAdmin ? "All Live Classes" : "My Live Classes"}</h1>
        <Link href="/admin/live-classes/create">
          <Button><Plus className="w-4 h-4 mr-2" /> Create Live Class</Button>
        </Link>
      </div>

      {loading ? (
        <PageLoader />
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-500">
            <Radio className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No live classes yet</p>
            <p className="text-sm">Create your first live class to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {classes.map((lc) => {
            const sc = statusConfig[lc.status];
            const StatusIcon = sc.icon;
            return (
              <Card key={lc.id} className={lc.status === "LIVE" ? "border-red-300 bg-red-50/30" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon className={`w-5 h-5 ${sc.color}`} />
                        <h3 className="font-semibold text-lg">{lc.title}</h3>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                        <Badge variant="default">
                          {lc.notifyTarget === "ALL" ? "All Users" : lc.notifyTarget === "GROUP" ? `Group: ${lc.studentGroup?.name || "Unknown"}` : "Subscribed Only"}
                        </Badge>
                      </div>
                      {lc.description && <p className="text-sm text-gray-500 mb-2">{lc.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {isAdmin && <span>Teacher: {lc.teacher.name}</span>}
                        {lc.scheduledAt && <span>Scheduled: {new Date(lc.scheduledAt).toLocaleString("en-IN")}</span>}
                        {lc.startedAt && <span>Started: {new Date(lc.startedAt).toLocaleString("en-IN")}</span>}
                        {lc.endedAt && <span>Ended: {new Date(lc.endedAt).toLocaleString("en-IN")}</span>}
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {lc._count.accessList} manual access</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {lc.status === "SCHEDULED" && (
                        <Link href={`/admin/live-classes/${lc.id}`}>
                          <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                            <Play className="w-3 h-3 mr-1" /> Go Live
                          </Button>
                        </Link>
                      )}
                      {lc.status === "LIVE" && (
                        <>
                          <Link href={`/admin/live-classes/${lc.id}`}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                              Rejoin
                            </Button>
                          </Link>
                          <Button size="sm" variant="destructive" onClick={() => handleEnd(lc.id)}>
                            <Square className="w-3 h-3 mr-1" /> End
                          </Button>
                        </>
                      )}
                      {lc.status === "SCHEDULED" && (
                        <Link href={`/admin/live-classes/${lc.id}`}>
                          <Button size="sm" variant="outline">Manage</Button>
                        </Link>
                      )}
                      {lc.status !== "LIVE" && (
                        <Button size="sm" variant="ghost" onClick={() => handleDelete(lc.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
