# Next.js Auth0 Device Session Limit Demo (N=3)

A production-ready Next.js application demonstrating server-side device session management using Auth0 and Redis (Upstash). Only 3 devices may be logged in concurrently per user.

## Features

- ✅ Auth0 authentication with @auth0/nextjs-auth0
- ✅ Redis (Upstash) authoritative session store
- ✅ Force logout on login when limit exceeded (409 conflict response)
- ✅ Graceful forced-logout UI with security guidance
- ✅ Phone number collection on first login
- ✅ Session management dashboard
- ✅ HttpOnly cookies (session ID only)
- ✅ Modern Tailwind CSS design
- ✅ Free tier deployment (Vercel + Upstash + Auth0)

## Architecture

- **Auth0**: Authentication provider + Hosted Login
- **Next.js App Router**: React frontend + API routes
- **Redis (Upstash)**: Authoritative session store
- **Vercel**: Hosting

### Data Model

**Session Record** (`sess:<sessionId>`)
\`\`\`json
{
  "sessionId": "uuid",
  "auth0Sub": "auth0|abc123",
  "name": "Full Name",
  "phone": "+1234567890",
  "deviceName": "Chrome on Windows",
  "userAgent": "user-agent header",
  "ip": "x.x.x.x",
  "createdAt": 1699999999999,
  "lastSeen": 1699999999999,
  "status": "active"
}
\`\`\`

**User Index** (`user_sess:<auth0Sub>`)
- Sorted Set of sessionIds, scored by createdAt timestamp

## Setup (Local Development)

### Prerequisites
- Node.js 18+
- Auth0 account (free tier)
- Upstash account (free tier)

### Step 1: Clone & Install

\`\`\`bash
git clone <repo-url>
cd project
npm install
\`\`\`

### Step 2: Create Auth0 Application

1. Go to [Auth0 Dashboard](https://manage.auth0.com)
2. Create a new "Regular Web Application"
3. Set **Allowed Callback URLs**:
   - `http://localhost:3000/api/auth/callback`
4. Set **Allowed Logout URLs**:
   - `http://localhost:3000`
5. Copy credentials

### Step 3: Create Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Copy `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`

### Step 4: Configure Environment

\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local`:
\`\`\`
NEXT_PUBLIC_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_CLIENT_SECRET=your_client_secret
AUTH0_COOKIE_SECRET=<use: openssl rand -hex 32>

UPSTASH_REDIS_URL=rediss://your-url
UPSTASH_REDIS_TOKEN=your-token
UPSTASH_TLS=true

MAX_DEVICES=3
\`\`\`

Generate `AUTH0_COOKIE_SECRET`:
\`\`\`bash
openssl rand -hex 32
\`\`\`

### Step 5: Run

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Deployment (Vercel)

### Step 1: Push to GitHub

\`\`\`bash
git add .
git commit -m "Initial commit: session limit demo"
git push origin main
\`\`\`

### Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click "New Project" and import your GitHub repo
3. Add Environment Variables (same as `.env.local`)
4. Click Deploy

### Step 3: Update Auth0

1. Add your Vercel URL to Auth0 **Allowed Callback URLs**:
   - `https://your-vercel-app.vercel.app/api/auth/callback`
2. Add to **Allowed Logout URLs**:
   - `https://your-vercel-app.vercel.app`

### Step 4: Verify

Visit your production URL and test the login flow.

## API Routes

### POST /api/auth/login
Redirect to Auth0 Hosted Login.

### GET /api/auth/callback
Auth0 callback handler.

### GET /api/auth/logout
Logout (clears Auth0 session).

### POST /api/sessions/create
Create a new server session after Auth0 login.

**Request:**
\`\`\`json
{
  "phone": "+1234567890",
  "deviceName": "Chrome on Windows",
  "forceLogoutSessionId": "uuid-optional"
}
\`\`\`

**Responses:**
- **201**: `{ "session": {...} }` - Session created
- **409**: `{ "message": "max_devices", "sessions": [...] }` - Limit exceeded
- **401**: Not authenticated

### POST /api/sessions/force
Force logout a session.

**Request:**
\`\`\`json
{
  "sessionId": "uuid"
}
\`\`\`

**Response:**
\`\`\`json
{
  "ok": true
}
\`\`\`

### GET /api/sessions/validate
Validate app_session cookie.

**Response:**
\`\`\`json
{
  "valid": true,
  "session": {...}
}
\`\`\`

or
\`\`\`json
{
  "valid": false,
  "reason": "forced_out"
}
\`\`\`

### GET /api/sessions/list
List all active sessions for current user.

**Response:**
\`\`\`json
{
  "sessions": [...]
}
\`\`\`

### POST /api/user/save-phone
Save phone number.

**Request:**
\`\`\`json
{
  "phone": "+1234567890"
}
\`\`\`

## Testing the 3→4 Device Flow

### Browser Testing (Manual)

1. **Login on 3 devices** (different browsers or incognito windows):
   - Device A: Open browser, click Login, complete Auth0
   - Device B: Repeat
   - Device C: Repeat
   - Verify each shows the private page

2. **Login on 4th device**:
   - Device D: Click Login, complete Auth0
   - You should see a modal listing all 3 active sessions
   - Choose one and click "Force Logout" (e.g., Device A)
   - Device D now has access
   - Device A: Refresh the page → see "You were logged out" overlay

3. **Verify forced logout**:
   - On Device A, click "Login Again"
   - Should redirect to login

### curl Testing

After getting app_session cookie:

\`\`\`bash
# Validate current session
curl -b "app_session=<sessionId>" https://your-app/api/sessions/validate

# List sessions
curl -b "app_session=<sessionId>" https://your-app/api/sessions/list

# Force logout a session (requires Auth0 session)
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "uuid"}' \
  -b "app_session=<sessionId>" \
  https://your-app/api/sessions/force
\`\`\`

## Security Notes

### Cookie Security
- `httpOnly: true` - Prevents JavaScript access
- `sameSite: 'lax'` - CSRF protection
- `secure: true` (production only) - HTTPS only
- 7-day TTL

### Session Validation
- Always validate `app_session` cookie server-side
- Check `sess:` record exists and `status === 'active'`
- Update `lastSeen` on each request
- Clear cookie if session is invalid or forced out

### Cross-user Protection
- All force logout operations verify `targetSession.auth0Sub === session.user.sub`
- Users cannot force logout another user's sessions

### Phone Storage
- Stored in Redis alongside session records
- Optional; validated with E.164 format
- For production persistence, integrate with Auth0 Management API or add a SQL DB

## Optional Improvements

- [ ] Add WebSocket real-time notifications for forced logout
- [ ] Device labeling UI (rename sessions)
- [ ] Audit log of login/logout events
- [ ] Atomic session creation with Redis Lua scripts
- [ ] Phone persistence to Auth0 user_metadata or database
- [ ] IP geolocation for session display

## Troubleshooting

### "Not authenticated" on /private
- Auth0 session missing or expired
- Clear cookies and login again

### 409 Conflict on login
- You already have 3 active sessions
- Choose one to force logout or cancel login

### "Session not found"
- Cookie was deleted or session expired (7 days)
- Login again

### Redis connection error
- Verify `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`
- Ensure `UPSTASH_TLS=true`

## License

MIT
