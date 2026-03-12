"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PageLoader } from "@/components/ui/loading";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, hydrate } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    hydrate();
    setChecked(true);
  }, [hydrate]);

  useEffect(() => {
    if (checked && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [checked, isAuthenticated, router]);

  if (!checked || !isAuthenticated) return <PageLoader />;
  return <>{children}</>;
}
