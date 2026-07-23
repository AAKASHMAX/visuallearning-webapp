import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { createOrder, verifySignature } from "../services/razorpay";
import { getTrialConfig } from "../services/trial.service";
import { success, error } from "../utils/apiResponse";
import { cacheGet, cacheSet } from "../utils/cache";

export const createOrderSchema = z.object({
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
  subjectsAccess: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
  billingCycle: z.enum(["monthly", "quarterly", "yearly"]).default("yearly"),
  downloadAddon: z.boolean().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
  subjectsAccess: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
  billingCycle: z.enum(["monthly", "quarterly", "yearly"]).default("yearly"),
  downloadAddon: z.boolean().optional(),
});

// Class-count based plans. Fixed price; the user picks `classSelection` classes
// (Single = 1, Dual = 2) or all classes (Full = 0 -> empty classesAccess = all).
// Default prices below are editable from the admin Subscription Plans page.
const AUDIENCE_PLAN_DEFAULTS: Record<string, any> = {
  SINGLE_CLASS: {
    monthlyAmount: 19900,
    quarterlyAmount: 219900,
    yearlyAmount: 149900,
    label: "Single Class",
    durationMonthly: 30,
    durationQuarterly: 90,
    durationYearly: 365,
    enabled: true,
    classSelection: 1,
    unitType: "fixed",
  },
  DUAL_CLASS: {
    monthlyAmount: 34900,
    quarterlyAmount: 279900,
    yearlyAmount: 249900,
    label: "Dual Class",
    durationMonthly: 30,
    durationQuarterly: 90,
    durationYearly: 365,
    enabled: true,
    classSelection: 2,
    unitType: "fixed",
  },
  FULL_ACCESS: {
    monthlyAmount: 49900,
    quarterlyAmount: 399900,
    yearlyAmount: 349900,
    label: "Full Access",
    durationMonthly: 30,
    durationQuarterly: 90,
    durationYearly: 365,
    enabled: true,
    classSelection: 0,
    unitType: "fixed",
  },
};

function mergeAudiencePlanDefaults(plans: Record<string, any>) {
  return { ...AUDIENCE_PLAN_DEFAULTS, ...plans };
}

function isAudiencePlan(planKey: string) {
  return planKey === "SINGLE_CLASS" || planKey === "DUAL_CLASS" || planKey === "FULL_ACCESS";
}

function normalizeSubjectKeys(items: string[] = []) {
  const allowed = ["physics", "chemistry", "biology"];
  return Array.from(new Set(items.map((item) => item.toLowerCase()).filter((item) => allowed.includes(item))));
}

async function resolveProfessionalSubjectAccess(subjectKeys: string[]) {
  const keys = normalizeSubjectKeys(subjectKeys);
  if (keys.length === 0) return { subjectIds: [], classIds: [] };

  const subjects = await prisma.subject.findMany({
    where: {
      OR: keys.map((key) => ({ name: { contains: key, mode: "insensitive" } })),
      enabled: true,
    },
    select: { id: true, classId: true },
  });

  return {
    subjectIds: subjects.map((subject) => subject.id),
    classIds: Array.from(new Set(subjects.map((subject) => subject.classId))),
  };
}

