
This project adds a simple but powerful session-management layer on top of Auth0. It limits how many devices a user can be logged into at once and lets them force-logout older sessions when the limit is hit.


Auth0 handles authentication.  
Your app handles session tracking, enforcing device limits, and validating every request using Upstash Redis.  
Each login creates a small session in Redis and sets a secure `app_session` cookie. Every API route checks this cookie before doing anything.


A list/set of all active session IDs.

Stores:
- userId  
- createdAt  
- expiresAt  
- userAgent  
- ip  
- isActive  

Each session key has a TTL for automatic cleanup.


1. User logs in through Auth0.  
2. Auth0 redirects back with user info.  
3. App checks how many active sessions the user already has.  
4. If under the limit → create session → store in Redis → set cookie → continue.  
5. If limit reached → return:
```
{ "error": "limit_reached", "sessions": [...] }
```
6. Frontend shows a device-selection modal.


1. User picks a session to remove.  
2. Frontend calls `/api/sessions/revoke`.  
3. Server verifies ownership.  
4. Redis deletes the session.  
5. Login continues normally and a new session is created.


- /api/auth/login  
- /api/auth/callback  
- /api/sessions/create  
- /api/sessions/validate  
- /api/sessions/list  
- /api/sessions/revoke  
- /api/sessions/logout  

Common errors: limit_reached, invalid_session, session_revoked.


1. Read cookie  
2. Look up session in Redis  
3. If missing/expired → 401  
Fast and lightweight.


Stored per session:
- userAgent  
- IP  
- createdAt  
- lastSeen  

Displayed as:
```
Chrome on Windows — Active 2 min ago
```


- Sessions expire after SESSION_TTL_HOURS  
- Redis TTL handles cleanup automatically


- HttpOnly + Secure cookies  
- No long-term Auth0 token storage  
- Redis MULTI to avoid race conditions  
- Stateless and scale-friendly



```
AUTH0_SECRET=
AUTH0_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_ISSUER_BASE_URL=

REDIS_URL=
MAX_DEVICES=3
SESSION_TTL_HOURS=12
```



```
pnpm install
pnpm dev
```

Callback URL:
```
https://session-control-75by.vercel.app/api/auth/callback
```


Works smoothly on Vercel—just copy env variables and match Auth0 callback URLs.


- Next.js  
- TypeScript  
- Auth0 SDK  
- Upstash Redis  
- UUIDv7


