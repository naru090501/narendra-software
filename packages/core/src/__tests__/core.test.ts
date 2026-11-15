import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONTACT_CHANNELS,
  DEFAULT_PRODUCTS,
  filterProducts,
  getActiveContactChannels,
  getAllProductReleases,
  getDefaultProducts,
  getFeaturedProducts,
  getPlatformConfig,
  getProductRelease,
  getPublicDisplayChannels,
  mapProductRowToProduct,
  sanitizeHeaderValue,
  validateContactInput,
} from "../index.js";

describe("@narendra/core product helpers", () => {
  it("includes the 4 core sprint 5 products", () => {
    expect(DEFAULT_PRODUCTS).toHaveLength(4);
    const slugs = DEFAULT_PRODUCTS.map((p) => p.slug);
    expect(slugs).toContain("developer-toolbox");
    expect(slugs).toContain("document-tools");
    expect(slugs).toContain("image-tools");
    expect(slugs).toContain("windows-disk-usb-utility");
  });

  it("excludes archived and deprecated products by default", () => {
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

  it("filters by category, platform, pricing model, and search query case-insensitively", () => {
    const byCategory = filterProducts(DEFAULT_PRODUCTS, {
      category: "developer-toolbox",
    });
    expect(byCategory).toHaveLength(1);
    expect(byCategory[0]?.slug).toBe("developer-toolbox");

    const byPlatform = filterProducts(DEFAULT_PRODUCTS, {
      platform: "windows",
    });
    expect(byPlatform).toHaveLength(1);
    expect(byPlatform[0]?.slug).toBe("windows-disk-usb-utility");

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

  it("maps valid Supabase rows with Sprint 5 schema extensions", () => {
    const valid = mapProductRowToProduct({
      id: "1",
      name: "Developer Toolbox",
      slug: "developer-toolbox",
      description: "Fast JSON and developer tool",
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
      sort_order: 1,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
    });
    expect(valid?.isFeatured).toBe(true);
    expect(valid?.status).toBe("released");
    expect(valid?.supportedPlatforms).toEqual(["web"]);
    expect(valid?.pricingModel).toBe("free");
    expect(valid?.documentationUrl).toBe("/docs/developer-toolbox");

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
  });

  it("marks Developer Toolbox deployed with status released and honors NEXT_PUBLIC_DEV_TOOLS_URL", () => {
    const unsetProducts = getDefaultProducts({});
    const devToolsUnset = unsetProducts.find((p) => p.slug === "developer-toolbox");
    expect(devToolsUnset?.status).toBe("released");
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

describe("@narendra/core contact validation & anti-spam", () => {
  it("accepts valid contact input", () => {
    const result = validateContactInput({
      name: "Aarav Sharma",
      email: "aarav@example.com",
      organization: "Example Labs",
      topic: "collaboration",
      message: "Interested in collaborating on local-first developer utilities.",
    });

    expect(result.valid).toBe(true);
    expect(result.isSpamBot).toBe(false);
    expect(result.errors).toEqual({});
  });

  it("detects and flags honeypot spam bot submissions", () => {
    const result = validateContactInput({
      name: "Spam Bot",
      email: "bot@spammer.com",
      topic: "general",
      message: "Buy cheap backlinks today here and now 1234567890!",
      honeypot: "http://spam-link.ru",
    });

    expect(result.valid).toBe(false);
    expect(result.isSpamBot).toBe(true);
    expect(result.errors.honeypot).toBeDefined();
  });

  it("detects and blocks header injection attempts with newlines", () => {
    const result = validateContactInput({
      name: "Attacker\r\nBcc: victim@example.com",
      email: "attacker@example.com",
      topic: "general",
      message: "Valid message content for header injection test verification.",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.name).toContain("line breaks");

    const emailInjection = validateContactInput({
      name: "Normal User",
      email: "victim@example.com\r\nSubject: Injected",
      topic: "general",
      message: "Valid message content for header injection test verification.",
    });

    expect(emailInjection.valid).toBe(false);
    expect(emailInjection.errors.email).toBeDefined();
  });

  it("sanitizes header values by stripping CRLF and null bytes", () => {
    expect(sanitizeHeaderValue("User\r\nName\tTest\0")).toBe("User Name Test");
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

describe("@narendra/core contact channels & platform config", () => {
  it("returns active contact channels and filters out unconfigured/disabled channels", () => {
    const active = getActiveContactChannels(DEFAULT_CONTACT_CHANNELS);
    expect(active.length).toBeGreaterThan(0);
    expect(active.some((c) => c.type === "email")).toBe(true);
    expect(active.some((c) => c.type === "github")).toBe(true);
    // WhatsApp is intentionally disabled by default
    expect(active.some((c) => c.type === "whatsapp")).toBe(false);

    const publicChannels = getPublicDisplayChannels(DEFAULT_CONTACT_CHANNELS);
    expect(publicChannels.every((c) => c.visibility === "public")).toBe(true);
  });

  it("flags unconfirmed default email and honors NEXT_PUBLIC_CONTACT_EMAIL", () => {
    const channels = DEFAULT_CONTACT_CHANNELS;
    const emailChannel = channels.find((c) => c.type === "email");
    expect(emailChannel?.description).toContain("Pending domain mailbox");

    const config = getPlatformConfig({});
    expect(config.company.legalName).toBe("Narendra Software");
    expect(config.features.enableSupabaseRegistry).toBe(false);
    expect(config.features.enableWhatsAppChannel).toBe(false);

    const configured = getPlatformConfig({
      NEXT_PUBLIC_SUPABASE_URL: "https://narendramain.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key-test",
      NEXT_PUBLIC_CONTACT_EMAIL: "narendra@verified.test",
      NEXT_PUBLIC_ENABLE_WHATSAPP: "true",
    });
    expect(configured.company.contactEmail).toBe("narendra@verified.test");
    expect(configured.features.enableSupabaseRegistry).toBe(true);
    expect(configured.features.enableWhatsAppChannel).toBe(true);
  });

  it("provides practical initial release information structure for Narendra Software products", () => {
    const releases = getAllProductReleases();
    expect(releases).toHaveLength(4);

    const devtools = getProductRelease("developer-toolbox");
    expect(devtools).toBeDefined();
    expect(devtools?.version).toBe("0.1.0");
    expect(devtools?.releaseStatus).toBe("released");
    expect(devtools?.updateInfo.channel).toBe("stable");
    expect(devtools?.releaseNotes.length).toBeGreaterThan(3);

    const windowsUtil = getProductRelease("windows-disk-usb-utility");
    expect(windowsUtil).toBeDefined();
    expect(windowsUtil?.releaseStatus).toBe("planned");
    expect(windowsUtil?.updateInfo.channel).toBe("preview");
  });
});