// Helper: get plan config from settings DB, fallback to hardcoded config
async function getPlanConfig(planKey: string, billingCycle: "monthly" | "quarterly" | "yearly" = "yearly"): Promise<{ amount: number; duration: number; label: string; classSelection: number; unitType: "fixed" | "class" | "subject" }> {
  // Free trial: full content access for a short window, no document downloads.
  // Price/duration/label are admin-controlled (Settings -> Trial Plan).
  if (planKey === "TRIAL") {
    const t = await getTrialConfig();
    return { amount: 0, duration: t.durationDays, label: t.label, classSelection: 0, unitType: "fixed" };
  }
  // Pick the value for the requested billing cycle (quarterly falls back to ~3x monthly / 90 days).
  const pick = (m: number, q: number | undefined, y: number) => (billingCycle === "monthly" ? m : billingCycle === "quarterly" ? (q ?? m * 3) : y);
  // 1. Check Course table first for price updates from admin panel
  const course = await prisma.course.findFirst({ where: { planKey } });
  
  // 2. Get metadata from plans_config setting
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  let plans: Record<string, any> = {};
  if (setting) {
    plans = mergeAudiencePlanDefaults(JSON.parse(setting.value));
  } else {
    plans = mergeAudiencePlanDefaults({});
  }

  const configFromSetting = plans[planKey];

  if (course && !isAudiencePlan(planKey)) {
    // If course price exists, calculate monthly arbitrarily (price/10) if monthly is requested
    const basePrice = (course as any).price || 0;
    const amount = pick(Math.round(basePrice * 100 / 10), Math.round(basePrice * 100 / 4), basePrice * 100);
    return {
      amount,
      duration: pick(configFromSetting?.durationMonthly || 30, configFromSetting?.durationQuarterly || 90, configFromSetting?.durationYearly || 365),
      label: course.name,
      classSelection: configFromSetting?.classSelection || 0,
      unitType: configFromSetting?.unitType || "fixed",
    };
  }

  // 3. Fallback to settings DB if no course record linked
  if (configFromSetting) {
    return {
      amount: pick(configFromSetting.monthlyAmount, configFromSetting.quarterlyAmount, configFromSetting.yearlyAmount),
      duration: pick(configFromSetting.durationMonthly, configFromSetting.durationQuarterly || 90, configFromSetting.durationYearly),
      label: configFromSetting.label,
      classSelection: configFromSetting.classSelection || 0,
      unitType: configFromSetting.unitType || "fixed",
    };
  }
  
  // 4. Last fallback to hardcoded config
  const fallback = (config.plans as any)[planKey];
  return {
    amount: pick(fallback?.monthlyAmount || 0, fallback?.quarterlyAmount, fallback?.yearlyAmount || 0),
    duration: pick(fallback?.durationMonthly || 30, fallback?.durationQuarterly || 90, fallback?.durationYearly || 365),
    label: fallback?.label || planKey,
    classSelection: 0,
    unitType: "fixed",
  };
}

// Helper: get upgrade discount config
async function getUpgradeDiscount(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "subscription_settings" } });
  if (setting) {
    const config = JSON.parse(setting.value);
    return config.upgradeDiscountPercent || 0;
  }
  return 0;
}

// Helper: document-download add-on percentage (of the yearly price). Admin-editable.
async function getDownloadAddonPercent(): Promise<number> {
  const setting = await prisma.setting.findUnique({ where: { key: "subscription_settings" } });
  if (setting) {
    try {
      const c = JSON.parse(setting.value);
      if (typeof c.downloadAddonPercent === "number") return c.downloadAddonPercent;
    } catch { /* fall through */ }
  }
  return 50;
}

// Helper: validate and get coupon, optionally checking plan restriction
async function validateCoupon(code: string, planKey?: string): Promise<{ valid: boolean; discountPercent: number; message: string; applicablePlans: string[] }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon) return { valid: false, discountPercent: 0, message: "Invalid coupon code", applicablePlans: [] };
  if (!coupon.active) return { valid: false, discountPercent: 0, message: "This coupon is no longer active", applicablePlans: [] };
  const now = new Date();
  if (now < coupon.validFrom) return { valid: false, discountPercent: 0, message: "This coupon is not yet valid", applicablePlans: [] };
  if (now > coupon.validUntil) return { valid: false, discountPercent: 0, message: "This coupon has expired", applicablePlans: [] };
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { valid: false, discountPercent: 0, message: "This coupon has reached its usage limit", applicablePlans: [] };
  const plans = (coupon.applicablePlans as string[]) || [];
  if (planKey && plans.length > 0 && !plans.includes(planKey)) {
    return { valid: false, discountPercent: 0, message: "This coupon is not valid for the selected plan", applicablePlans: plans };
  }
  return { valid: true, discountPercent: coupon.discountPercent, message: "Coupon applied", applicablePlans: plans };
}

