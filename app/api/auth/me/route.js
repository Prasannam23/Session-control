import { getSession } from "@auth0/nextjs-auth0"

export async function GET(req) {
  try {
    const session = await getSession()

    if (!session) {
      return Response.json({ error: "Not authenticated" }, { status: 401 })
    }

    return Response.json({
      name: session.user.name,
      email: session.user.email,
      sub: session.user.sub,
    })
  } catch (error) {
    return Response.json({ error: "Failed to get user" }, { status: 500 })
  }
}
