import { Router, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { config } from "../config";
import { tgSend } from "../services/telegram";

const router = Router();

// Telegram calls this on every update (we only subscribe to "message").
// Secured by the secret token Telegram echoes back in this header.
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    if (config.telegram.webhookSecret) {
      const got = req.header("X-Telegram-Bot-Api-Secret-Token");
      if (got !== config.telegram.webhookSecret) return res.sendStatus(401);
    }

    const msg = req.body?.message;
    const chatId: number | undefined = msg?.chat?.id;
    const text: string = (msg?.text || "").trim();

    if (chatId && text.startsWith("/start")) {
      // Deep link is t.me/<bot>?start=<userId>; Telegram delivers "/start <userId>".
      const payload = text.split(/\s+/)[1];
      if (payload) {
        const user = await prisma.user.findUnique({ where: { id: payload } });
        if (user) {
          await prisma.user.update({ where: { id: user.id }, data: { telegramChatId: String(chatId) } });
          await tgSend(chatId, `✅ Connected, ${user.name.split(" ")[0]}! You'll now get updates, trial reminders and new-content alerts here.`);
        } else {
          await tgSend(chatId, "👋 Welcome to VisualLearning! Open the app and tap <b>Connect Telegram</b> to link your account.");
        }
      } else {
        await tgSend(chatId, "👋 Welcome to VisualLearning! Open the app and tap <b>Connect Telegram</b> to link your account so we can send you updates here.");
      }
    }

    // Always 200 quickly so Telegram doesn't retry.
    return res.sendStatus(200);
  } catch (e) {
    console.error("Telegram webhook error:", e);
    return res.sendStatus(200);
  }
});

export default router;
