import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import Razorpay from "razorpay";
import crypto from "crypto";
import { config } from "../config";
import { AuthRequest } from "../middleware/auth";
import { ensureDefaultPlans, getAccessibleCoursesForUser, getPlanByCode } from "../services/plan.service";

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
  return code.replace(/_YEARLY$/, "");
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

export async function getPlans(req: AuthRequest, res: Response) {
  try {
    const cacheKey = "subscription_plans_public";
    const cached = getCached(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.json(cached);
    }

    let plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: { courses: { include: { course: { select: { id: true, name: true, tier: true } } } } },
    });

    if (plans.length === 0) {
      await ensureDefaultPlans(prisma);
      plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
        include: { courses: { include: { course: { select: { id: true, name: true, tier: true } } } } },
      });
    }

    const response = plans.map((plan) => ({
      id: plan.code,
      code: plan.code,
      baseCode: getBasePlanCode(plan.code),
      billingCycle: getBillingCycle(plan),
      name: plan.name,
      description: plan.description,
      price: plan.price,
      durationDays: plan.durationDays,
      features: plan.features,
      courses: plan.courses.map((item) => item.course),
    }));

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
    const cacheKey = `subscription_plan_details_${baseCode}`;
    const cached = getCached(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
      return res.json(cached);
    }

    const planCodes = [baseCode, `${baseCode}_YEARLY`];

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
      return res.status(404).json({ message: "Plan not found" });
    }

    const primary = variants.find((plan) => plan.code === baseCode) || variants[0];
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
        price: plan.price,
        durationDays: plan.durationDays,
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
      return res.json({ plan: "FREE", status: "ACTIVE" });
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

    let amount = planConfig.price;

    // Apply coupon
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!isCouponUsable(coupon, plan)) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      amount = Math.round(amount * (1 - coupon!.discountPercent / 100));
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `phy_${req.user!.id}_${Date.now()}`,
    });

    res.json({
      orderId: order.id,
      amount: amount,
      currency: "INR",
      plan,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
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

    let discountAmount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } });
      if (!isCouponUsable(coupon, plan)) {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
      discountAmount = Math.round(planConfig.price * coupon!.discountPercent / 100);
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
        plan,
        status: "ACTIVE",
        startDate: new Date(),
        expiryDate,
        razorpayOrderId,
        razorpayPaymentId,
        couponCode,
        discountAmount,
        amount: planConfig.price - discountAmount,
      },
      create: {
        userId: req.user!.id,
        plan,
        status: "ACTIVE",
        expiryDate,
        razorpayOrderId,
        razorpayPaymentId,
        couponCode,
        discountAmount,
        amount: planConfig.price - discountAmount,
      },
    });

    res.json({ message: "Payment verified, subscription activated", subscription });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Failed to verify payment" });
  }
}
