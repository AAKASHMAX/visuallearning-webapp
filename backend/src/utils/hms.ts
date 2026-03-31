import jwt from "jsonwebtoken";
import crypto from "crypto";
import https from "https";
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

// Use Node https module for more reliable connections from Render
function httpsRequest(url: string, method: string, headers: Record<string, string>, body?: string): Promise<{ status: number; data: string }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method,
      headers,
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve({ status: res.statusCode || 0, data }));
    });

    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout (30s)")); });
    req.on("error", (e) => reject(e));

    if (body) req.write(body);
    req.end();
  });
}

async function hmsRequest(url: string, method: string, body?: object, retries = 3): Promise<{ status: number; data: any }> {
  const token = generateManagementToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const bodyStr = body ? JSON.stringify(body) : undefined;

  for (let i = 0; i < retries; i++) {
    try {
      const res = await httpsRequest(url, method, headers, bodyStr);
      let parsed;
      try { parsed = JSON.parse(res.data); } catch { parsed = res.data; }
      return { status: res.status, data: parsed };
    } catch (e: any) {
      console.error(`[HMS] Attempt ${i + 1}/${retries} failed for ${method} ${url}:`, e.message);
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw new Error("All retries failed");
}

export async function createRoom(name: string): Promise<string> {
  const res = await hmsRequest("https://api.100ms.live/v2/rooms", "POST", {
    name: name.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100),
    template_id: config.hms.templateId,
  });

  if (res.status < 200 || res.status >= 300) {
    console.error("100ms create room error:", res.data);
    throw new Error("Failed to create 100ms room");
  }

  return res.data.id;
}

export async function endActiveSession(roomId: string): Promise<void> {
  try {
    const sessionRes = await hmsRequest(
      `https://api.100ms.live/v2/active-rooms/${roomId}`, "GET", undefined, 2
    );
    if (sessionRes.status === 200) {
      await hmsRequest(
        `https://api.100ms.live/v2/active-rooms/${roomId}/end-room`, "POST",
        { reason: "Live class ended by teacher" }, 2
      );
    }
  } catch (e) {
    console.error("[HMS] End session failed:", e);
  }
}

export async function disableRoom(roomId: string): Promise<void> {
  try {
    await hmsRequest(
      `https://api.100ms.live/v2/rooms/${roomId}`, "POST",
      { enabled: false }, 2
    );
  } catch (e) {
    console.error("[HMS] Disable room failed:", e);
  }
}
