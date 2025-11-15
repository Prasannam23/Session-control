import { getSession } from "@auth0/nextjs-auth0";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Force Node runtime to avoid async cookies issues
export const runtime = 'nodejs';

const redis = Redis.fromEnv();
const MAX_DEVICES = Number(process.env.MAX_DEVICES || 3);

export async function POST(req) {
  try {
    // Get the Auth0 session that was just created
    const session = await getSession();

    if (!session) {
      console.log("No Auth0 session found");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const auth0Sub = session.user.sub;
    const sessionId = crypto.randomUUID();
    const userAgent = req.headers?.get("user-agent") || "Unknown";
    const ip = req.headers?.get("x-forwarded-for") || req.headers?.get("x-real-ip") || "Unknown";

    const now = Date.now();

    const newSession = {
      sessionId,
      auth0Sub,
      name: session.user.name || "",
      phone: "",
      deviceName: userAgent.split(" ")[0] || "Unknown Device",
      userAgent,
      ip,
      createdAt: now,
      lastSeen: now,
      status: "active",
    };

    // Store session and add to user's zset
    await redis.set(`sess:${sessionId}`, newSession, { ex: 604800 }); // 7 days
    await redis.zadd(`user_sess:${auth0Sub}`, { score: now, member: sessionId });

    // Enforce max devices
    const allSessions = await redis.zrange(`user_sess:${auth0Sub}`, 0, -1);
    if (allSessions.length > MAX_DEVICES) {
      const extra = allSessions.slice(0, allSessions.length - MAX_DEVICES);
      for (const sid of extra) {
        await redis.del(`sess:${sid}`);
        await redis.zrem(`user_sess:${auth0Sub}`, sid);
      }
    }

    console.log("App session created:", { sessionId, auth0Sub });

    // Create response with NextResponse so we can use .cookies.set()
    const response = NextResponse.json({ session: newSession }, { status: 201 });

    // Set app_session cookie
    response.cookies.set("app_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800, // 7 days in seconds
      path: "/",
    });

    console.log("app_session cookie set on response");
    return response;
  } catch (error) {
    console.error("Create app session error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}
