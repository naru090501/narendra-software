import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkInMemoryRateLimit,
  checkSharedRateLimit,
  getRateLimitHmacSecret,
  getSupabaseAdminConfig,
  hashClientIp,
  resetInMemoryRateLimits,
} from "../index.js";

describe("Shared rate limiter: Privacy & HMAC Hashing (Unit)", () => {
  it("generates privacy-preserving 64-character hex HMAC hashes", () => {
    const secret = "test-secret-key-12345678901234567890123456789012";
    const ip = "203.0.113.195";
    const hash = hashClientIp(ip, secret, "contact-form");

    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain(ip);
  });

  it("produces distinct hashes for different client IPs", () => {
    const secret = "test-secret-key-12345678901234567890123456789012";
    const hash1 = hashClientIp("198.51.100.1", secret, "contact-form");
    const hash2 = hashClientIp("198.51.100.2", secret, "contact-form");

    expect(hash1).not.toBe(hash2);
  });

  it("isolates action scopes using distinct prefixes to prevent cross-action collisions", () => {
    const secret = "test-secret-key-12345678901234567890123456789012";
    const ip = "192.0.2.1";
    const contactHash = hashClientIp(ip, secret, "contact-form");
    const loginHash = hashClientIp(ip, secret, "auth-login");

    expect(contactHash).not.toBe(loginHash);
  });

  it("strictly requires RATE_LIMIT_HMAC_SECRET with minimum 32 chars in production", () => {
    // Missing in production
    expect(() =>
      getRateLimitHmacSecret({ NODE_ENV: "production" }),
    ).toThrow(/RATE_LIMIT_HMAC_SECRET environment variable is missing in production/);

    // Too short in production
    expect(() =>
      getRateLimitHmacSecret({
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: "too-short-secret-under-32-chars",
      }),
    ).toThrow(/Minimum length is 32 characters/);

    // Placeholder in production
    expect(() =>
      getRateLimitHmacSecret({
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: "your-32-char-random-hmac-salt-secret",
      }),
    ).toThrow(/contains an unconfigured placeholder/);

    // Valid in production
    const valid = "a-very-strong-production-hmac-secret-string-at-least-32-chars";
    expect(
      getRateLimitHmacSecret({
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: valid,
      }),
    ).toBe(valid);
  });

  it("uses isolated development constant when in non-production", () => {
    const devSecret = getRateLimitHmacSecret({ NODE_ENV: "development" });
    expect(devSecret).toBe("dev-local-hmac-salt-not-for-production-min-32-chars");
  });

  it("requires server-side service_role credentials and rejects anon placeholders", () => {
    expect(getSupabaseAdminConfig({})).toBeNull();
    expect(
      getSupabaseAdminConfig({
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "your-service-role-key-placeholder",
      }),
    ).toBeNull();
    expect(
      getSupabaseAdminConfig({
        SUPABASE_URL: "https://narendramain.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-service-role",
      }),
    ).toEqual({
      url: "https://narendramain.supabase.co",
      serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-service-role",
    });
  });
});

describe("In-Memory Rate Limiting Engine (Unit Test — Development Engine)", () => {
  beforeEach(() => {
    resetInMemoryRateLimits();
  });

  it("enforces maximum allowed requests and decrements remaining quota", () => {
    const bucketKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    // Requests 1 through 5
    for (let i = 1; i <= 5; i++) {
      const res = checkInMemoryRateLimit(bucketKey, 5, 900);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - i);
      expect(res.retryAfterSeconds).toBe(0);
    }

    // 6th request: throttled
    const blocked = checkInMemoryRateLimit(bucketKey, 5, 900);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(900);
  });

  it("resets counter after window expiration", () => {
    const bucketKey = "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210";
    const initialTime = 1700000000000;
    vi.setSystemTime(initialTime);

    // Consume all 5 requests
    for (let i = 0; i < 5; i++) {
      checkInMemoryRateLimit(bucketKey, 5, 10);
    }

    const blocked = checkInMemoryRateLimit(bucketKey, 5, 10);
    expect(blocked.allowed).toBe(false);

    // Advance time past the 10-second window
    vi.setSystemTime(initialTime + 11000);

    const afterExpiry = checkInMemoryRateLimit(bucketKey, 5, 10);
    expect(afterExpiry.allowed).toBe(true);
    expect(afterExpiry.remaining).toBe(4);

    vi.useRealTimers();
  });

  it("handles event-loop concurrency in Node.js process (In-Memory Unit Test)", async () => {
    // Note: This unit test exercises the synchronous event-loop atomicity of the in-memory engine.
    // Real multi-process PostgreSQL row-lock concurrency is verified in database integration environments.
    const bucketKey = "concurrent0123456789abcdef0123456789abcdef0123456789abcdef012345";
    const totalRequests = 20;
    const maxRequests = 5;

    const promises = Array.from({ length: totalRequests }).map(async () =>
      checkInMemoryRateLimit(bucketKey, maxRequests, 900),
    );

    const results = await Promise.all(promises);
    const allowedCount = results.filter((r) => r.allowed).length;
    const blockedCount = results.filter((r) => !r.allowed).length;

    expect(allowedCount).toBe(maxRequests);
    expect(blockedCount).toBe(totalRequests - maxRequests);
  });
});

