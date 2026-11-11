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

  it("loads and maps active products when a configured Supabase client returns rows", async () => {
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
                    category: "developer-toolbox",
                    url: "https://devtools.narendrasoftware.com",
                    icon_url: null,
                    status: "in-development",
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
    expect(result.notice).toBeUndefined();
  });
});