export async function getPlans(req: Request, res: Response) {
  const cached = cacheGet("plans");
  if (cached) return success(res, cached);

  const classes = await prisma.class.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } });

  // Get plans from settings
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  let plansConfig: Record<string, any> = {};
  if (setting) {
    plansConfig = mergeAudiencePlanDefaults(JSON.parse(setting.value));
  } else {
    // Fallback to hardcoded defaults
    plansConfig = mergeAudiencePlanDefaults({
      FOUNDATION_PASS: { monthlyAmount: config.plans.FOUNDATION_PASS.monthlyAmount, yearlyAmount: config.plans.FOUNDATION_PASS.yearlyAmount, label: "Foundation Pass", durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 0 },
      ACADEMIC_PLUS:   { monthlyAmount: config.plans.ACADEMIC_PLUS.monthlyAmount,   yearlyAmount: config.plans.ACADEMIC_PLUS.yearlyAmount,   label: "Academic Plus",   durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 0 },
      ELITE_LEARNING:  { monthlyAmount: config.plans.ELITE_LEARNING.monthlyAmount,  yearlyAmount: config.plans.ELITE_LEARNING.yearlyAmount,  label: "Elite Learning",  durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 0 },
      FLEXI_PLAN:      { monthlyAmount: config.plans.FLEXI_PLAN.monthlyAmount,      yearlyAmount: config.plans.FLEXI_PLAN.yearlyAmount,      label: "FlexiLearn",      durationMonthly: 30, durationYearly: 365, enabled: true, classSelection: 0 },
    });
  }

  // Also fetch courses to get live prices
  const courses = await prisma.course.findMany({ where: { planKey: { not: null } } });
  const coursePriceMap = new Map(courses.map(c => [c.planKey, (c as any).price]));

  const featureMap: Record<string, string[]> = {
    SINGLE_CLASS: ["Access any 1 class (9–12)", "3D animated videos", "Notes & NCERT solutions", "PYQs / Important questions", "Quizzes", "Mobile & desktop access"],
    DUAL_CLASS:   ["Access any 2 classes (9–12)", "3D animated videos", "Notes & NCERT solutions", "PYQs / Important questions", "Quizzes", "Mobile & desktop access"],
    FULL_ACCESS:  ["All 4 classes (9, 10, 11, 12)", "3D animated videos", "Notes & NCERT solutions", "PYQs / Important questions", "Quizzes", "Priority support"],
    FOUNDATION_PASS: ["Selected chapters (9–12 PCB)", "Animated concept videos", "Beginner-friendly path", "Progress tracking", "Mobile & desktop access"],
    ACADEMIC_PLUS:   ["Full Class 9–10 (PCB)", "Selected 11–12 Physics & Chemistry", "Chapter notes (PDF)", "MCQ quizzes + solutions", "Performance analytics", "Email support (24hr)"],
    ELITE_LEARNING:  ["Full 9–12 Physics + Chemistry + Biology", "64+ Virtual Labs", "3D Visual Learning", "Board exam practice", "Notes + formula sheets", "Priority WhatsApp support", "Deep concept tools"],
    CLASS_9:         ["Full 9th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
    CLASS_10:        ["Full 10th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
    CLASS_11:        ["Full 11th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Competitive exam base", "Formula sheets", "Priority support"],
    CLASS_12:        ["Full 12th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Board & Competitive prep", "Formula sheets", "Priority support"],
    FLEXI_PLAN:      ["Choose your own subjects", "3D Animated Videos", "Chapter notes (PDF)", "MCQ quizzes", "Flexible pricing per subject"],
    STUDENTS_PLAN:   ["Choose one or more classes", "Animated videos", "Chapter notes", "Quiz", "Question bank"],
    TEACHERS_PLAN:   ["Choose one or more classes", "Animated videos", "PPTs", "Test series", "Question bank"],
    PROFESSIONAL_PLAN: ["Choose one or more subjects", "Advanced animated videos", "PPTs", "Virtual lab", "Test series"],
  };

  const plans = Object.entries(plansConfig)
    .filter(([_, v]: [string, any]) => v.enabled)
    .map(([key, v]: [string, any]) => {
      const livePrice = coursePriceMap.get(key);
      return {
        id: key,
        name: v.label,
        monthlyPrice: livePrice !== undefined ? livePrice : ((v.monthlyAmount !== undefined ? v.monthlyAmount : (v.amount || 0) / 10) / 100),
        quarterlyPrice: livePrice !== undefined ? livePrice * 3 : ((v.quarterlyAmount !== undefined ? v.quarterlyAmount : (v.monthlyAmount || 0) * 3) / 100),
        yearlyPrice: livePrice !== undefined ? livePrice : ((v.yearlyAmount !== undefined ? v.yearlyAmount : (v.amount || 0)) / 100),
        durationMonthly: v.durationMonthly || 30,
        durationQuarterly: v.durationQuarterly || 90,
        durationYearly: v.durationYearly || 365,
        features: featureMap[key] || [],
        classSelection: v.classSelection || 0,
        unitType: v.unitType || "fixed",
        audience: v.audience || null,
        popular: key === "ELITE_LEARNING",
      };
    });

  // Get upgrade discount + document-download add-on percentage
  const upgradeDiscountPercent = await getUpgradeDiscount();
  const downloadAddonPercent = await getDownloadAddonPercent();

  const result = { plans, classes, upgradeDiscountPercent, downloadAddonPercent };
  cacheSet("plans", result, 60); // 1 min cache (reduced for live updates)
  return success(res, result);
}

// Validate coupon endpoint
export async function validateCouponCode(req: Request, res: Response) {
  try {
    const { code, plan } = req.query;
    if (!code || typeof code !== "string") return error(res, "Coupon code is required", 400);
    const planKey = typeof plan === "string" ? plan : undefined;
    const result = await validateCoupon(code, planKey);
    return success(res, result);
  } catch (e) {
    console.error("Validate coupon error:", e);
    return error(res, "Failed to validate coupon");
  }
}

export async function createSubscriptionOrder(req: Request, res: Response) {
  try {
    const { plan, classesAccess, subjectsAccess, couponCode, billingCycle = "yearly", downloadAddon } = req.body;
    const planConfig = await getPlanConfig(plan, billingCycle);

    // The trial is free and never goes through Razorpay — see startTrial().
    if (plan === "TRIAL") return error(res, "The free trial does not require payment", 400);

    // Validate classesAccess based on plan's classSelection setting
    if (planConfig.unitType === "fixed" && planConfig.classSelection > 0) {
      if (!classesAccess || classesAccess.length !== planConfig.classSelection) {
        return error(res, `This plan requires exactly ${planConfig.classSelection} class(es)`, 400);
      }
    }

    let amount = planConfig.amount;

    if (planConfig.unitType === "class") {
      if (!classesAccess || classesAccess.length === 0) {
        return error(res, "Select at least one class", 400);
      }

      const validClassCount = await prisma.class.count({ where: { id: { in: classesAccess } } });
      if (validClassCount !== classesAccess.length) {
        return error(res, "Invalid class selection", 400);
      }

      amount = planConfig.amount * classesAccess.length;
    }

    if (planConfig.unitType === "subject") {
      const selectedSubjectKeys = normalizeSubjectKeys(subjectsAccess || []);
      if (selectedSubjectKeys.length === 0) {
        return error(res, "Select at least one subject", 400);
      }

      amount = planConfig.amount * selectedSubjectKeys.length;
    }

    if (plan === "FLEXI_PLAN") {
      if (!subjectsAccess || subjectsAccess.length === 0) {
        return error(res, "Customized learning requires at least one subject", 400);
      }
      const subjects = await prisma.subject.findMany({
        where: { id: { in: subjectsAccess } },
        select: { price: true }
      });
      amount = subjects.reduce((sum, s) => sum + s.price * 100, 0); // Price is in Rs
      if (billingCycle === "monthly") {
        amount = Math.round(amount / 10);
      }
    }

    let couponDiscount = 0;
    // Upgrade discount removed: every user now starts on a free 3-day trial, so
    // an "existing active subscription" is no longer a meaningful upgrade signal
    // — it applied to everyone and halved every price.
    const upgradeDiscount = 0;

    const originalAmount = amount;

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, plan);
      if (!couponResult.valid) return error(res, couponResult.message, 400);
      couponDiscount = Math.round(amount * couponResult.discountPercent / 100);
      amount -= couponDiscount;
    }

    // Document-download add-on (yearly only) — added on top, after discounts.
    // Never available on the view-only Notes plan.
    let addOnAmount = 0;
    const wantAddon = downloadAddon === true && billingCycle === "yearly" && plan !== "TRIAL";
    if (wantAddon) {
      addOnAmount = Math.round(originalAmount * (await getDownloadAddonPercent()) / 100);
      amount += addOnAmount;
    }

    // The free trial is always ₹1 (Razorpay's minimum transaction fee).

    // Ensure minimum amount (Razorpay requires at least 100 paise = Rs 1)
    if (amount < 100) amount = 100;

    const receipt = `vl_${req.user!.id.slice(-8)}_${Date.now()}`;
    const order = await createOrder(amount, "INR", receipt);

    return success(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      classesAccess,
      subjectsAccess,
      couponCode,
      billingCycle,
      originalAmount,
      upgradeDiscount,
      couponDiscount,
      downloadAddon: wantAddon,
      addOnAmount,
      isUpgrade: false,
    });
  } catch (e: any) {
    console.error("Create order error:", e);
    const detail = e?.error?.description || e?.message || "Unknown error";
    return error(res, `Failed to create payment order: ${detail}`);
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, classesAccess, subjectsAccess, couponCode, billingCycle = "yearly", downloadAddon } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return error(res, "Payment verification failed", 400);

    // The trial is free and never goes through Razorpay — see startTrial().
    if (plan === "TRIAL") return error(res, "The free trial does not require payment", 400);

    const planConfig = await getPlanConfig(plan, billingCycle);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

    // Calculate actual amount paid
    let amount = planConfig.amount;
    let discountAmount = 0;

    if (planConfig.unitType === "class" && classesAccess && classesAccess.length > 0) {
      amount = planConfig.amount * classesAccess.length;
    }

    if (planConfig.unitType === "subject" && subjectsAccess && subjectsAccess.length > 0) {
      amount = planConfig.amount * normalizeSubjectKeys(subjectsAccess).length;
    }

    if (plan === "FLEXI_PLAN" && subjectsAccess && subjectsAccess.length > 0) {
      const subjects = await prisma.subject.findMany({
        where: { id: { in: subjectsAccess } },
        select: { price: true }
      });
      amount = subjects.reduce((sum, s) => sum + s.price * 100, 0);
      if (billingCycle === "monthly") {
        amount = Math.round(amount / 10);
      }
    }

    const baseAmount = amount; // yearly amount before discounts (for add-on calc)

    // Upgrade discount removed — see createSubscriptionOrder. Kept out of the
    // verify path too so the charged amount always matches the order amount.

    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, plan);
      if (couponResult.valid) {
        const couponDisc = Math.round(amount * couponResult.discountPercent / 100);
        discountAmount += couponDisc;
        amount -= couponDisc;

        // Increment coupon usage
        await prisma.coupon.update({
          where: { code: couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    // Document-download add-on (yearly only) — added on top, after discounts.
    // Never available on the free trial.
    const wantAddon = downloadAddon === true && billingCycle === "yearly" && plan !== "TRIAL";
    if (wantAddon) {
      amount += Math.round(baseAmount * (await getDownloadAddonPercent()) / 100);
    }

    if (amount < 100) amount = 100;


    let resolvedSubjectsAccess: string[] = [];
    let resolvedClassesAccess: string[] = [];

    if (plan === "FLEXI_PLAN") {
      resolvedSubjectsAccess = subjectsAccess || [];
      // Also resolve classes from subjects for easier filtering later
      const subjects = await prisma.subject.findMany({
        where: { id: { in: resolvedSubjectsAccess } },
        select: { classId: true }
      });
      resolvedClassesAccess = Array.from(new Set(subjects.map(s => s.classId)));
    } else if (planConfig.unitType === "subject") {
      const resolved = await resolveProfessionalSubjectAccess(subjectsAccess || []);
      resolvedSubjectsAccess = resolved.subjectIds;
      resolvedClassesAccess = resolved.classIds;
    } else if (planConfig.unitType === "class") {
      resolvedClassesAccess = classesAccess || [];
    } else if (planConfig.classSelection > 0) {
      resolvedClassesAccess = classesAccess || [];
    } else {
      const allClasses = await prisma.class.findMany({ select: { id: true } });
      resolvedClassesAccess = allClasses.map((c) => c.id);
    }

    // NOTE: We no longer auto-expire old subscriptions to allow multiple active plans (e.g. Class 9 + Elite)
    /*
    await prisma.subscription.updateMany({
      where: { userId: req.user!.id, status: "ACTIVE" },
      data: { status: "EXPIRED" },
    });
    */

    // Link subscription to course if plan has a matching course
    let courseId: string | null = null;
    if (plan !== "FLEXI_PLAN") {
      const course = await prisma.course.findUnique({ where: { planKey: plan } });
      if (course) courseId = course.id;
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        plan,
        courseId,
        classesAccess: resolvedClassesAccess,
        subjectsAccess: resolvedSubjectsAccess,
        expiryDate,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        razorpaySignature: razorpay_signature,
        status: "ACTIVE",
        amount,
        couponCode: couponCode ? couponCode.toUpperCase() : null,
        discountAmount,
        downloadAddon: wantAddon,
      },
    });

    return success(res, subscription, "Payment verified and subscription activated");
  } catch (e) {
    console.error("Verify payment error:", e);
    return error(res, "Payment verification failed");
  }
}

