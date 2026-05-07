import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config";
import { AuthRequest } from "../middleware/auth";
import { ensureDefaultPlans, getAccessibleCoursesForUser, getEffectivePlanPrice, getPlanByCode, isFreeOfferActive } from "../services/plan.service";

const prisma = new PrismaClient();
const publicPlanCache = new Map<string, { data: any; expiry: number }>();

function getCached(key: string) {
  const item = publicPlanCache.get(key);
  if (item && item.expiry > Date.now()) return item.data;
  publicPlanCache.delete(key);
  return null;
}

function setCached(key: string, data: any, ttlMs = 60000) {
  publicPlanCache.set(key, { data, expiry: Date.now() + ttlMs });
}

export function clearSubscriptionPlanCache() {
  publicPlanCache.clear();
}

function getBillingCycle(plan: { code: string; durationDays: number }) {
  return plan.code.endsWith("_YEARLY") || plan.durationDays >= 365 ? "yearly" : "monthly";
}

function getBasePlanCode(code: string) {
  return code.replace(/_YEARLY$/, "").replace(/_MONTHLY$/, "");
}

function formatPlan(plan: any) {
  const effectivePrice = getEffectivePlanPrice(plan);
  return {
    id: plan.code,
    code: plan.code,
    baseCode: getBasePlanCode(plan.code),
    billingCycle: getBillingCycle(plan),
    name: plan.name,
    description: plan.description,
    price: effectivePrice,
    originalPrice: plan.price,
    durationDays: plan.durationDays,
    features: plan.features,
    freeOfferEnabled: plan.freeOfferEnabled,
    freeOfferUntil: plan.freeOfferUntil,
    isFreeOfferActive: isFreeOfferActive(plan),
    courses: plan.courses?.map((item: any) => item.course) || [],
  };
}

function normalizePlanParam(value: string) {
  return value.trim().toUpperCase().replace(/-/g, "_").replace(/_MONTHLY$/, "").replace(/_YEARLY$/, "");
}

function formatCourseChapters(course: any) {
  const linkedChapters = (course.courseChapters || []).map((link: any) => ({
    ...link.chapter,
    displayOrder: link.order,
  }));
  const linkedIds = new Set(linkedChapters.map((chapter: any) => chapter.id));
  const legacyChapters = (course.chapters || []).filter((chapter: any) => !linkedIds.has(chapter.id));
  const chapters = [...linkedChapters, ...legacyChapters].sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const { courseChapters, ...rest } = course;
  return { ...rest, chapters };
}

function getRazorpayClient() {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  });
}

function isCouponUsable(coupon: any, planCode: string) {
  const now = new Date();
  return Boolean(
    coupon &&
    coupon.isActive &&
    coupon.usedCount < coupon.maxUses &&
    now >= coupon.validFrom &&
    now <= coupon.validUntil &&
    (coupon.applicablePlans.length === 0 || coupon.applicablePlans.includes(planCode))
  );
}

function getRazorpayErrorMessage(error: any) {
  return error?.error?.description || error?.description || error?.message || "Razorpay rejected the order request";
}

export async function getPlans(req: AuthRequest, res: Response) {
  try {
    const cacheKey = "subscription_plans_public";
    const cached = getCached(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.json(cached);
    }

    let plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true, code: { not: "FREE" } },
      orderBy: { displayOrder: "asc" },
      include: { courses: { include: { course: { select: { id: true, name: true, tier: true } } } } },
    });

    if (plans.length === 0) {
      await ensureDefaultPlans(prisma);
      plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true, code: { not: "FREE" } },
        orderBy: { displayOrder: "asc" },
        include: { courses: { include: { course: { select: { id: true, name: true, tier: true } } } } },
      });
    }

    const response = plans.map(formatPlan);

    setCached(cacheKey, response);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

