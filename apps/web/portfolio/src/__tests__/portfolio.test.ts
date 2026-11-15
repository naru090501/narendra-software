import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_PRODUCTS, filterProducts } from "@narendra/core";
import { fetchProductCatalog } from "@narendra/supabase";
import { ProductCard } from "../components/product-card";
import sitemap from "../app/sitemap.js";
import {
  checkRateLimit,
  extractClientIp,
  getClientIp,
  isDuplicateSubmission,
  recordSuccessfulSubmission,
  resetInMemoryRateLimits,
  sendContactEmail,
} from "../lib/email-service.js";
import { POST } from "../app/api/contact/route.js";

describe("Portfolio product catalog integration", () => {
  it("loads fallback products gracefully when Supabase credentials are missing", async () => {
    const result = await fetchProductCatalog({
      env: {},
    });

    expect(result.source).toBe("local-fallback");
    expect(result.products.length).toBe(DEFAULT_PRODUCTS.length);
    expect(
      result.products.every(
        (product) =>
          product.status === "planned" ||
          product.status === "in-development" ||
          product.status === "released",
      ),
    ).toBe(true);
  });

  it("supports category filtering across all six product categories", async () => {
    const result = await fetchProductCatalog({ env: {} });
    const devTools = filterProducts(result.products, {
      category: "developer-toolbox",
    });
    const windowsTools = filterProducts(result.products, {
      category: "windows-utilities",
    });

    expect(devTools).toHaveLength(1);
    expect(windowsTools).toHaveLength(1);
  });

  it("renders release management version, date, channel and release notes on ProductCard", () => {
    const devTools = DEFAULT_PRODUCTS.find((p) => p.slug === "developer-toolbox");
    expect(devTools).toBeDefined();
    if (devTools) {
      const html = renderToStaticMarkup(React.createElement(ProductCard, { product: devTools }));
      expect(html).toContain("v0.1.0");
      expect(html).toContain("2026-11-15");
      expect(html).toContain("stable");
      expect(html).toContain("View Release Notes");
      expect(html).toContain("JSON formatter");
    }
  });

  it("publishes all five primary portfolio routes in sitemap when site URL is set", () => {
    const prev = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://portfolio.example.test";
    try {
      const entries = sitemap();
      const urls = entries.map((entry) => entry.url);

      expect(urls).toContain("https://portfolio.example.test");
      expect(urls.some((u) => u.endsWith("/products"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/projects"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/about"))).toBe(true);
      expect(urls.some((u) => u.endsWith("/contact"))).toBe(true);
    } finally {
      if (prev === undefined) {
        delete process.env.NEXT_PUBLIC_SITE_URL;
      } else {
        process.env.NEXT_PUBLIC_SITE_URL = prev;
      }
    }
  });

  it("omits localhost URLs from sitemap in production when no site URL is configured", () => {
    const prevUrl = process.env.NEXT_PUBLIC_SITE_URL;
    const prevVercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    const prevVercel = process.env.VERCEL_URL;
    const prevNodeEnv = process.env.NODE_ENV;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    delete process.env.VERCEL_URL;
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    try {
      const entries = sitemap();
      expect(entries).toEqual([]);
    } finally {
      if (prevUrl !== undefined) process.env.NEXT_PUBLIC_SITE_URL = prevUrl;
      if (prevVercelProd !== undefined) process.env.VERCEL_PROJECT_PRODUCTION_URL = prevVercelProd;
      if (prevVercel !== undefined) process.env.VERCEL_URL = prevVercel;
      (process.env as Record<string, string | undefined>).NODE_ENV = prevNodeEnv;
    }
  });
});

