import { config } from "../config";

// Draft short marketing/notification copy with Claude Haiku 4.5. Single one-shot
// call over HTTPS (global fetch) — no SDK dependency. Cheap + fast for bulk copy.
const MODEL = "claude-haiku-4-5";

const AUDIENCE_NOTE: Record<string, string> = {
  channel:
    "This will be broadcast to our public Telegram channel (students who joined for free notes). Warm, exciting, community tone.",
  users:
    "This is a direct personal message to a registered student. Friendly, personal, second-person ('you').",
};

// Returns the drafted message text (Telegram HTML: <b>, <i>, <a>, emoji allowed).
export async function draftTelegramMessage(topic: string, audience: "channel" | "users"): Promise<string> {
  if (!config.anthropicApiKey) throw new Error("ANTHROPIC_API_KEY is not configured");

  const system =
    "You write short, engaging Telegram messages for VisualLearning — an Indian ed-tech platform teaching Class 9–12 (CBSE & State Boards) with 3D animated videos, notes, NCERT & PYQ solutions, and a 3-day ₹1 free trial. " +
    "Rules: keep it to 2–5 short lines; use a few relevant emoji; you may use Telegram HTML tags <b>, <i>, <a href> only (never Markdown); no salesy spam; end with a light call to action. Output ONLY the message text.";

  const user = `Audience: ${AUDIENCE_NOTE[audience]}\n\nWrite a Telegram message about:\n"${topic}"`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": config.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  const data = (await res.json()) as any;
  if (!res.ok) throw new Error(data?.error?.message || `Anthropic API error (${res.status})`);
  const text = (data.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("").trim();
  if (!text) throw new Error("AI returned an empty draft");
  return text;
}
