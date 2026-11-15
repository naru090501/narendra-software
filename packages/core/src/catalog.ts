import type {
  Product,
  ProductCategory,
  ProductCategoryMeta,
  ProductStatus,
  ProjectShowcase,
} from "@narendra/types";

export const PRODUCT_CATEGORY_META: Record<ProductCategory, ProductCategoryMeta> = {
  "developer-toolbox": {
    id: "developer-toolbox",
    label: "Developer Toolbox",
    shortLabel: "Dev Tools",
    description:
      "Fast, browser-local utilities for JSON, XML, CSV, Base64, encoding, and data inspection without server round-trips.",
    iconKey: "code",
  },
  "document-tools": {
    id: "document-tools",
    label: "Document Tools",
    shortLabel: "Documents",
    description:
      "Focused PDF, Excel, and structured document transformation tools designed around local processing.",
    iconKey: "file-text",
  },
  "image-tools": {
    id: "image-tools",
    label: "Image Tools",
    shortLabel: "Images",
    description:
      "Client-side image conversion, resizing, compression, and optimization utilities that keep assets on your device.",
    iconKey: "image",
  },
  "security-tools": {
    id: "security-tools",
    label: "Security Tools",
    shortLabel: "Security",
    description:
      "Privacy-first cryptographic hashing, token inspection, and security verification utilities.",
    iconKey: "shield",
  },
  "ai-tools": {
    id: "ai-tools",
    label: "AI Tools",
    shortLabel: "AI",
    description:
      "Selectively AI-powered workflows applied only where intelligent synthesis genuinely improves productivity.",
    iconKey: "sparkles",
  },
  "windows-utilities": {
    id: "windows-utilities",
    label: "Windows Utilities",
    shortLabel: "Windows",
    description:
      "Native .NET 10 desktop applications for Windows, including bootable USB creation and disk inspection.",
    iconKey: "monitor",
  },
};

export const PRODUCT_CATEGORY_LIST: ProductCategoryMeta[] = Object.values(
  PRODUCT_CATEGORY_META,
);

export const PRODUCT_STATUS_META: Record<
  ProductStatus,
  { label: string; description: string; tone: "emerald" | "amber" | "sky" | "slate" | "neutral" }
> = {
  released: {
    label: "Deployed",
    description: "Generally available and deployed.",
    tone: "emerald",
  },
  live: {
    label: "Live",
    description: "Generally available and deployed.",
    tone: "emerald",
  },
  beta: {
    label: "Beta",
    description: "Public preview undergoing active validation.",
    tone: "sky",
  },
  in_development: {
    label: "In Development",
    description: "Actively engineered on the current roadmap.",
    tone: "amber",
  },
  "in-development": {
    label: "In Development",
    description: "Actively engineered on the current roadmap.",
    tone: "amber",
  },
  planned: {
    label: "Planned",
    description: "Scoped in our product architecture and scheduled next.",
    tone: "slate",
  },
  deprecated: {
    label: "Deprecated",
    description: "Deprecated and superseded.",
    tone: "neutral",
  },
  archived: {
    label: "Archived",
    description: "Retired or archived.",
    tone: "neutral",
  },
};

const SEED_TIMESTAMP = "2026-11-11T00:00:00.000Z";

