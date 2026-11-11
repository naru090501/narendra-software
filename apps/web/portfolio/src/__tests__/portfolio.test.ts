import { describe, expect, it } from "vitest";
import { DEFAULT_PRODUCTS, filterProducts } from "@narendra/core";
import { fetchProductCatalog } from "@narendra/supabase";
import sitemap from "../app/sitemap.js";

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
          product.status === "planned" || product.status === "in-development",
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
