import net from "node:net";
import {
  checkInMemoryRateLimit,
  checkSharedRateLimit,
  hashClientIp,
  resetInMemoryRateLimits,
} from "@narendra/supabase";
import type { RateLimitResult } from "@narendra/types";

export {
  checkInMemoryRateLimit,
  checkSharedRateLimit,
  hashClientIp,
  resetInMemoryRateLimits,
  type RateLimitResult,
};

/**
 * ============================================================================
 * Narendra Software — Client IP & Proxy Trust Architecture
 * ============================================================================
 *
 * Trust Model:
 * 1. VERCEL EDGE GATEWAY:
 *    - In Vercel serverless environments (`VERCEL=1`), incoming requests pass through
 *      Vercel's global edge infrastructure.
 *    - The edge proxy injects `x-vercel-ip` containing the verified TCP remote client IP.
 *    - Inbound `x-vercel-ip` headers supplied by external clients are stripped and
 *      overwritten by Vercel edge before invoking Next.js lambdas.
 *    - Therefore, `x-vercel-ip` is strictly authoritative on Vercel.
 *
 * 2. CLOUDFLARE EDGE:
 *    - When the application domain is fronted by Cloudflare, Cloudflare edge injects
 *      `cf-connecting-ip` with the client's public IP.
 *
 * 3. ARBITRARY CLIENT HEADERS (X-Forwarded-For):
 *    - Any client can forge `X-Forwarded-For: 1.2.3.4, 5.6.7.8` to spoof IP identity.
 *    - Blindly taking the first token of X-Forwarded-For in production allows attackers
 *      to cycle through arbitrary IP addresses and bypass per-client rate limits.
 *    - In production, raw `x-forwarded-for` is NOT treated as a verified client identity
 *      unless edge infrastructure is unconfigured, in which case it is used with unverified status.
 *
 * 4. LOCAL DEVELOPMENT & AUTOMATED TESTING:
 *    - When `NODE_ENV !== "production"` or running locally, `x-forwarded-for` and
 *      loopback `127.0.0.1` are accepted so local development and test runners remain usable.
 * ============================================================================
 */

export interface ClientIpResult {
  ip: string;
  isTrusted: boolean;
  headerSource: "x-vercel-ip" | "cf-connecting-ip" | "x-real-ip" | "x-forwarded-for" | "loopback-default";
}

export function extractClientIp(
  request: Request | { headers: Headers | Record<string, string | string[] | undefined> },
  env: Record<string, string | undefined> = process.env,
): ClientIpResult {
  const getHeader = (name: string): string | null => {
    if ("headers" in request) {
      if (typeof (request.headers as Headers).get === "function") {
        return (request.headers as Headers).get(name);
      }
      const raw =
        (request.headers as Record<string, string | string[] | undefined>)[name.toLowerCase()] ||
        (request.headers as Record<string, string | string[] | undefined>)[name];
      if (Array.isArray(raw)) return raw[0] || null;
      return typeof raw === "string" ? raw : null;
    }
    return null;
  };

  const isProd = env.NODE_ENV === "production";

  // 1. Authoritative Vercel edge IP
  const vercelIp = getHeader("x-vercel-ip")?.trim();
  if (vercelIp && net.isIP(vercelIp)) {
    return { ip: vercelIp, isTrusted: true, headerSource: "x-vercel-ip" };
  }

  // 2. Cloudflare connecting IP
  const cfIp = getHeader("cf-connecting-ip")?.trim();
  if (cfIp && net.isIP(cfIp)) {
    return { ip: cfIp, isTrusted: true, headerSource: "cf-connecting-ip" };
  }

  // 3. Trusted upstream reverse-proxy real IP (Nginx, ALB)
  const realIp = getHeader("x-real-ip")?.trim();
  if (realIp && net.isIP(realIp)) {
    return { ip: realIp, isTrusted: !isProd, headerSource: "x-real-ip" };
  }

  // 4. X-Forwarded-For handling
  const forwarded = getHeader("x-forwarded-for");
  if (forwarded) {
    const tokens = forwarded.split(",");
    for (const token of tokens) {
      const candidate = token.trim();
      if (candidate && net.isIP(candidate)) {
        // In development, trust the first IP token for testing
        // In production, unverified X-Forwarded-For is tracked with isTrusted=false
        return {
          ip: candidate,
          isTrusted: !isProd,
          headerSource: "x-forwarded-for",
        };
      }
    }
  }

  // 5. Safe default loopback IP
  return { ip: "127.0.0.1", isTrusted: true, headerSource: "loopback-default" };
}

/**
 * Convenience helper returning the verified client IP string.
 */
export function getClientIp(
  request: Request | { headers: Headers | Record<string, string | string[] | undefined> },
  env: Record<string, string | undefined> = process.env,
): string {
  return extractClientIp(request, env).ip;
}

/**
 * Contact Form Rate Limiting Policy:
 * - Scope: 'contact-form'
 * - Max Requests: 5 accepted submissions
 * - Window: 15 minutes (900 seconds)
 */
export async function checkContactRateLimit(
  clientIp: string,
  env: Record<string, string | undefined> = process.env,
): Promise<RateLimitResult> {
  return checkSharedRateLimit({
    clientIp,
    action: "contact-form",
    maxRequests: 5,
    windowSeconds: 900,
    env,
  });
}
