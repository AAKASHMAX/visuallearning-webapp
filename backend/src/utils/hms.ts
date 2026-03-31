import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config";

function generateManagementToken(): string {
  return jwt.sign(
    {
      access_key: config.hms.accessKey,
      type: "management",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    config.hms.secret,
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: crypto.randomUUID(),
    }
  );
}

export function generateAuthToken(roomId: string, userId: string, role: "host" | "guest"): string {
  return jwt.sign(
    {
      access_key: config.hms.accessKey,
      room_id: roomId,
      user_id: userId,
      role,
      type: "app",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    config.hms.secret,
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: crypto.randomUUID(),
    }
  );
}

// Helper: fetch with timeout and retry
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return response;
    } catch (e: any) {
      console.error(`[HMS] Fetch attempt ${i + 1}/${retries} failed:`, e.message || e);
      if (i === retries - 1) throw e;
      // Wait before retry
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw new Error("All fetch retries failed");
}

export async function createRoom(name: string): Promise<string> {
  const token = generateManagementToken();

  const response = await fetchWithRetry("https://api.100ms.live/v2/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100),
      template_id: config.hms.templateId,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("100ms create room error:", err);
    throw new Error("Failed to create 100ms room");
  }

  const data = await response.json() as { id: string };
  return data.id;
}

export async function endActiveSession(roomId: string): Promise<void> {
  const token = generateManagementToken();

  try {
    const sessionRes = await fetchWithRetry(`https://api.100ms.live/v2/active-rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }, 2);

    if (sessionRes.ok) {
      await fetchWithRetry(`https://api.100ms.live/v2/active-rooms/${roomId}/end-room`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: "Live class ended by teacher" }),
      }, 2);
    }
  } catch (e) {
    console.error("[HMS] End session failed:", e);
  }
}

export async function disableRoom(roomId: string): Promise<void> {
  const token = generateManagementToken();

  try {
    await fetchWithRetry(`https://api.100ms.live/v2/rooms/${roomId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ enabled: false }),
    }, 2);
  } catch (e) {
    console.error("[HMS] Disable room failed:", e);
  }
}
