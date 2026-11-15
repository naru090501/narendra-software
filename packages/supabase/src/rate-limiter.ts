import crypto from "node:crypto";
import net from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RateLimitResult } from "@narendra/types";
import { createServiceRoleSupabaseClient, getSupabaseAdminConfig } from "./client.js";

export interface CheckSharedRateLimitOptions {
  clientIp: string;
  action?: string;
  maxRequests?: number;
  windowSeconds?: number;
  client?: SupabaseClient | null;
  env?: Record<string, string | undefined>;
  hmacSecret?: string;
  allowInMemoryFallback?: boolean;
}

export interface InMemoryBucket {
  count: number;
  firstRequestAt: number;
  expiresAt: number;
}

const PLACEHOLDER_MARKERS = [
  "your-32-char-random-hmac-salt-secret",
  "placeholder",
  "example",
  "change-me",
];

function isSecretPlaceholder(val: string): boolean {
  const lower = val.toLowerCase();
  return PLACEHOLDER_MARKERS.some((m) => lower.includes(m));
}

// In-memory bucket store for development/test fallback ONLY
const inMemoryStore = new Map<string, InMemoryBucket>();

/**
 * Resets the in-memory fallback store (primarily for unit test isolation).
 */
export function resetInMemoryRateLimits(): void {
  inMemoryStore.clear();
}

/**
 * Resolves and validates the dedicated secret used to HMAC-hash client IPs.
 *
 * Security Requirements:
 * - In production: RATE_LIMIT_HMAC_SECRET is strictly mandatory and must be at least 32 characters.
 *   Derived fallback secrets are strictly prohibited in production.
 * - Secret values are NEVER logged.
 * - Non-production environments use an isolated, explicit development constant.
 */
export function getRateLimitHmacSecret(
  env: Record<string, string | undefined> = process.env,
): string {
  const isProd = env.NODE_ENV === "production";
  const configuredSecret = env.RATE_LIMIT_HMAC_SECRET?.trim();

  if (isProd) {
    if (!configuredSecret) {
      throw new Error(
        "RATE_LIMIT_HMAC_SECRET environment variable is missing in production. A dedicated secret with at least 32 characters is required.",
      );
    }
    if (configuredSecret.length < 32) {
      throw new Error(
        "RATE_LIMIT_HMAC_SECRET is too short in production. Minimum length is 32 characters.",
      );
    }
    if (isSecretPlaceholder(configuredSecret)) {
      throw new Error(
        "RATE_LIMIT_HMAC_SECRET contains an unconfigured placeholder in production.",
      );
    }
    return configuredSecret;
  }

  // Non-production (development and test environments)
  if (configuredSecret && configuredSecret.length >= 16 && !isSecretPlaceholder(configuredSecret)) {
    return configuredSecret;
  }

  // Isolated development fallback salt (never used in production)
  return "dev-local-hmac-salt-not-for-production-min-32-chars";
}

/**
 * Computes a privacy-preserving HMAC-SHA256 hex digest of the client IP.
 * Raw IP addresses are NEVER stored in database tables or logs.
 *
 * Action prefixing guarantees that different services/endpoints produce
 * distinct hash digests for the same IP address.
 */
export function hashClientIp(clientIp: string, secret: string, action = "contact-form"): string {
  const sanitizedIp = clientIp.trim();
  return crypto
    .createHmac("sha256", secret)
    .update(`${action.trim()}:${sanitizedIp}`)
    .digest("hex");
}

/**
 * Evaluates rate limit against the in-memory store.
 * Synchronous and atomic within a single Node.js process.
 * Restricted to local development and unit tests.
 */
export function checkInMemoryRateLimit(
  bucketKey: string,
  maxRequests = 5,
  windowSeconds = 900,
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
  retryAfterSeconds: number;
  bucketKey: string;
} {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  let bucket = inMemoryStore.get(bucketKey);

  if (!bucket || now >= bucket.expiresAt) {
    bucket = {
      count: 1,
      firstRequestAt: now,
      expiresAt: now + windowMs,
    };
    inMemoryStore.set(bucketKey, bucket);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: Math.max(0, maxRequests - 1),
      resetAt: new Date(bucket.expiresAt).toISOString(),
      retryAfterSeconds: 0,
      bucketKey,
    };
  }

  bucket.count += 1;
  inMemoryStore.set(bucketKey, bucket);

  const allowed = bucket.count <= maxRequests;
  const remaining = Math.max(0, maxRequests - bucket.count);
  const retryAfterSeconds = allowed
    ? 0
    : Math.max(1, Math.ceil((bucket.expiresAt - now) / 1000));

  return {
    allowed,
    limit: maxRequests,
    remaining,
    resetAt: new Date(bucket.expiresAt).toISOString(),
    retryAfterSeconds,
    bucketKey,
  };
}

/**
 * Production-grade shared rate-limit check.
 *
 * Production Fail-Closed Policy:
 * - In production (`NODE_ENV === "production"`), rate limiting strictly requires:
 *   1. A valid, dedicated `RATE_LIMIT_HMAC_SECRET` (>= 32 chars).
 *   2. Configured Supabase `service_role` credentials.
 *   3. Successful execution of remote RPC `check_rate_limit`.
 * - If any of the above fails in production, the limiter FAILS CLOSED (`allowed: false`, `isConfigurationError: true`)
 *   to prevent unmetered abuse or false security claims.
 * - In development (`NODE_ENV !== "production"`), it gracefully falls back to local memory with diagnostic warnings.
 */
