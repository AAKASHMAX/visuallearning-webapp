import { prisma } from "../config/prisma";

// Admin-controlled free-trial plan (Settings key "trial_plan"). Shared by the web
// and mobile subscription controllers so both price/duration the trial identically.
export type TrialConfig = {
  enabled: boolean;
  label: string;
  priceRupees: number; // charged amount (Razorpay minimum is Rs 1)
  durationDays: number;
};

export const DEFAULT_TRIAL: TrialConfig = {
  enabled: true,
  label: "3-Day Free Trial",
  priceRupees: 1,
  durationDays: 3,
};

export async function getTrialConfig(): Promise<TrialConfig> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "trial_plan" } });
    if (!s?.value) return { ...DEFAULT_TRIAL };
    const raw = JSON.parse(s.value);
    return {
      enabled: raw.enabled !== false,
      label: String(raw.label || DEFAULT_TRIAL.label),
      priceRupees: Number(raw.priceRupees) > 0 ? Number(raw.priceRupees) : DEFAULT_TRIAL.priceRupees,
      durationDays: Number(raw.durationDays) > 0 ? Number(raw.durationDays) : DEFAULT_TRIAL.durationDays,
    };
  } catch {
    return { ...DEFAULT_TRIAL };
  }
}

// Razorpay needs at least 100 paise.
export function trialAmountPaise(t: TrialConfig) {
  return Math.max(100, Math.round(t.priceRupees * 100));
}