export async function getPlanDetails(req: AuthRequest, res: Response) {
  try {
    const baseCode = normalizePlanParam(req.params.code);
    if (baseCode === "FREE") {
      return res.status(404).json({ message: "Plan not found" });
    }
    const cacheKey = `subscription_plan_details_${baseCode}`;
    const cached = getCached(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.json(cached);
    }

    const planCodes = [baseCode, `${baseCode}_MONTHLY`, `${baseCode}_YEARLY`];

    let variants = await prisma.subscriptionPlan.findMany({
      where: { code: { in: planCodes }, isActive: true },
      orderBy: { durationDays: "asc" },
      include: { courses: { select: { courseId: true } } },
    });

    if (variants.length === 0) {
      await ensureDefaultPlans(prisma);
      variants = await prisma.subscriptionPlan.findMany({
        where: { code: { in: planCodes }, isActive: true },
        orderBy: { durationDays: "asc" },
        include: { courses: { select: { courseId: true } } },
      });
    }

    if (variants.length === 0) {
      const allPlans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true, code: { not: "FREE" } },
        orderBy: { durationDays: "asc" },
        include: { courses: { select: { courseId: true } } },
      });
      variants = allPlans.filter((plan) => normalizePlanParam(plan.code) === baseCode);
    }

    if (variants.length === 0) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const primary = variants.find((plan) => plan.code === baseCode || plan.code === `${baseCode}_MONTHLY`) || variants[0];
    const courseIds = Array.from(new Set(variants.flatMap((plan) => plan.courses.map((item) => item.courseId))));

    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds }, isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        chapters: {
          orderBy: { displayOrder: "asc" },
          include: { _count: { select: { videos: true, notes: true, questions: true } } },
        },
        courseChapters: {
          orderBy: { order: "asc" },
          include: {
            chapter: {
              include: { _count: { select: { videos: true, notes: true, questions: true } } },
            },
          },
        },
      },
    });

    const response = {
      code: baseCode,
      name: primary.name,
      description: primary.description,
      features: primary.features,
      previewVideoUrl: courses.find((course: any) => course.vimeoVideoId)?.vimeoVideoId || null,
      variants: variants.map((plan) => ({
        code: plan.code,
        billingCycle: getBillingCycle(plan),
        price: getEffectivePlanPrice(plan),
        originalPrice: plan.price,
        durationDays: plan.durationDays,
        freeOfferEnabled: plan.freeOfferEnabled,
        freeOfferUntil: plan.freeOfferUntil,
        isFreeOfferActive: isFreeOfferActive(plan),
      })),
      courses: courses.map(formatCourseChapters),
    };

    setCached(cacheKey, response);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plan details" });
  }
}

export function getPaymentConfig(req: AuthRequest, res: Response) {
  res.json({
    keyId: config.razorpay.keyId,
    configured: Boolean(config.razorpay.keyId && config.razorpay.keySecret),
  });
}

export async function validateCoupon(req: AuthRequest, res: Response) {
  try {
    const { code, plan } = req.query;
    if (!code) return res.status(400).json({ message: "Coupon code required" });

    const coupon = await prisma.coupon.findUnique({ where: { code: code as string } });

    if (!coupon || !coupon.isActive) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }
    if (coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
    if (new Date() < coupon.validFrom || new Date() > coupon.validUntil) {
      return res.status(400).json({ message: "Coupon has expired" });
    }
    if (coupon.applicablePlans.length > 0 && plan && !coupon.applicablePlans.includes(plan as string)) {
      return res.status(400).json({ message: "Coupon not applicable for this plan" });
    }

    res.json({ discountPercent: coupon.discountPercent, code: coupon.code });
  } catch (error) {
    res.status(500).json({ message: "Failed to validate coupon" });
  }
}

export async function getMySubscription(req: AuthRequest, res: Response) {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user!.id },
    });

    if (!subscription) {
      return res.json(null);
    }

    // Check expiry
    if (subscription.expiryDate < new Date() && subscription.status === "ACTIVE") {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: "EXPIRED" },
      });
      return res.json({ ...subscription, status: "EXPIRED" });
    }

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
}

