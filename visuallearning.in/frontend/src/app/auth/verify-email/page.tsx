"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, MailWarning } from "lucide-react";
import { PageLoader, Spinner } from "@/components/ui/loading";
import { AuthShell } from "@/components/auth/auth-shell";
import { authLink, safeInternalRedirect } from "@/lib/auth-redirect";
import api from "@/lib/api";

export default function VerifyEmailPage() {
  return <Suspense fallback={<PageLoader />}><VerifyEmailContent /></Suspense>;
}
function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const next = safeInternalRedirect(searchParams.get("next"));
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    let active = true;
    api.get("/auth/verify-email", { params: { token } }).then(() => { if (active) setStatus("success"); }).catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [token]);
  return <AuthShell title={status === "success" ? "You’re all set." : status === "error" ? "Let’s try that again." : "One small moment."} eyebrow="Make it official" description={status === "success" ? "Your email is verified. A world of discovery is ready when you are." : status === "error" ? "This verification link is invalid or has expired." : "We’re checking your email verification link."}>
    <div className={`vl-auth-status${status === "error" ? " is-error" : ""}`} role="status">
      {status === "loading" ? <Spinner /> : <><span className="vl-auth-status-icon">{status === "success" ? <Check size={31} /> : <MailWarning size={29} />}</span><strong>{status === "success" ? "Email verified successfully" : "We couldn’t verify your email"}</strong><p>{status === "success" ? "Your account is now verified." : "Log in to your account or get in touch if you need a hand."}</p><Link className="vl-account-primary-link" href={status === "success" ? next || "/dashboard" : authLink("/auth/login", next)}>{status === "success" ? "Continue learning" : "Back to log in"}<ArrowRight size={16} /></Link></>}
    </div>
  </AuthShell>;
}
