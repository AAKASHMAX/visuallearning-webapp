"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export function PasswordInput({ label = "Password", ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: string }) {
  const [visible, setVisible] = useState(false);
  return <div className="vl-password-field"><Input label={label} type={visible ? "text" : "password"} {...props} className={`pr-12 ${props.className || ""}`} /><button type="button" aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={visible} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>;
}
