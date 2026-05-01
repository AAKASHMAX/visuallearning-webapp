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

// Proxy 100ms API calls through Vercel to avoid Render network issues
const HMS_PROXY_URL = config.frontendUrl + "/api/hms";
const HMS_API_SECRET = process.env.HMS_API_SECRET || "";

async function hmsProxy(body: object): Promise<any> {
  const response = await fetch(HMS_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-hms-api-secret": HMS_API_SECRET,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HMS proxy error (${response.status}): ${err}`);
  }

  return response.json();
}

export async function createRoom(name: string): Promise<string> {
  // Try proxy first (Vercel), fall back to direct call
  try {
    const data = await hmsProxy({ action: "create-room", roomName: name });
    return data.roomId;
  } catch (proxyErr: any) {
    console.error("[HMS] Proxy failed, trying direct:", proxyErr.message);
  }

  // Direct fallback
  const token = generateManagementToken();
  const response = await fetch("https://api.100ms.live/v2/rooms", {
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
  try {
    await hmsProxy({ action: "end-session", roomId });
  } catch (e: any) {
    console.error("[HMS] End session failed:", e.message);
  }
}

export async function disableRoom(roomId: string): Promise<void> {
  try {
    await hmsProxy({ action: "disable-room", roomId });
  } catch (e: any) {
    console.error("[HMS] Disable room failed:", e.message);
  }
}
