import { getSession } from "@auth0/nextjs-auth0"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function POST(req) {
  try {
    const session = await getSession()
    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return Response.json({ error: "Missing sessionId" }, { status: 400 })
    }

    const targetSession = await redis.get(`sess:${sessionId}`)

    if (!targetSession) {
      return Response.json({ error: "Session not found" }, { status: 404 })
    }

    if (targetSession.auth0Sub !== session.user.sub) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    await redis.set(`sess:${sessionId}`, {
      ...targetSession,
      status: "forced_out",
    })

    await redis.zrem(`user_sess:${session.user.sub}`, sessionId)

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Force logout error:", error)
    return Response.json({ error: "Failed to force logout" }, { status: 500 })
  }
}
