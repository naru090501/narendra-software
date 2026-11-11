import { describe, expect, it } from "vitest";
import {
  DEFAULT_PRODUCTS,
  filterProducts,
  getDefaultProducts,
  getFeaturedProducts,
  mapProductRowToProduct,
  validateContactInput,
} from "../index.js";

describe("@narendra/core product helpers", () => {
  it("excludes archived products by default", () => {
    const withArchived = [
      ...DEFAULT_PRODUCTS,
      {
        ...DEFAULT_PRODUCTS[0]!,
        id: "archived-1",
        slug: "archived-tool",
        status: "archived" as const,
      },
    ];

    const result = filterProducts(withArchived);
    expect(result.some((p) => p.id === "archived-1")).toBe(false);
    expect(result).toHaveLength(DEFAULT_PRODUCTS.length);
  });

  it("filters by category and search query case-insensitively", () => {
    const byCategory = filterProducts(DEFAULT_PRODUCTS, {
      category: "developer-toolbox",
    });
    expect(byCategory).toHaveLength(1);
    expect(byCategory[0]?.slug).toBe("developer-toolbox");

    const byQuery = filterProducts(DEFAULT_PRODUCTS, {
      query: "USB",
    });
    expect(byQuery).toHaveLength(1);
    expect(byQuery[0]?.slug).toBe("windows-disk-usb-utility");
  });

  it("returns featured products sorted by sortOrder", () => {
    const featured = getFeaturedProducts(DEFAULT_PRODUCTS);
    expect(featured.length).toBeGreaterThan(0);
    for (let i = 1; i < featured.length; i += 1) {
      expect(featured[i]!.sortOrder).toBeGreaterThanOrEqual(
        featured[i - 1]!.sortOrder,
      );
    }
  });

  it("maps valid Supabase rows and rejects invalid enums", () => {
    const valid = mapProductRowToProduct({
      id: "1",
      name: "JSON Studio",
      slug: "json-studio",
      description: "Fast JSON tool",
      category: "developer-toolbox",
      url: "https://devtools.narendrasoftware.com",
      icon_url: null,
      status: "in-development",
      is_featured: true,
      sort_order: 1,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(valid?.isFeatured).toBe(true);
    expect(valid?.sortOrder).toBe(1);

    const invalid = mapProductRowToProduct({
      id: "2",
      name: "Bad",
      slug: "bad",
      description: "Bad category",
      category: "unknown-category",
      url: "https://example.com",
      icon_url: null,
      status: "planned",
      is_featured: false,
      sort_order: 2,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(invalid).toBeNull();

    const unsafeUrls = mapProductRowToProduct({
      id: "3",
      name: "Unsafe URL Test",
      slug: "unsafe-url-test",
      description: "Rejects javascript: and protocol-relative // URLs",
      category: "developer-toolbox",
      url: "javascript:alert(1)",
      icon_url: "//evil.example/icon.svg",
      status: "planned",
      is_featured: false,
      sort_order: 3,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(unsafeUrls?.url).toBeNull();
    expect(unsafeUrls?.iconUrl).toBeNull();
  });

  it("keeps Developer Toolbox URL null by default and honors NEXT_PUBLIC_DEV_TOOLS_URL", () => {
    const unsetProducts = getDefaultProducts({});
    const devToolsUnset = unsetProducts.find((p) => p.slug === "developer-toolbox");
    expect(devToolsUnset?.status).toBe("in-development");
    expect(devToolsUnset?.url).toBeNull();

    const configuredProducts = getDefaultProducts({
      NEXT_PUBLIC_DEV_TOOLS_URL: "http://localhost:3001",
    });
    const devToolsConfigured = configuredProducts.find(
      (p) => p.slug === "developer-toolbox",
    );
    expect(devToolsConfigured?.url).toBe("http://localhost:3001/");
  });
});

describe("@narendra/core contact validation", () => {
  it("accepts valid contact input", () => {
    const result = validateContactInput({
      name: "Aarav Sharma",
      email: "aarav@example.com",
      organization: "Example Labs",
      topic: "collaboration",
      message: "Interested in collaborating on local-first developer utilities.",
    });

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("returns field errors for invalid inputs", () => {
    const result = validateContactInput({
      name: "A",
      email: "not-an-email",
      organization: "",
      topic: "general",
      message: "Too short",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.message).toBeDefined();
  });
});