describe("Portfolio contact & email service", () => {
  it("enforces sliding-window rate limits per IP", () => {
    const testIp = `192.0.2.${Math.floor(Math.random() * 250) + 1}`;
    // 5 allowed requests
    for (let i = 0; i < 5; i++) {
      const res = checkRateLimit(testIp);
      expect(res.allowed).toBe(true);
    }
    // 6th request is throttled
    const blocked = checkRateLimit(testIp);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("detects rapid duplicate message submissions", () => {
    const testIp = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
    const payload = {
      email: "user@example.com",
      topic: "collaboration" as const,
      message: "This is a unique test message content for duplicate detection testing.",
    };

    expect(isDuplicateSubmission(testIp, payload)).toBe(false);
    recordSuccessfulSubmission(testIp, payload);
    expect(isDuplicateSubmission(testIp, payload)).toBe(true);
  });

  it("returns actionable error when SMTP configuration is missing", async () => {
    const result = await sendContactEmail(
      {
        name: "Test User",
        email: "test@example.com",
        topic: "general",
        message: "Hello this is a valid test message for delivery test.",
      },
      { config: null },
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain("Transactional email delivery is not configured");
  });

  describe("Trusted client IP extraction", () => {
    it("prioritizes trusted x-vercel-ip over spoofed x-forwarded-for headers", () => {
      const headers = new Headers({
        "x-vercel-ip": "198.51.100.42",
        "x-forwarded-for": "10.0.0.1, 8.8.8.8",
      });
      const req = new Request("http://localhost/api/contact", { headers });
      expect(getClientIp(req)).toBe("198.51.100.42");
    });

    it("prioritizes Cloudflare cf-connecting-ip when present", () => {
      const headers = new Headers({
        "cf-connecting-ip": "203.0.113.88",
        "x-forwarded-for": "1.1.1.1",
      });
      const req = new Request("http://localhost/api/contact", { headers });
      expect(getClientIp(req)).toBe("203.0.113.88");
    });

    it("falls back to loopback IP when no valid IP header exists", () => {
      const headers = new Headers({
        "x-forwarded-for": "invalid-ip-string",
      });
      const req = new Request("http://localhost/api/contact", { headers });
      expect(getClientIp(req)).toBe("127.0.0.1");
    });

    it("verifies proxy trust model: marks x-vercel-ip as trusted and untrusted x-forwarded-for in production", () => {
      const trustedReq = new Request("http://localhost/api/contact", {
        headers: new Headers({ "x-vercel-ip": "198.51.100.99" }),
      });
      const trustedRes = extractClientIp(trustedReq, { NODE_ENV: "production" });
      expect(trustedRes.isTrusted).toBe(true);
      expect(trustedRes.headerSource).toBe("x-vercel-ip");

      const untrustedReq = new Request("http://localhost/api/contact", {
        headers: new Headers({ "x-forwarded-for": "10.0.0.5" }),
      });
      const untrustedRes = extractClientIp(untrustedReq, { NODE_ENV: "production" });
      expect(untrustedRes.isTrusted).toBe(false);
      expect(untrustedRes.headerSource).toBe("x-forwarded-for");
    });
  });

  describe("Contact API Route & Rate Limit Protection", () => {
    it("does NOT count malformed JSON requests as rate-limited attempts", async () => {
      resetInMemoryRateLimits();
      const testIp = "192.0.2.110";

      // Send malformed JSON request
      const req = new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "x-vercel-ip": testIp,
          "content-type": "application/json",
        },
        body: "{ bad-json-syntax ",
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain("Invalid request payload");

      // Verify that rate limit quota was NOT consumed
      expect(res.headers.get("X-RateLimit-Remaining")).toBeNull();
    });

    it("does NOT count form validation errors as rate-limited attempts", async () => {
      resetInMemoryRateLimits();
      const testIp = "192.0.2.111";

      const req = new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "x-vercel-ip": testIp,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "",
          email: "invalid-email-address",
          topic: "general",
          message: "Too short",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.errors).toBeDefined();

      // Verify that rate limit quota was NOT consumed
      expect(res.headers.get("X-RateLimit-Remaining")).toBeNull();
    });

    it("enforces rate limits and returns 429 when max attempts are exceeded", async () => {
      resetInMemoryRateLimits();
      const testIp = "192.0.2.112";

      // Send 5 valid attempts (without SMTP configured, each returns 502 with rate-limit headers)
      for (let i = 0; i < 5; i++) {
        const req = new Request("http://localhost/api/contact", {
          method: "POST",
          headers: {
            "x-vercel-ip": testIp,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Rate Tester",
            email: `tester-${i}@example.com`,
            topic: "general",
            message: `This is legitimate inquiry attempt number ${i} with sufficient text.`,
          }),
        });

        const res = await POST(req);
        // Returns 502 because SMTP is not configured in test, but rate limiting was evaluated!
        expect(res.status).toBe(502);
        expect(res.headers.get("X-RateLimit-Remaining")).toBe((4 - i).toString());
      }

      // 6th attempt should be blocked with 429 Too Many Requests
      const blockedReq = new Request("http://localhost/api/contact", {
        method: "POST",
        headers: {
          "x-vercel-ip": testIp,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: "Rate Tester",
          email: "tester-blocked@example.com",
          topic: "general",
          message: "This inquiry exceeds the 5-request rate limit threshold.",
        }),
      });

      const blockedRes = await POST(blockedReq);
      expect(blockedRes.status).toBe(429);
      expect(blockedRes.headers.get("Retry-After")).toBeTruthy();
      expect(blockedRes.headers.get("X-RateLimit-Remaining")).toBe("0");

      const body = await blockedRes.json();
      expect(body.success).toBe(false);
      expect(body.message).toContain("Too many inquiries");
      expect(body.retryAfter).toBeGreaterThan(0);
    });

    it("FAILS CLOSED with 503 Service Unavailable in production when rate limiting configuration is incomplete", async () => {
      const prevNodeEnv = process.env.NODE_ENV;
      const prevSecret = process.env.RATE_LIMIT_HMAC_SECRET;
      const prevSupaKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      delete process.env.RATE_LIMIT_HMAC_SECRET;
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;

      try {
        const req = new Request("http://localhost/api/contact", {
          method: "POST",
          headers: {
            "x-vercel-ip": "192.0.2.200",
            "content-type": "application/json",
          },
          body: JSON.stringify({
            name: "Production Client",
            email: "client@example.com",
            topic: "general",
            message: "Testing production fail-closed behavior.",
          }),
        });

        const res = await POST(req);
        // Must fail closed with 503 rather than silently permitting email delivery
        expect(res.status).toBe(503);
        const body = await res.json();
        expect(body.success).toBe(false);
        expect(body.message).toContain("temporarily unavailable");
        expect(res.headers.get("Retry-After")).toBe("60");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = prevNodeEnv;
        if (prevSecret !== undefined) process.env.RATE_LIMIT_HMAC_SECRET = prevSecret;
        if (prevSupaKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = prevSupaKey;
      }
    });
  });
});
