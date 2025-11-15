import { getSession } from "@auth0/nextjs-auth0"
import { Redis } from "@upstash/redis"
import { generateUUID } from "@/lib/utils"

const redis = Redis.fromEnv()
const MAX_DEVICES = Number.parseInt(process.env.MAX_DEVICES || "3", 10)

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { phone, deviceName, forceLogoutSessionId } = body

    const auth0Sub = session.user.sub
    const userAgent = req.headers.get("user-agent") || "Unknown"
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "Unknown"

    const sessionIds = await redis.zrange(`user_sess:${auth0Sub}`, 0, -1)
    const activeSessions = []

    for (const sid of sessionIds) {
      const sess = await redis.get(`sess:${sid}`)
      if (sess && sess.status === "active") {
        activeSessions.push(sess)
      }
    }

    if (activeSessions.length >= MAX_DEVICES && !forceLogoutSessionId) {
      return Response.json(
        {
          message: "max_devices",
          sessions: activeSessions,
        },
        { status: 409 },
      )
    }

    // Force logout if requested
    if (forceLogoutSessionId) {
      const targetSession = await redis.get(`sess:${forceLogoutSessionId}`)
      if (targetSession && targetSession.auth0Sub === auth0Sub) {
        await redis.set(`sess:${forceLogoutSessionId}`, {
          ...targetSession,
          status: "forced_out",
        })
        await redis.zrem(`user_sess:${auth0Sub}`, forceLogoutSessionId)
      }
    }

    // Create new session
    const newSessionId = generateUUID()
    const now = Date.now()

    const newSession = {
      sessionId: newSessionId,
      auth0Sub,
      name: session.user.name || "",
      phone: phone || "",
      deviceName: deviceName || "Unknown Device",
      userAgent,
      ip,
      createdAt: now,
      lastSeen: now,
      status: "active",
    }

    // Store session
    await redis.set(`sess:${newSessionId}`, newSession, { ex: 604800 }) // 7 days
    await redis.zadd(`user_sess:${auth0Sub}`, { score: now, member: newSessionId })

    // Set cookie
    const response = Response.json({ session: newSession }, { status: 201 })

    response.cookies.set("app_session", newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Session create error:", error)
    return Response.json({ error: "Failed to create session" }, { status: 500 })
  }
}
