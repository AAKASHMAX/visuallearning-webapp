import { prisma } from "../config/prisma";

// Admin-controlled free-trial plan (Settings key "trial_plan"). Shared by the web
// and mobile subscription controllers so both price/duration the trial identically.
// The trial is genuinely free — activated in one click, no payment gateway.
export type TrialConfig = {
  enabled: boolean;
  label: string;
  durationDays: number;
};

// Trial retired: new users get the free first chapter of every subject instead
// of a full-access trial. Existing active trials run until they expire.
export const DEFAULT_TRIAL: TrialConfig = {
  enabled: false,
  label: "3-Day Free Trial",
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
      durationDays: Number(raw.durationDays) > 0 ? Number(raw.durationDays) : DEFAULT_TRIAL.durationDays,
    };
  } catch {
    return { ...DEFAULT_TRIAL };
  }
}
