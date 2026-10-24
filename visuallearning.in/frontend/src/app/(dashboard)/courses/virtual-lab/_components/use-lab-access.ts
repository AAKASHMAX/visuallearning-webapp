"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import api from "@/lib/api";
import { getSubscriptionList, hasActiveSubscription } from "@/lib/subscription-access";

type AccessStatus = "checking" | "allowed" | "denied" | "anonymous" | "error";

export function useLabAccess() {
  const { user, isAuthenticated, hydrate } = useAuth();
  const userId = user?.id;
  const role = user?.role;
  const identity = isAuthenticated && userId ? `${userId}:${role}` : "anonymous";
  const [hydrated, setHydrated] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [access, setAccess] = useState<{ identity: string; status: AccessStatus }>({ identity: "", status: "checking" });

  useEffect(() => { hydrate(); setHydrated(true); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    let current = true;
    const finish = (status: AccessStatus) => { if (current) setAccess({ identity, status }); };
    finish("checking");
    if (!isAuthenticated || !userId) { finish("anonymous"); return; }
    if (role === "ADMIN") { finish("allowed"); return; }

    try {
      const cached = JSON.parse(sessionStorage.getItem("vl_my_sub") || "null");
      if (cached?.userId === userId && Date.now() - cached.ts < 5 * 60 * 1000) {
        finish(hasActiveSubscription(cached.data) ? "allowed" : "denied");
        return;
      }
    } catch { /* A stale or unavailable cache does not prevent checking access. */ }

    api.get("/subscription/my-subscription").then(({ data }) => {
      if (!current) return;
      const subscriptions = getSubscriptionList(data);
      try { sessionStorage.setItem("vl_my_sub", JSON.stringify({ userId, data: subscriptions, ts: Date.now() })); } catch {}
      finish(hasActiveSubscription(subscriptions) ? "allowed" : "denied");
    }).catch(() => finish("error"));
    return () => { current = false; };
  }, [hydrated, identity, isAuthenticated, userId, role, attempt]);

  return {
    // An old account's result must not be rendered during the next effect.
    status: hydrated && access.identity === identity ? access.status : "checking" as AccessStatus,
    retry: () => { setAccess({ identity, status: "checking" }); setAttempt(value => value + 1); },
  };
}
