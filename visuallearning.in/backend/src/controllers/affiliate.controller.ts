import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { success, error } from "../utils/apiResponse";
import {
  getAffiliateSettings,
  generateAffiliateCode,
  DEFAULT_AFFILIATE_SETTINGS,
} from "../services/affiliate.service";

// Sum a user's commissions grouped by status.
async function commissionTotals(affiliateId: string) {
  const rows = await prisma.affiliateCommission.groupBy({
    by: ["status"],
    where: { affiliateId },
    _sum: { commissionAmount: true },
    _count: { _all: true },
  });
  let pending = 0, paid = 0, sales = 0;
  for (const r of rows) {
    const amt = r._sum.commissionAmount || 0;
    sales += r._count._all;
    if (r.status === "PAID") paid += amt;
    else pending += amt;
  }
  return { pendingPaise: pending, paidPaise: paid, sales };
}

// ── User-facing ───────────────────────────────────────────────────────────────

// GET /affiliate/me — the signed-in user's affiliate status + earnings.
export async function getMyAffiliate(req: Request, res: Response) {
  try {
    const settings = await getAffiliateSettings();
    const affiliate = await prisma.affiliate.findUnique({ where: { userId: req.user!.id } });
    if (!affiliate) {
      return success(res, { affiliate: null, settings });
    }
    const totals = await commissionTotals(affiliate.id);
    const recent = await prisma.affiliateCommission.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { saleAmount: true, commissionAmount: true, status: true, createdAt: true },
    });
    return success(res, {
      affiliate: {
        code: affiliate.code,
        status: affiliate.status,
        commissionPercent: affiliate.commissionPercent ?? settings.defaultCommissionPercent,
        payoutMethod: affiliate.payoutMethod,
        payoutDetails: affiliate.payoutDetails,
      },
      totals,
      recent,
      settings,
    });
  } catch (e) {
    console.error("getMyAffiliate error:", e);
    return error(res, "Failed to load affiliate info");
  }
}

// POST /affiliate/apply — become an affiliate (starts PENDING for admin approval).
export async function applyAffiliate(req: Request, res: Response) {
  try {
    const settings = await getAffiliateSettings();
    if (!settings.enabled) return error(res, "The affiliate program is not open right now", 400);

    const existing = await prisma.affiliate.findUnique({ where: { userId: req.user!.id } });
    if (existing) return error(res, "You have already applied to the affiliate program", 400);

    const payoutMethod = String(req.body?.payoutMethod || "").toUpperCase();
    const payoutDetails = String(req.body?.payoutDetails || "").trim();
    if (!["UPI", "BANK"].includes(payoutMethod)) return error(res, "Choose a payout method (UPI or BANK)", 400);
    if (!payoutDetails) return error(res, "Enter your payout details", 400);

    const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { name: true } });
    const code = await generateAffiliateCode(user?.name || "VL");

    const affiliate = await prisma.affiliate.create({
      data: {
        userId: req.user!.id,
        code,
        status: "PENDING",
        payoutMethod,
        payoutDetails: payoutDetails.slice(0, 300),
      },
    });
    return success(res, { code: affiliate.code, status: affiliate.status }, "Application submitted — we'll review it shortly", 201);
  } catch (e) {
    console.error("applyAffiliate error:", e);
    return error(res, "Failed to submit application");
  }
}

// ── Admin ─────────────────────────────────────────────────────────────────────

// GET /admin/affiliates — every affiliate with earnings summary.
export async function adminListAffiliates(_req: Request, res: Response) {
  try {
    const affiliates = await prisma.affiliate.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true, phone: true } } },
    });
    const settings = await getAffiliateSettings();
    const withTotals = await Promise.all(
      affiliates.map(async (a) => ({
        id: a.id,
        code: a.code,
        status: a.status,
        commissionPercent: a.commissionPercent ?? settings.defaultCommissionPercent,
        customRate: a.commissionPercent != null,
        payoutMethod: a.payoutMethod,
        payoutDetails: a.payoutDetails,
        createdAt: a.createdAt,
        user: a.user,
        totals: await commissionTotals(a.id),
      }))
    );
    return success(res, { affiliates: withTotals, settings });
  } catch (e) {
    console.error("adminListAffiliates error:", e);
    return error(res, "Failed to list affiliates");
  }
}

