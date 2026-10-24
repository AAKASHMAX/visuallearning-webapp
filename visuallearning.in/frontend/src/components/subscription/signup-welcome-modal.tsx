"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";

// Keep the post-signup explanation before continuing to the intended destination.
export function SignupWelcomeModal({ onClose }: { onClose: () => void }) {
  const continueButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    continueButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") { event.preventDefault(); continueButton.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(<div className="vl-welcome-backdrop"><section className="vl-welcome-card" role="dialog" aria-modal="true" aria-labelledby="welcome-title" aria-describedby="welcome-description"><div className="vl-welcome-head"><span><Sparkles size={30} /></span><p>A brighter way starts here</p><h2 id="welcome-title">Welcome to your<br />next discovery.</h2></div><div className="vl-welcome-body"><p id="welcome-description">Your account is ready. Start exploring these study resources for free:</p><ul>{["Visual notes", "NCERT solutions", "Previous year questions", "Quizzes & practice questions"].map((perk) => <li key={perk}><Check size={15} />{perk}</li>)}</ul><div className="vl-welcome-detail">Reading and practice are free. PDF downloads and 3D animated videos are included with a subscription.</div><button ref={continueButton} type="button" onClick={onClose} className="vl-account-primary-link">Start exploring <ArrowRight size={16} /></button></div></section></div>, document.body);
}
