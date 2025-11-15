import { getSession } from "@auth0/nextjs-auth0";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(req, context) {
  try {
    
    const session = await getSession();

    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.sub;

    const sessionIds = await redis.zrange(`user_sess:${userId}`, 0, -1);
    const sessions = [];

    for (const sid of sessionIds) {
      const sess = await redis.get(`sess:${sid}`);
      if (sess && sess.status === "active") {
        sessions.push(sess);
      }
    }

    return Response.json({ sessions });
  } catch (error) {
    console.error("List sessions error:", error);
    return Response.json({ error: "Failed to list sessions" }, { status: 500 });
  }
}
