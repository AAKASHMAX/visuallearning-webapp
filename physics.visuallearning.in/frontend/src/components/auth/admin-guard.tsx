"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/ui/loading";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, hydrate } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (ready && (!isAuthenticated || user?.role !== "ADMIN")) {
      router.push("/admin/login");
    }
  }, [ready, isAuthenticated, user, router]);

  if (!ready || !isAuthenticated || user?.role !== "ADMIN") {
    return <PageLoader />;
  }

  return <>{children}</>;
}
