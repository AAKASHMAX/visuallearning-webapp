"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

function hasStoredAuth() {
  const token = window.localStorage.getItem("phy_token");
  const user = window.localStorage.getItem("phy_user");

  if (!token || !user) return false;

  try {
    JSON.parse(user);
    return true;
  } catch {
    window.localStorage.removeItem("phy_user");
    return false;
  }
}

export function useRequireAuth() {
  const { canView } = useRequireAuthStatus();

  return canView;
}

export function useRequireAuthStatus() {
  const router = useRouter();
  const { hydrate, isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    hydrate();

    if (!hasStoredAuth()) {
      setRedirecting(true);
      const redirectTo = `${window.location.pathname}${window.location.search}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    setRedirecting(false);
    setChecked(true);
  }, [hydrate, router]);

  return {
    canView: checked && isAuthenticated,
    checking: !checked && !redirecting,
    redirecting,
  };
}
