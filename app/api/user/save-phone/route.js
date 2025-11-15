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
    const { phone } = body

    if (!phone) {
      return Response.json({ error: "Phone required" }, { status: 400 })
    }

    const auth0Sub = session.user.sub

   
    await redis.set(`profile:${auth0Sub}`, {
      name: session.user.name,
      phone,
    })

    
    const sessionIds = await redis.zrange(`user_sess:${auth0Sub}`, 0, -1)
    for (const sid of sessionIds) {
      const sess = await redis.get(`sess:${sid}`)
      if (sess) {
        await redis.set(`sess:${sid}`, { ...sess, phone })
      }
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error("Save phone error:", error)
    return Response.json({ error: "Failed to save phone" }, { status: 500 })
  }
}
