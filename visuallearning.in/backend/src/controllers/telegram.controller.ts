import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { success, error } from "../utils/apiResponse";
import { draftTelegramMessage } from "../services/ai-draft";
import { tgSend, tgSendChannel, tgSetWebhook, tgGetWebhookInfo, telegramConfigured } from "../services/telegram";

export const draftSchema = z.object({
  topic: z.string().min(3).max(500),
  audience: z.enum(["channel", "users"]),
});

export const sendSchema = z.object({
  text: z.string().min(1).max(4000),
  audience: z.enum(["channel", "users"]),
});

// GET /admin/telegram/status
export async function getTelegramStatus(_req: Request, res: Response) {
  try {
    const connectedUsers = await prisma.user.count({ where: { telegramChatId: { not: null } } });
    let webhookUrl: string | null = null;
    if (telegramConfigured()) {
      try { webhookUrl = (await tgGetWebhookInfo())?.url || null; } catch { /* ignore */ }
    }
    return success(res, {
      configured: telegramConfigured(),
      channel: config.telegram.channel,
      connectedUsers,
      webhookUrl,
      canAutoRegister: Boolean(config.telegram.publicUrl),
    });
  } catch (e) {
    console.error("Telegram status error:", e);
    return error(res, "Failed to load Telegram status");
  }
}

// POST /admin/telegram/register-webhook — self-registers using this backend's own URL.
export async function registerWebhook(_req: Request, res: Response) {
  try {
    if (!telegramConfigured()) return error(res, "Set TELEGRAM_BOT_TOKEN first", 400);
    const base = config.telegram.publicUrl;
    if (!base) return error(res, "Can't determine backend URL. Set PUBLIC_API_URL env to https://your-api.onrender.com", 400);
    const url = `${base.replace(/\/+$/, "")}/api/telegram/webhook`;
    await tgSetWebhook(url, config.telegram.webhookSecret);
    return success(res, { url }, "Webhook registered");
  } catch (e: any) {
    console.error("Telegram register-webhook error:", e);
    return error(res, e.message || "Failed to register webhook", 502);
  }
}

// POST /admin/telegram/draft — AI-writes a message the admin can edit before sending.
export async function draftTelegram(req: Request, res: Response) {
  try {
    const { topic, audience } = req.body;
    const draft = await draftTelegramMessage(topic, audience);
    return success(res, { draft });
  } catch (e: any) {
    console.error("Telegram draft error:", e);
    return error(res, e.message || "Failed to draft message", 502);
  }
}

// POST /admin/telegram/send — post to the channel, or DM every connected user.
export async function sendTelegram(req: Request, res: Response) {
  try {
    if (!telegramConfigured()) return error(res, "Telegram bot is not configured", 400);
    const { text, audience } = req.body;

    if (audience === "channel") {
      await tgSendChannel(text);
      return success(res, { sent: 1, target: "channel" }, "Posted to channel");
    }

    // audience === "users": DM everyone who has connected their Telegram.
    const users = await prisma.user.findMany({
      where: { telegramChatId: { not: null }, blocked: false },
      select: { telegramChatId: true },
    });
    let sent = 0;
    let failed = 0;
    for (const u of users) {
      try {
        await tgSend(u.telegramChatId!, text);
        sent++;
        // Telegram allows ~30 msgs/sec to different users; small gap stays well under.
        await new Promise((r) => setTimeout(r, 40));
      } catch {
        failed++; // user blocked the bot, etc. — skip.
      }
    }
    return success(res, { sent, failed, target: "users" }, `Sent to ${sent} user(s)`);
  } catch (e: any) {
    console.error("Telegram send error:", e);
    return error(res, e.message || "Failed to send message", 502);
  }
}