// GET /subscription/trial-status — can this user still claim the free trial?
// Eligible only if they've never had a trial AND have no active subscription.
// One trial per account, ever — including expired ones.
export async function getTrialStatus(req: Request, res: Response) {
  try {
    const trial = await getTrialConfig();
    const [usedTrial, activeSub] = await Promise.all([
      prisma.subscription.findFirst({ where: { userId: req.user!.id, plan: "TRIAL" }, select: { id: true } }),
      prisma.subscription.findFirst({
        where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
        select: { id: true },
      }),
    ]);
    return success(res, {
      enabled: trial.enabled,
      used: !!usedTrial,
      hasActive: !!activeSub,
      eligible: trial.enabled && !usedTrial && !activeSub,
      durationDays: trial.durationDays,
    });
  } catch (e) {
    console.error("Trial status error:", e);
    return error(res, "Failed to check trial status");
  }
}

// POST /subscription/start-trial — activate the free trial. No payment gateway
// involved: one click, one per account, all classes, no document downloads.
export async function startTrial(req: Request, res: Response) {
  try {
    const trial = await getTrialConfig();
    if (!trial.enabled) return error(res, "The free trial is not available right now", 400);

    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, OR: [{ plan: "TRIAL" }, { status: "ACTIVE", expiryDate: { gt: new Date() } }] },
    });
    if (existing) {
      return error(
        res,
        existing.plan === "TRIAL"
          ? "You have already used your free trial."
          : "You already have an active subscription.",
        400
      );
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + trial.durationDays);

    const allClasses = await prisma.class.findMany({ select: { id: true } });

    const subscription = await prisma.subscription.create({
      data: {
        userId: req.user!.id,
        plan: "TRIAL",
        classesAccess: allClasses.map((c) => c.id),
        expiryDate,
        status: "ACTIVE",
        amount: 0,
        discountAmount: 0,
        downloadAddon: false, // trials never include document downloads
      },
    });

    return success(res, subscription, `Your ${trial.durationDays}-day free trial is active`);
  } catch (e) {
    console.error("Start trial error:", e);
    return error(res, "Could not start your free trial");
  }
}

export async function getMySubscription(req: Request, res: Response) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      include: { course: { select: { id: true, name: true, slug: true, accentColor: true, icon: true, planKey: true } } },
    });

    return success(res, subscriptions);
  } catch (e) {
    console.error("Get subscription error:", e);
    return error(res, "Failed to fetch subscription");
  }
}
