"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/ui/loading";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, hydrate } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    hydrate();
    setChecked(true);
  }, [hydrate]);

  useEffect(() => {
    if (checked) {
      if (!isAuthenticated) router.push("/admin/login");
      else if (user?.role !== "ADMIN" && user?.role !== "TEACHER") router.push("/");
    }
  }, [checked, isAuthenticated, user, router]);

  if (!checked || !isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "TEACHER")) return <PageLoader />;
  return <>{children}</>;
}