export function resolveConfiguredProductUrl(rawUrl?: string): string | null {
  const trimmed = rawUrl?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Builds the fallback product registry used when Supabase credentials are not
 * configured in local development or offline builds.
 * Sprint 5 specifies 4 products:
 * 1. Developer Toolbox — deployed
 * 2. Document Tools — planned
 * 3. Image Tools — planned
 * 4. Windows Disk & USB Utility — planned
 */
export function getDefaultProducts(
  env: Record<string, string | undefined> = typeof process !== "undefined"
    ? process.env
    : {},
): Product[] {
  const devToolsUrl = resolveConfiguredProductUrl(
    env.NEXT_PUBLIC_DEV_TOOLS_URL,
  );

  return [
    {
      id: "00000000-0000-4000-8000-000000000101",
      name: "Developer Toolbox",
      slug: "developer-toolbox",
      description:
        "Standalone local-first JSON, XML, CSV, Base64, and text utilities engineered for instant feedback with zero unnecessary server uploads.",
      shortDescription:
        "Local-first developer utilities for JSON, XML, CSV, Base64, and text processing.",
      category: "developer-toolbox",
      url: devToolsUrl,
      documentationUrl: "/docs/developer-toolbox",
      iconUrl: null,
      status: "released",
      version: "0.1.0",
      supportedPlatforms: ["web"],
      pricingModel: "free",
      requiresRegistration: false,
      requiresCloud: false,
      isFeatured: true,
      sortOrder: 10,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: "00000000-0000-4000-8000-000000000102",
      name: "Document Tools",
      slug: "document-tools",
      description:
        "Focused PDF, Excel, and structured document conversion and inspection utilities built with privacy-first local processing.",
      shortDescription:
        "Privacy-first document transformation and PDF inspection.",
      category: "document-tools",
      url: null,
      documentationUrl: "/docs/document-tools",
      iconUrl: null,
      status: "planned",
      version: "0.1.0",
      supportedPlatforms: ["web"],
      pricingModel: "free",
      requiresRegistration: false,
      requiresCloud: false,
      isFeatured: true,
      sortOrder: 20,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: "00000000-0000-4000-8000-000000000103",
      name: "Image Tools",
      slug: "image-tools",
      description:
        "Browser-native image format conversion, lossless/lossy optimization, resizing, and metadata cleanup without server storage.",
      shortDescription:
        "Client-side image format conversion, compression, and metadata stripping.",
      category: "image-tools",
      url: null,
      documentationUrl: "/docs/image-tools",
      iconUrl: null,
      status: "planned",
      version: "0.1.0",
      supportedPlatforms: ["web"],
      pricingModel: "free",
      requiresRegistration: false,
      requiresCloud: false,
      isFeatured: true,
      sortOrder: 30,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: "00000000-0000-4000-8000-000000000104",
      name: "Windows Disk & USB Utility",
      slug: "windows-disk-usb-utility",
      description:
        "Native .NET 10 Windows utility for verified bootable USB creation, partition inspection, and safe drive formatting.",
      shortDescription:
        "Native Windows desktop application for safe USB and disk operations.",
      category: "windows-utilities",
      url: null,
      documentationUrl: "/docs/windows-disk-usb-utility",
      iconUrl: null,
      status: "planned",
      version: "0.1.0",
      supportedPlatforms: ["windows"],
      pricingModel: "free",
      requiresRegistration: false,
      requiresCloud: false,
      isFeatured: true,
      sortOrder: 40,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  ];
}

export const DEFAULT_PRODUCTS: Product[] = getDefaultProducts();

/**
 * Engineering showcases representing active platform foundations
 * and scoped product architectures.
 */
export const PROJECT_SHOWCASES: ProjectShowcase[] = [
  {
    id: "proj-central-platform",
    slug: "narendra-software-platform",
    title: "Narendra Software Central Platform & Registry",
    summary:
      "Modular monorepo, shared TypeScript packages, central portfolio, and Supabase product registry.",
    description:
      "The foundational architecture powering Narendra Software: independent deployable web products backed by shared UI tokens, strict domain types, and a row-level-secured Supabase product registry with safe local fallbacks.",
    category: "platform",
    status: "released",
    technologies: [
      "Next.js App Router",
      "TypeScript Strict",
      "Turborepo",
      "pnpm Workspaces",
      "Tailwind CSS",
      "Supabase RLS",
    ],
    highlights: [
      "Independent product boundaries within one disciplined monorepo",
      "Zero-credential local fallback for deterministic offline development",
      "Strict PostgreSQL constraints and JWT app_metadata admin RLS policies",
    ],
    screenshotCaption: "Central Portfolio & Product Registry Architecture",
    screenshotPreviewType: "portfolio-architecture",
    externalUrl: "/products",
    externalLabel: "Browse Product Registry",
  },
  {
    id: "proj-developer-toolbox",
    slug: "developer-toolbox-architecture",
    title: "Developer Toolbox — Local-First Web Workbench",
    summary:
      "Zero-upload JSON, XML, CSV, and Base64 utilities executed entirely inside the browser.",
    description:
      "Designed so engineers never have to paste sensitive payloads into third-party servers. Every formatter, parser, and encoder runs deterministically on the client with keyboard-first navigation.",
    category: "developer-toolbox",
    status: "released",
    technologies: ["React 19", "TypeScript", "Web Workers", "Client-Side Parsers"],
    highlights: [
      "100% browser-local execution with no payload telemetry",
      "No registration required for core everyday developer utilities",
      "Independent Next.js app deployable separately from the portfolio",
    ],
    screenshotCaption: "Local-First Parser & Encoding Workbench Blueprint",
    screenshotPreviewType: "developer-toolbox",
    externalUrl: null,
    externalLabel: null,
  },
  {
    id: "proj-document-tools",
    slug: "document-tools-pipeline",
    title: "Document Tools — Privacy-First PDF & Spreadsheet Suite",
    summary:
      "Client-side PDF inspection, Excel conversion, and structured document processing.",
    description:
      "Built for professionals handling confidential invoices, spreadsheets, and reports who require predictable conversions without uploading files to unknown cloud buckets.",
    category: "document-tools",
    status: "planned",
    technologies: ["TypeScript", "WebAssembly", "Stream Processing", "Shared UI"],
    highlights: [
      "Local file processing as the default architectural rule",
      "Clear validation and structured error reporting on malformed files",
      "Modular tool cards sharing Narendra Software design primitives",
    ],
    screenshotCaption: "Client-Side Document Processing Pipeline",
    screenshotPreviewType: "document-tools",
    externalUrl: null,
    externalLabel: null,
  },
  {
    id: "proj-windows-usb-utility",
    slug: "windows-usb-disk-utility",
    title: "Windows Disk & USB Utility (.NET 10 LTS)",
    summary:
      "Planned native Windows utility for verified ISO writing, drive inspection, and safe formatting.",
    description:
      "Isolated inside a dedicated .NET 10 LTS solution to guarantee native Windows API access, explicit UAC elevation boundaries, and hardware write-protection checks before touching removable media.",
    category: "windows-utilities",
    status: "planned",
    technologies: [".NET 10 LTS", "C#", "Win32 Storage APIs", "Isolated Solution"],
    highlights: [
      "Strictly separated from JavaScript pnpm workspaces",
      "Explicit drive verification and checksum validation before writes",
      "Native Windows performance with minimal memory footprint",
    ],
    screenshotCaption: "Native .NET 10 Windows Storage Architecture",
    screenshotPreviewType: "windows-usb",
    externalUrl: null,
    externalLabel: null,
  },
];
