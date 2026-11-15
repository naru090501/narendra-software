import { describe, expect, it } from "vitest";
import { DEFAULT_PRODUCTS } from "@narendra/core";
import { fetchProductCatalog, getSupabasePublicConfig } from "../index.js";

describe("@narendra/supabase config and fallback", () => {
  it("returns null when Supabase env vars are missing or placeholders", () => {
    expect(getSupabasePublicConfig({})).toBeNull();
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://your-project-ref.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-supabase-anon-publishable-key",
      }),
    ).toBeNull();
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "valid-key",
      }),
    ).toBeNull();
    expect(
      getSupabasePublicConfig({
        NEXT_PUBLIC_SUPABASE_URL: "http://remote.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "valid-key",
      }),
    ).toBeNull();
  });

  it("parses valid public Supabase config", () => {
    const config = getSupabasePublicConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://narendramain.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    });

    expect(config).toEqual({
      url: "https://narendramain.supabase.co",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
    });
  });

  it("falls back safely to local catalog when no Supabase client is configured", async () => {
    const result = await fetchProductCatalog({ client: null });

    expect(result.source).toBe("local-fallback");
    expect(result.products).toHaveLength(DEFAULT_PRODUCTS.length);
    expect(result.notice).toBeTruthy();
  });

  it("loads and maps active products with extended Sprint 5 schema", async () => {
    const fakeClient = {
      from: () => ({
        select: () => ({
          in: () => ({
            order: () => ({
              order: async () => ({
                data: [
                  {
                    id: "supa-1",
                    name: "Developer Toolbox",
                    slug: "developer-toolbox",
                    description: "Loaded from Supabase registry.",
                    short_description: "Developer utilities",
                    category: "developer-toolbox",
                    url: "https://devtools.narendrasoftware.com",
                    documentation_url: "/docs/developer-toolbox",
                    icon_url: null,
                    status: "released",
                    version: "0.1.0",
                    supported_platforms: ["web"],
                    pricing_model: "free",
                    requires_registration: false,
                    requires_cloud: false,
                    is_featured: true,
                    sort_order: 10,
                    created_at: "2026-11-11T00:00:00Z",
                    updated_at: "2026-11-11T00:00:00Z",
                  },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    };

    const result = await fetchProductCatalog({
      client: fakeClient as unknown as Parameters<typeof fetchProductCatalog>[0] extends { client?: infer C } ? C : never,
    });

    expect(result.source).toBe("supabase");
    expect(result.products).toHaveLength(1);
    expect(result.products[0]?.name).toBe("Developer Toolbox");
    expect(result.products[0]?.status).toBe("released");
    expect(result.products[0]?.version).toBe("0.1.0");
    expect(result.products[0]?.supportedPlatforms).toEqual(["web"]);
    expect(result.notice).toBeUndefined();
  });
});