export async function getMyCourses(req: AuthRequest, res: Response) {
  try {
    const courses = await getAccessibleCoursesForUser(prisma, req.user!.id);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch course access" });
  }
}

export async function createOrder(req: AuthRequest, res: Response) {
  try {
    const { plan, couponCode } = req.body;
    const razorpay = getRazorpayClient();

    if (!razorpay) {
      return res.status(503).json({ message: "Payment gateway is not configured" });
    }

    const planConfig = plan ? await getPlanByCode(prisma, plan) : null;
    if (!plan || !planConfig) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    let amount = getEffectivePlanPrice(planConfig);

    // Apply coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!isCouponUsable(coupon, plan)) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      amount = Math.round(amount * (1 - coupon!.discountPercent / 100));
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "This plan is currently free. Use free activation." });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // in paise
      currency: "INR",
      receipt: `phy_${Date.now()}_${req.user!.id.slice(-6)}`,
      notes: {
        userId: req.user!.id,
        plan: planConfig.code,
      },
    });

    res.json({
      orderId: order.id,
      amount: amount,
      currency: "INR",
      plan: planConfig.code,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(502).json({ message: getRazorpayErrorMessage(error) });
  }
}

export async function verifyPayment(req: AuthRequest, res: Response) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan, couponCode } = req.body;

    if (!config.razorpay.keySecret) {
      return res.status(503).json({ message: "Payment gateway is not configured" });
    }

    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", config.razorpay.keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const planConfig = await getPlanByCode(prisma, plan);
    if (!planConfig) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const effectivePrice = getEffectivePlanPrice(planConfig);
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!isCouponUsable(coupon, plan)) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      discountAmount = Math.round(effectivePrice * coupon!.discountPercent / 100);
      await prisma.coupon.update({
        where: { id: coupon!.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + planConfig.durationDays);

    // Create or update subscription
    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user!.id },
      update: {
        plan: planConfig.code,
        status: "ACTIVE",
        startDate: new Date(),
        expiryDate,
        razorpayOrderId,
        razorpayPaymentId,
        couponCode,
        discountAmount,
        amount: effectivePrice - discountAmount,
      },
      create: {
        userId: req.user!.id,
        plan: planConfig.code,
        status: "ACTIVE",
        expiryDate,
        razorpayOrderId,
        razorpayPaymentId,
        couponCode,
        discountAmount,
        amount: effectivePrice - discountAmount,
      },
    });

    res.json({ message: "Payment verified, subscription activated", subscription });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
}

export async function activateFreePlan(req: AuthRequest, res: Response) {
  try {
    const { plan, couponCode } = req.body;
    const planConfig = plan ? await getPlanByCode(prisma, plan) : null;
    if (!plan || !planConfig || !planConfig.isActive) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const effectivePrice = getEffectivePlanPrice(planConfig);
    let discountAmount = 0;
    let coupon = null;

    if (couponCode && effectivePrice > 0) {
      coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!isCouponUsable(coupon, planConfig.code)) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      discountAmount = Math.round(effectivePrice * coupon!.discountPercent / 100);
    }

    if (effectivePrice - discountAmount > 0) {
      return res.status(400).json({ message: "This plan is not free right now" });
    }

    if (coupon) {
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + (planConfig.durationDays || 30));

    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user!.id },
      update: {
        plan: planConfig.code,
        status: "ACTIVE",
        startDate: new Date(),
        expiryDate,
        couponCode: coupon?.code || null,
        discountAmount,
        amount: 0,
      },
      create: {
        userId: req.user!.id,
        plan: planConfig.code,
        status: "ACTIVE",
        expiryDate,
        couponCode: coupon?.code || null,
        discountAmount,
        amount: 0,
      },
    });

    res.json({ message: "Free access activated", subscription });
  } catch (error) {
    res.status(500).json({ message: "Failed to activate free access" });
  }
}