describe("Shared Rate Limiter: Fail-Closed & Fallback Isolation (Unit)", () => {
  beforeEach(() => {
    resetInMemoryRateLimits();
  });

  it("FAILS CLOSED in production when Supabase service_role is not configured", async () => {
    const result = await checkSharedRateLimit({
      clientIp: "192.0.2.50",
      client: null,
      maxRequests: 5,
      windowSeconds: 900,
      env: {
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: "valid-production-secret-with-at-least-32-chars-long",
      },
    });

    // In production, must NOT silently fall back to in-memory!
    expect(result.source).toBe("supabase");
    expect(result.allowed).toBe(false);
    expect(result.isConfigurationError).toBe(true);
    expect(result.warning).toMatch(/fail(ing)?[\s-]+closed/i);
  });

  it("FAILS CLOSED in production when remote RPC check_rate_limit is missing (PGRST202)", async () => {
    const fakeClientWithMissingRpc = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: {
          code: "PGRST202",
          message: "Could not find the function public.check_rate_limit",
        },
      }),
    };

    const result = await checkSharedRateLimit({
      clientIp: "192.0.2.51",
      client: fakeClientWithMissingRpc as unknown as Parameters<typeof checkSharedRateLimit>[0]["client"],
      maxRequests: 5,
      windowSeconds: 900,
      env: {
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: "valid-production-secret-with-at-least-32-chars-long",
      },
    });

    // Must FAIL CLOSED in production
    expect(result.source).toBe("supabase");
    expect(result.allowed).toBe(false);
    expect(result.isConfigurationError).toBe(true);
    expect(result.warning).toContain("Failing closed in production");
  });

  it("FAILS CLOSED in production when remote database experiences network/connection failure", async () => {
    const fakeClientWithDbError = {
      rpc: vi.fn().mockRejectedValue(new Error("Connection timeout to postgres")),
    };

    const result = await checkSharedRateLimit({
      clientIp: "192.0.2.52",
      client: fakeClientWithDbError as unknown as Parameters<typeof checkSharedRateLimit>[0]["client"],
      maxRequests: 5,
      windowSeconds: 900,
      env: {
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: "valid-production-secret-with-at-least-32-chars-long",
      },
    });

    expect(result.source).toBe("supabase");
    expect(result.allowed).toBe(false);
    expect(result.warning).toContain("Failing closed in production");
  });

  it("permits in-memory fallback ONLY in non-production environments", async () => {
    const result = await checkSharedRateLimit({
      clientIp: "192.0.2.55",
      client: null,
      maxRequests: 5,
      windowSeconds: 900,
      env: {
        NODE_ENV: "development",
      },
    });

    expect(result.source).toBe("in-memory-fallback");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
    expect(result.warning).toContain("development only");
  });

  it("parses valid Supabase RPC response when remote migration is active", async () => {
    const fakeClientSuccess = {
      rpc: vi.fn().mockResolvedValue({
        data: [
          {
            allowed: true,
            current_count: 2,
            remaining: 3,
            reset_at: "2026-11-15T13:00:00.000Z",
            retry_after_seconds: 0,
          },
        ],
        error: null,
      }),
    };

    const result = await checkSharedRateLimit({
      clientIp: "192.0.2.75",
      client: fakeClientSuccess as unknown as Parameters<typeof checkSharedRateLimit>[0]["client"],
      maxRequests: 5,
      windowSeconds: 900,
      env: {
        NODE_ENV: "production",
        RATE_LIMIT_HMAC_SECRET: "valid-production-secret-with-at-least-32-chars-long",
      },
    });

    expect(result.source).toBe("supabase");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(3);
    expect(result.retryAfterSeconds).toBe(0);
    expect(result.resetAt).toBe("2026-11-15T13:00:00.000Z");
    expect(result.warning).toBeUndefined();
  });
});