// PATCH /admin/affiliates/:id — approve/block + optionally set a custom rate.
// Approving ensures a coupon exists with the affiliate's code + buyer discount.
export async function adminUpdateAffiliate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const affiliate = await prisma.affiliate.findUnique({ where: { id } });
    if (!affiliate) return error(res, "Affiliate not found", 404);

    const data: any = {};
    if (req.body.status && ["PENDING", "APPROVED", "BLOCKED"].includes(req.body.status)) {
      data.status = req.body.status;
    }
    if (req.body.commissionPercent !== undefined) {
      const v = req.body.commissionPercent;
      if (v === null) data.commissionPercent = null;
      else {
        const n = Number(v);
        if (!Number.isFinite(n) || n < 0 || n > 100) return error(res, "Commission must be between 0 and 100", 400);
        data.commissionPercent = Math.round(n);
      }
    }

    const updated = await prisma.affiliate.update({ where: { id }, data });

    // On approval, make the referral code a live coupon (buyer discount).
    if (updated.status === "APPROVED") {
      const settings = await getAffiliateSettings();
      const farFuture = new Date("2099-12-31");
      await prisma.coupon.upsert({
        where: { code: updated.code },
        update: { active: true, discountPercent: settings.buyerDiscountPercent, validUntil: farFuture },
        create: {
          code: updated.code,
          discountPercent: settings.buyerDiscountPercent,
          maxUses: 0,
          validUntil: farFuture,
          active: true,
          applicablePlans: [],
        },
      });
    } else if (updated.status === "BLOCKED") {
      // Deactivate the coupon so a blocked affiliate's code stops working.
      await prisma.coupon.updateMany({ where: { code: updated.code }, data: { active: false } });
    }

    return success(res, { id: updated.id, status: updated.status }, "Affiliate updated");
  } catch (e) {
    console.error("adminUpdateAffiliate error:", e);
    return error(res, "Failed to update affiliate");
  }
}

// GET /admin/affiliates/:id/commissions — the ledger for one affiliate.
export async function adminAffiliateCommissions(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const commissions = await prisma.affiliateCommission.findMany({
      where: { affiliateId: id },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    const totals = await commissionTotals(id);
    return success(res, { commissions, totals });
  } catch (e) {
    console.error("adminAffiliateCommissions error:", e);
    return error(res, "Failed to load commissions");
  }
}

// POST /admin/affiliates/:id/mark-paid — mark all PENDING commissions as PAID
// (records a payout you've already sent via UPI/bank).
export async function adminMarkAffiliatePaid(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const result = await prisma.affiliateCommission.updateMany({
      where: { affiliateId: id, status: "PENDING" },
      data: { status: "PAID", paidAt: new Date() },
    });
    return success(res, { markedPaid: result.count }, `Marked ${result.count} commission(s) as paid`);
  } catch (e) {
    console.error("adminMarkAffiliatePaid error:", e);
    return error(res, "Failed to mark paid");
  }
}

// GET/PUT /admin/settings/affiliate — program defaults.
export async function getAffiliateSettingsAdmin(_req: Request, res: Response) {
  try {
    return success(res, await getAffiliateSettings());
  } catch (e) {
    console.error("getAffiliateSettingsAdmin error:", e);
    return error(res, "Failed to load settings");
  }
}

export async function updateAffiliateSettings(req: Request, res: Response) {
  try {
    const s = req.body?.settings;
    if (!s || typeof s !== "object") return error(res, "Invalid settings", 400);
    const pct = (v: any, fb: number) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0 && n <= 100 ? Math.round(n) : fb;
    };
    const clean = {
      enabled: Boolean(s.enabled),
      defaultCommissionPercent: pct(s.defaultCommissionPercent, DEFAULT_AFFILIATE_SETTINGS.defaultCommissionPercent),
      buyerDiscountPercent: pct(s.buyerDiscountPercent, DEFAULT_AFFILIATE_SETTINGS.buyerDiscountPercent),
      minPayoutRupees: Number(s.minPayoutRupees) >= 0 ? Math.round(Number(s.minPayoutRupees)) : DEFAULT_AFFILIATE_SETTINGS.minPayoutRupees,
    };
    await prisma.setting.upsert({
      where: { key: "affiliate_settings" },
      update: { value: JSON.stringify(clean) },
      create: { key: "affiliate_settings", value: JSON.stringify(clean) },
    });
    return success(res, clean, "Affiliate settings saved");
  } catch (e) {
    console.error("updateAffiliateSettings error:", e);
    return error(res, "Failed to save settings");
  }
}
