"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/loading";
import { Phone, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

type Status = { configured: boolean; lastSync: string | null; pending: number };

export default function LeadsSyncPage() {
  const [s, setS] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = () =>
    api.get("/admin/leads/status")
      .then(({ data }) => setS(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const syncNow = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post("/admin/leads/sync", {});
      const added = data.data?.added ?? 0;
      const noPhone = data.data?.skipped ?? 0;
      toast.success(
        added === 0
          ? "Up to date — no new signups to add"
          : `Added ${added} signup${added === 1 ? "" : "s"}${noPhone ? ` (${noPhone} without a phone number)` : ""}`
      );
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Sync failed");
    } finally { setSyncing(false); }
  };

  if (loading) return <PageLoader />;

  const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12: true }) : "Never";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Phone className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold">Calling Leads Sheet</h1>
          <p className="text-sm text-gray-500">New signups are appended to your Google Sheet every hour for the calling team.</p>
        </div>
      </div>

      {!s?.configured && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Not configured yet</p>
            <p className="mt-1">
              Set <code className="rounded bg-amber-100 px-1">LEADS_SHEET_ID</code> and{" "}
              <code className="rounded bg-amber-100 px-1">GOOGLE_SERVICE_ACCOUNT_JSON</code> in Render, then restart the service.
              Remember to share the sheet with the service account email as an Editor.
            </p>
          </div>
        </div>
      )}

      {s?.configured && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
          <span>Connected. Syncing automatically every hour.</span>
        </div>
      )}

      <Card>
        <CardHeader><h2 className="font-semibold">Status</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Last synced</p>
              <p className="mt-1 font-semibold">{fmt(s?.lastSync ?? null)}</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Waiting to be added</p>
              <p className="mt-1 font-semibold">{s?.pending ?? 0} signup{(s?.pending ?? 0) === 1 ? "" : "s"}</p>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Only columns A–D are written (Name, Phone, Email, Signed up). Anything your callers add in Status/Notes is never overwritten.
          </p>

          <div className="flex justify-end">
            <Button onClick={syncNow} disabled={syncing || !s?.configured}>
              <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync now"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