export async function checkSharedRateLimit(
  options: CheckSharedRateLimitOptions,
): Promise<RateLimitResult> {
  const env = options.env || process.env;
  const isProd = env.NODE_ENV === "production";
  const action = options.action?.trim() || "contact-form";
  const maxRequests = options.maxRequests ?? 5;
  const windowSeconds = options.windowSeconds ?? 900;

  // In production, in-memory fallback is strictly disallowed
  const allowFallback = isProd ? false : (options.allowInMemoryFallback ?? true);

  // Validate or normalize IP
  const rawIp = options.clientIp?.trim() || "127.0.0.1";
  const validIp = net.isIP(rawIp) ? rawIp : "127.0.0.1";

  // 1. Resolve and validate HMAC secret
  let secret: string;
  try {
    secret = options.hmacSecret || getRateLimitHmacSecret(env);
  } catch (secretError) {
    const errorMsg = secretError instanceof Error ? secretError.message : String(secretError);
    // In production, fail-closed on invalid secret
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: new Date(Date.now() + windowSeconds * 1000).toISOString(),
      retryAfterSeconds: windowSeconds,
      source: "supabase",
      bucketKey: "unresolved-secret-bucket-key",
      isConfigurationError: true,
      warning: `Rate limiter configuration error: ${errorMsg}`,
    };
  }

  const bucketKey = hashClientIp(validIp, secret, action);

  // 2. Resolve Supabase client with service_role privileges
  let supabase: SupabaseClient | null = null;
  if (options.client !== undefined) {
    supabase = options.client;
  } else {
    const adminConfig = getSupabaseAdminConfig(env);
    if (adminConfig) {
      supabase = createServiceRoleSupabaseClient(adminConfig);
    }
  }

  // 3. Handle unconfigured Supabase service role
  if (!supabase) {
    if (allowFallback) {
      const memory = checkInMemoryRateLimit(bucketKey, maxRequests, windowSeconds);
      return {
        ...memory,
        source: "in-memory-fallback",
        warning:
          "Supabase service_role credentials not configured. Operating in local in-memory fallback mode (development only).",
      };
    }

    // Production: Fail closed
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: new Date(Date.now() + windowSeconds * 1000).toISOString(),
      retryAfterSeconds: windowSeconds,
      source: "supabase",
      bucketKey,
      isConfigurationError: true,
      warning:
        "Supabase service_role credentials are not configured in production. Shared rate limiter is failing closed to protect service boundaries.",
    };
  }

  // 4. Execute atomic RPC `check_rate_limit`
  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_bucket_key: bucketKey,
      p_action: action,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      const isMissingRpc = Boolean(
        error.code === "PGRST202" ||
        error.code === "42883" ||
        (error.message && error.message.toLowerCase().includes("check_rate_limit")),
      );

      const warningMessage = isMissingRpc
        ? "Remote Supabase RPC 'check_rate_limit' not found (migration 0002_create_rate_limit_system.sql has not been applied remotely)."
        : `Supabase rate limiting database error: ${error.message} (code: ${error.code}).`;

      if (allowFallback) {
        const memory = checkInMemoryRateLimit(bucketKey, maxRequests, windowSeconds);
        return {
          ...memory,
          source: "in-memory-fallback",
          warning: `${warningMessage} Using local in-memory fallback (development mode only).`,
        };
      }

      // Production: Fail closed on database or RPC error
      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        resetAt: new Date(Date.now() + windowSeconds * 1000).toISOString(),
        retryAfterSeconds: windowSeconds,
        source: "supabase",
        bucketKey,
        isConfigurationError: isMissingRpc,
        warning: `${warningMessage} Failing closed in production.`,
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error("RPC check_rate_limit returned empty result");
    }

    const allowed = Boolean(row.allowed);
    const remaining = Number(row.remaining ?? 0);
    const retryAfter = Number(row.retry_after_seconds ?? 0);
    const resetAt = row.reset_at
      ? new Date(row.reset_at).toISOString()
      : new Date(Date.now() + windowSeconds * 1000).toISOString();

    return {
      allowed,
      limit: maxRequests,
      remaining,
      resetAt,
      retryAfterSeconds: retryAfter,
      source: "supabase",
      bucketKey,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const warningMessage = `Unexpected rate limiter error: ${errorMsg}.`;

    if (allowFallback) {
      const memory = checkInMemoryRateLimit(bucketKey, maxRequests, windowSeconds);
      return {
        ...memory,
        source: "in-memory-fallback",
        warning: `${warningMessage} Using local in-memory fallback (development mode only).`,
      };
    }

    // Production: Fail closed
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: new Date(Date.now() + windowSeconds * 1000).toISOString(),
      retryAfterSeconds: windowSeconds,
      source: "supabase",
      bucketKey,
      isConfigurationError: false,
      warning: `${warningMessage} Failing closed in production.`,
    };
  }
}
