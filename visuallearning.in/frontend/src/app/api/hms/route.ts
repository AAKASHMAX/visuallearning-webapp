import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const HMS_ACCESS_KEY = process.env.HMS_ACCESS_KEY || "";
const HMS_SECRET = process.env.HMS_SECRET || "";
const HMS_TEMPLATE_ID = process.env.HMS_TEMPLATE_ID || "";
const HMS_API_SECRET = process.env.HMS_API_SECRET || "";

function generateManagementToken(): string {
  return jwt.sign(
    {
      access_key: HMS_ACCESS_KEY,
      type: "management",
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    },
    HMS_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "24h",
      jwtid: crypto.randomUUID(),
    }
  );
}

// POST /api/hms — proxy for 100ms API calls from backend
export async function POST(req: NextRequest) {
  try {
    // Verify the request is from our backend
    const secret = req.headers.get("x-hms-api-secret");
    if (!HMS_API_SECRET || secret !== HMS_API_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, roomId, roomName } = body;

    const token = generateManagementToken();

    if (action === "create-room") {
      const response = await fetch("https://api.100ms.live/v2/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: roomName.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 100),
          template_id: HMS_TEMPLATE_ID,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        console.error("100ms create room error:", err);
        return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
      }

      const data = await response.json();
      return NextResponse.json({ roomId: data.id });
    }

    if (action === "end-session" && roomId) {
      // End active session
      const sessionRes = await fetch(`https://api.100ms.live/v2/active-rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (sessionRes.ok) {
        await fetch(`https://api.100ms.live/v2/active-rooms/${roomId}/end-room`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: "Live class ended by teacher" }),
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "disable-room" && roomId) {
      await fetch(`https://api.100ms.live/v2/rooms/${roomId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled: false }),
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    console.error("HMS proxy error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
