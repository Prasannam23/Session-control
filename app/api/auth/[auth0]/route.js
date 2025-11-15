import { handleAuth } from "@auth0/nextjs-auth0";

// Force Node runtime for this dynamic auth route
export const runtime = 'nodejs';

export const GET = handleAuth();
