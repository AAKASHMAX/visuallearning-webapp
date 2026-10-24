"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Languages, X } from "lucide-react";
import { useLanguage } from "@/lib/language";

const options = [{ value: "HINDI", label: "Hinglish", detail: "A familiar mix of Hindi and English" }, { value: "ENGLISH", label: "English", detail: "Learn in English" }];

export function LanguagePicker({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, hydrate } = useLanguage();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "Tab") {
        const buttons = panel.current?.querySelectorAll<HTMLButtonElement>("button");
        if (!buttons?.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); trigger.current?.focus(); };
  }, [open]);
  return <>
    <button ref={trigger} type="button" className={compact ? "vl-language-compact" : "vl-side-link vl-language-trigger"} onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} aria-label={`Learning language: ${language === "ENGLISH" ? "English" : "Hinglish"}`}>
      <Languages size={17} aria-hidden="true" />
      {!compact && <span>Language</span>}
      <span className="vl-language-value">{language === "ENGLISH" ? "English" : "Hinglish"}</span>
      {compact && <ChevronDown size={12} aria-hidden="true" />}
    </button>
    {open && createPortal(<div className="vl-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="vl-language-dialog" ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="vl-dialog-heading"><span className="vl-dialog-icon"><Languages size={23} /></span><button className="vl-icon-button" type="button" aria-label="Close language picker" onClick={() => setOpen(false)}><X size={19} /></button></div>
        <h2 id={titleId}>Make learning feel familiar.</h2>
        <p>Choose the language you’d like to use for your lessons.</p>
        <div className="vl-language-options">{options.map((option) => <button key={option.value} type="button" aria-pressed={language === option.value} className={language === option.value ? "is-selected" : ""} onClick={() => { setLanguage(option.value); setOpen(false); }}><span><strong>{option.label}</strong><small>{option.detail}</small></span>{language === option.value && <Check size={19} />}</button>)}</div>
      </div>
    </div>, document.body)}
  </>;
}
