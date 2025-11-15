import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export async function GET(req) {
  try {
    const cookies = req.cookies.get("app_session")
    const sessionId = cookies?.value

    console.log('Validate endpoint called. Cookies:', { cookiesHeader: req.headers.cookie, sessionId })

    if (!sessionId) {
      console.log('No app_session cookie found')
      return Response.json({ valid: false })
    }

    console.log('Looking up session in Redis:', sessionId)
    const session = await redis.get(`sess:${sessionId}`)

    if (!session) {
      console.log('Session not found in Redis:', sessionId)
      const response = Response.json({ valid: false })
      response.cookies.set("app_session", "", { maxAge: 0, path: "/" })
      return response
    }

    console.log('Session found:', { sessionId, status: session.status })

    if (session.status !== "active") {
      console.log('Session status is not active:', session.status)
      const response = Response.json({ valid: false, reason: "forced_out" })
      response.cookies.set("app_session", "", { maxAge: 0, path: "/" })
      return response
    }

 
    await redis.set(`sess:${sessionId}`, {
      ...session,
      lastSeen: Date.now(),
    })

    console.log('Session validated successfully. Returning valid:true')
    return Response.json({ valid: true, session })
  } catch (error) {
    console.error("Validate error:", error)
    return Response.json({ valid: false }, { status: 500 })
  }
}
