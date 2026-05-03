import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { createOrder, verifySignature } from "../services/razorpay";
import { success, error } from "../utils/apiResponse";
import { cacheGet, cacheSet } from "../utils/cache";

export const createOrderSchema = z.object({
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
  subjectsAccess: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.string().min(1),
  classesAccess: z.array(z.string()).optional(),
  subjectsAccess: z.array(z.string()).optional(),
  couponCode: z.string().optional(),
});

// Helper: get plan config from settings DB, fallback to hardcoded config
async function getPlanConfig(planKey: string): Promise<{ amount: number; duration: number; label: string; classSelection: number }> {
  // 1. Check Course table first for price updates from admin panel
  const course = await prisma.course.findFirst({ where: { planKey } });
  
  // 2. Get metadata from plans_config setting
  const setting = await prisma.setting.findUnique({ where: { key: "plans_config" } });
  let plans: Record<string, any> = {};
  if (setting) {
    plans = JSON.parse(setting.value);
  }

  const configFromSetting = plans[planKey];

  if (course) {
    return {
      amount: course.price * 100, // Course price is in Rs, convert to paise
      duration: configFromSetting?.duration || 365,
      label: course.name,
      classSelection: configFromSetting?.classSelection || 0
    };
  }

  // 3. Fallback to settings DB if no course record linked
  if (configFromSetting) {
    return configFromSetting;
  }
  
  // 4. Last fallback to hardcoded config
  const fallback = (config.plans as any)[planKey];
  return { 
    amount: fallback?.amount || 0, 
    duration: fallback?.duration || 365, 
    label: fallback?.label || planKey, 
    classSelection: 0 
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
    plansConfig = JSON.parse(setting.value);
  } else {
    // Fallback to hardcoded defaults
    plansConfig = {
      FOUNDATION_PASS: { amount: config.plans.FOUNDATION_PASS.amount, label: "Foundation Pass", duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      ACADEMIC_PLUS:   { amount: config.plans.ACADEMIC_PLUS.amount,   label: "Academic Plus",   duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      ELITE_LEARNING:  { amount: config.plans.ELITE_LEARNING.amount,  label: "Elite Learning",  duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
      FLEXI_PLAN:      { amount: config.plans.FLEXI_PLAN.amount,      label: "FlexiLearn",      duration: 365, enabled: true, classSelection: 0, billingCycle: "yearly" },
    };
  }

  // Also fetch courses to get live prices
  const courses = await prisma.course.findMany({ where: { planKey: { not: null } } });
  const coursePriceMap = new Map(courses.map(c => [c.planKey, c.price]));

  const featureMap: Record<string, string[]> = {
    FOUNDATION_PASS: ["Selected chapters (9–12 PCB)", "Animated concept videos", "Beginner-friendly path", "Progress tracking", "Mobile & desktop access"],
    ACADEMIC_PLUS:   ["Full Class 9–10 (PCB)", "Selected 11–12 Physics & Chemistry", "Chapter notes (PDF)", "MCQ quizzes + solutions", "Performance analytics", "Email support (24hr)"],
    ELITE_LEARNING:  ["Full 9–12 Physics + Chemistry + Biology", "64+ Virtual Labs", "3D Visual Learning", "Board exam practice", "Notes + formula sheets", "Priority WhatsApp support", "Deep concept tools"],
    CLASS_9:         ["Full 9th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
    CLASS_10:        ["Full 10th Grade Curriculum", "3D Animated Videos", "Virtual Labs & Simulations", "Board exam prep", "Chapter notes", "Expert support"],
    CLASS_11:        ["Full 11th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Competitive exam base", "Formula sheets", "Priority support"],
    CLASS_12:        ["Full 12th Grade Curriculum", "Advanced 3D Visuals", "Complex Simulations", "Board & Competitive prep", "Formula sheets", "Priority support"],
    FLEXI_PLAN:      ["Choose your own subjects", "3D Animated Videos", "Chapter notes (PDF)", "MCQ quizzes", "Flexible pricing per subject"],
  };

  const plans = Object.entries(plansConfig)
    .filter(([_, v]: [string, any]) => v.enabled)
    .map(([key, v]: [string, any]) => {
      const livePrice = coursePriceMap.get(key);
      return {
        id: key,
        name: v.label,
        price: livePrice !== undefined ? livePrice : v.amount / 100,
        duration: `${v.duration} days`,
        billingCycle: v.billingCycle || (v.duration <= 30 ? "monthly" : "yearly"),
        features: featureMap[key] || [],
        classSelection: v.classSelection || 0,
        popular: key === "ELITE_LEARNING",
      };
    });

  // Get upgrade discount
  const upgradeDiscountPercent = await getUpgradeDiscount();

  const result = { plans, classes, upgradeDiscountPercent };
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
    const { plan, classesAccess, couponCode } = req.body;
    const planConfig = await getPlanConfig(plan);

    // Validate classesAccess based on plan's classSelection setting
    if (planConfig.classSelection > 0) {
      if (!classesAccess || classesAccess.length !== planConfig.classSelection) {
        return error(res, `This plan requires exactly ${planConfig.classSelection} class(es)`, 400);
      }
    }

    let amount = planConfig.amount;
    const { subjectsAccess } = req.body;

    if (plan === "FLEXI_PLAN") {
      if (!subjectsAccess || subjectsAccess.length === 0) {
        return error(res, "Customized learning requires at least one subject", 400);
      }
      const subjects = await prisma.subject.findMany({
        where: { id: { in: subjectsAccess } },
        select: { price: true }
      });
      amount = subjects.reduce((sum, s) => sum + s.price, 0);
    }

    let couponDiscount = 0;
    let upgradeDiscount = 0;

    // Check for existing active subscription (upgrade flow)
    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });

    if (existing) {
      // Apply upgrade discount
      const upgradeDiscountPercent = await getUpgradeDiscount();
      if (upgradeDiscountPercent > 0) {
        upgradeDiscount = Math.round(amount * upgradeDiscountPercent / 100);
        amount -= upgradeDiscount;
      }
    }

    // Apply coupon if provided
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, plan);
      if (!couponResult.valid) return error(res, couponResult.message, 400);
      couponDiscount = Math.round(amount * couponResult.discountPercent / 100);
      amount -= couponDiscount;
    }

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
      originalAmount: planConfig.amount,
      upgradeDiscount,
      couponDiscount,
      isUpgrade: !!existing,
    });
  } catch (e: any) {
    console.error("Create order error:", e);
    const detail = e?.error?.description || e?.message || "Unknown error";
    return error(res, `Failed to create payment order: ${detail}`);
  }
}

