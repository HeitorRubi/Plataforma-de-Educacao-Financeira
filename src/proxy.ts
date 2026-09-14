import { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

function createContentSecurityPolicy(nonce: string, isHttps: boolean) {
  const developmentScriptPolicy =
    process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  const upgradeInsecureRequests = isHttps ? " upgrade-insecure-requests;" : "";

  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScriptPolicy};
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self' https://*.supabase.co wss://*.supabase.co;
    media-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'none';
    manifest-src 'self';
    worker-src 'self' blob:;${upgradeInsecureRequests}
  `
    .replace(/\s{2,}/g, " ")
    .trim();
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const forwardedProtocol = request.headers.get("x-forwarded-proto");
  const isHttps =
    request.nextUrl.protocol === "https:" || forwardedProtocol === "https";
  const contentSecurityPolicy = createContentSecurityPolicy(nonce, isHttps);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  const requestWithSecurityHeaders = new NextRequest(request, {
    headers: requestHeaders,
  });
  const response = await updateSession(requestWithSecurityHeaders);

  response.headers.set("Content-Security-Policy", contentSecurityPolicy);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
