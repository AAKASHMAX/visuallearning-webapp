import { config } from "../config";

// Thin wrapper over the Telegram Bot API (https://core.telegram.org/bots/api).
// Uses Node's global fetch — no SDK needed.
const API = () => `https://api.telegram.org/bot${config.telegram.botToken}`;

async function tgCall(method: string, body: Record<string, any>): Promise<any> {
  if (!config.telegram.botToken) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const res = await fetch(`${API()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as any;
  if (!data.ok) throw new Error(`Telegram ${method} failed: ${data.description || res.status}`);
  return data.result;
}

// Send a message (HTML formatting) to any chat id — a channel (@username) or a user's numeric id.
export async function tgSend(chatId: string | number, text: string) {
  return tgCall("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

export function tgSendChannel(text: string) {
  return tgSend(config.telegram.channel, text);
}

// Register our webhook URL with Telegram so /start and replies reach the backend.
export async function tgSetWebhook(url: string, secretToken?: string) {
  const body: Record<string, any> = { url, allowed_updates: ["message"] };
  if (secretToken) body.secret_token = secretToken;
  return tgCall("setWebhook", body);
}

export function tgGetWebhookInfo() {
  return tgCall("getWebhookInfo", {});
}

export const telegramConfigured = () => Boolean(config.telegram.botToken);
