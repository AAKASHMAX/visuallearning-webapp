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
  const router = useRouter();
  const { hydrate, isAuthenticated } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    hydrate();

    if (!hasStoredAuth()) {
      const redirectTo = `${window.location.pathname}${window.location.search}`;
      router.replace(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }

    setChecked(true);
  }, [hydrate, router]);

  return checked && isAuthenticated;
}
