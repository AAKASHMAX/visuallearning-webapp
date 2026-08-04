import { prisma } from "../config/prisma";

// Admin-controlled affiliate defaults (Settings key "affiliate_settings").
export type AffiliateSettings = {
  enabled: boolean;
  defaultCommissionPercent: number; // % of the sale paid to the affiliate
  buyerDiscountPercent: number;     // % discount the referral code gives the buyer
  minPayoutRupees: number;          // minimum earnings before payout
};

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  enabled: true,
  defaultCommissionPercent: 20,
  buyerDiscountPercent: 10,
  minPayoutRupees: 500,
};

export async function getAffiliateSettings(): Promise<AffiliateSettings> {
  try {
    const s = await prisma.setting.findUnique({ where: { key: "affiliate_settings" } });
    if (!s?.value) return { ...DEFAULT_AFFILIATE_SETTINGS };
    const raw = JSON.parse(s.value);
    return {
      enabled: raw.enabled !== false,
      defaultCommissionPercent: clampPct(raw.defaultCommissionPercent, DEFAULT_AFFILIATE_SETTINGS.defaultCommissionPercent),
      buyerDiscountPercent: clampPct(raw.buyerDiscountPercent, DEFAULT_AFFILIATE_SETTINGS.buyerDiscountPercent),
      minPayoutRupees: Number(raw.minPayoutRupees) >= 0 ? Number(raw.minPayoutRupees) : DEFAULT_AFFILIATE_SETTINGS.minPayoutRupees,
    };
  } catch {
    return { ...DEFAULT_AFFILIATE_SETTINGS };
  }
}

function clampPct(v: any, fallback: number) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) return fallback;
  return Math.round(n);
}

// Build a readable, unique affiliate code from the user's name (e.g. "RAVI7412").
export async function generateAffiliateCode(name: string): Promise<string> {
  const base = (name || "VL").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 6) || "VL";
  for (let i = 0; i < 20; i++) {
    // 4-digit suffix; not cryptographic — just needs to be unique.
    const suffix = String(1000 + ((base.length * 37 + i * 911 + name.length * 13) % 9000));
    const code = `${base}${suffix}`;
    const taken = (await prisma.coupon.findUnique({ where: { code } })) || (await prisma.affiliate.findUnique({ where: { code } }));
    if (!taken) return code;
  }
  // Fallback: append the timestamp tail.
  return `${base}${Date.now().toString().slice(-5)}`;
}

// Called after a paid subscription is created. If the coupon used belongs to an
// approved affiliate (and it isn't a self-referral), record the commission.
export async function recordAffiliateCommission(sub: {
  id: string;
  userId: string;
  couponCode: string | null;
  amount: number;
}): Promise<void> {
  try {
    if (!sub.couponCode || sub.amount <= 0) return;

    const affiliate = await prisma.affiliate.findUnique({ where: { code: sub.couponCode.toUpperCase() } });
    if (!affiliate || affiliate.status !== "APPROVED") return;
    if (affiliate.userId === sub.userId) return; // no self-referral

    const settings = await getAffiliateSettings();
    const pct = affiliate.commissionPercent ?? settings.defaultCommissionPercent;
    const commissionAmount = Math.round((sub.amount * pct) / 100);
    if (commissionAmount <= 0) return;

    // subscriptionId is unique → a retry/replay won't double-credit.
    await prisma.affiliateCommission.create({
      data: {
        affiliateId: affiliate.id,
        subscriptionId: sub.id,
        userId: sub.userId,
        saleAmount: sub.amount,
        commissionAmount,
        status: "PENDING",
      },
    });
  } catch (e) {
    // Never let commission bookkeeping break a successful purchase.
    console.error("recordAffiliateCommission failed:", e);
  }
}