export async function verifyPayment(req: Request, res: Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, classesAccess, couponCode } = req.body;

    const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return error(res, "Payment verification failed", 400);

    const planConfig = await getPlanConfig(plan);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.duration);

    // Calculate actual amount paid
    let amount = planConfig.amount;
    let discountAmount = 0;

    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user!.id, status: "ACTIVE", expiryDate: { gt: new Date() } },
    });

    if (existing) {
      const upgradeDiscountPercent = await getUpgradeDiscount();
      if (upgradeDiscountPercent > 0) {
        discountAmount += Math.round(amount * upgradeDiscountPercent / 100);
        amount -= Math.round(planConfig.amount * upgradeDiscountPercent / 100);
      }
    }

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

    if (amount < 100) amount = 100;

    const { subjectsAccess } = req.body;
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
      },
    });

    return success(res, subscription, "Payment verified and subscription activated");
  } catch (e) {
    console.error("Verify payment error:", e);
    return error(res, "Payment verification failed");
  }
}

export async function getMySubscription(req: Request, res: Response) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: req.user!.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { course: { select: { id: true, name: true, slug: true, accentColor: true, icon: true, planKey: true } } },
    });

    // Auto-expire and filter out if past expiry date
    const now = new Date();
    const activeSubs = [];

    for (const sub of subscriptions) {
      if (sub.expiryDate < now) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: "EXPIRED" },
        });
      } else {
        activeSubs.push(sub);
      }
    }

    return success(res, activeSubs);
  } catch (e) {
    console.error("Get subscription error:", e);
    return error(res, "Failed to fetch subscription");
  }
}
