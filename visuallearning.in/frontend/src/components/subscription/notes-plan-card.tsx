"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import api from "@/lib/api";
import { FileText, Check, Eye } from "lucide-react";

interface ClassItem {
  id: string;
  name: string;
}

// "Notes Plan" — ₹99 for VIEW-ONLY access to all notes of ONE chosen class
// (no videos/quiz, no downloads). Rendered on the courses page and pricing page.
export function NotesPlanCard() {
  const router = useRouter();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selected, setSelected] = useState("");

  useEffect(() => {
    api
      .get("/courses/classes")
      .then(({ data }) => {
        const cs: ClassItem[] = Array.isArray(data?.data) ? data.data : [];
        setClasses(cs);
        if (cs[0]) setSelected(cs[0].id);
      })
      .catch(() => {});
  }, []);

  const perks = ["All chapter notes for your chosen class", "View-only — read on web & app", "Any one class of your choice"];

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
            <FileText className="h-3.5 w-3.5" /> NOTES-ONLY PLAN
          </span>
          <h2 className="mt-3 flex items-baseline gap-2 text-2xl font-black text-heading">
            Notes Plan
            <span className="text-emerald-600">₹99</span>
            <span className="text-sm font-semibold text-gray-400">/ month</span>
          </h2>
          <p className="mt-1 text-sm text-text-muted">Read all the notes for any one class — the budget way to revise.</p>
          <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" /> {p}
              </li>
            ))}
          </ul>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400">
            <Eye className="h-3.5 w-3.5" /> View-only — does not include downloads, videos or quizzes.
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <div className="rounded-xl border border-emerald-100 bg-white p-4">
            <label className="mb-1.5 block text-xs font-bold text-gray-500">Choose a class</label>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-heading focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {classes.length === 0 && <option>Loading classes…</option>}
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <RazorpayButton
              plan="NOTES_PLAN"
              amount={99}
              label="Notes Plan"
              classesAccess={selected ? [selected] : []}
              billingCycle="monthly"
              downloadAddon={false}
              buttonLabel="Get Notes Access — ₹99"
              onSuccess={() => router.push("/dashboard")}
              className="mt-3 w-full bg-emerald-600 text-white hover:bg-emerald-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
