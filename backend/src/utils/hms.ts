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

export async function createRoom(name: string): Promise<string> {
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
  const token = generateManagementToken();

  // First get the active session
  const sessionRes = await fetch(`https://api.100ms.live/v2/active-rooms/${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (sessionRes.ok) {
    // End the active session - this kicks all peers and triggers ROOM_ENDED notification
    await fetch(`https://api.100ms.live/v2/active-rooms/${roomId}/end-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reason: "Live class ended by teacher" }),
    });
  }
}

export async function disableRoom(roomId: string): Promise<void> {
  const token = generateManagementToken();

  await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ enabled: false }),
  });
}
