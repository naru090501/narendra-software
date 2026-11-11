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
  archived: {
    label: "Archived",
    description: "Retired or superseded.",
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
 * Independent product URLs remain `null` until explicitly configured via env
 * (e.g. `NEXT_PUBLIC_DEV_TOOLS_URL`), avoiding unverified production URL claims.
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
      category: "developer-toolbox",
      url: devToolsUrl,
      iconUrl: null,
      status: "in-development",
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
      category: "document-tools",
      url: null,
      iconUrl: null,
      status: "in-development",
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
      category: "image-tools",
      url: null,
      iconUrl: null,
      status: "planned",
      isFeatured: true,
      sortOrder: 30,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: "00000000-0000-4000-8000-000000000104",
      name: "Security Tools",
      slug: "security-tools",
      description:
        "Client-side cryptographic hashing, checksum verification, entropy analysis, and privacy-preserving inspection utilities.",
      category: "security-tools",
      url: null,
      iconUrl: null,
      status: "planned",
      isFeatured: false,
      sortOrder: 40,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: "00000000-0000-4000-8000-000000000105",
      name: "AI Tools",
      slug: "ai-tools",
      description:
        "Selectively AI-powered workflows for structured transformation, summarization, and technical productivity where AI adds real value.",
      category: "ai-tools",
      url: null,
      iconUrl: null,
      status: "planned",
      isFeatured: false,
      sortOrder: 50,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
    {
      id: "00000000-0000-4000-8000-000000000106",
      name: "Windows Disk & USB Utility",
      slug: "windows-disk-usb-utility",
      description:
        "Native .NET 10 Windows utility for verified bootable USB creation, partition inspection, and safe drive formatting.",
      category: "windows-utilities",
      url: null,
      iconUrl: null,
      status: "planned",
      isFeatured: true,
      sortOrder: 60,
      createdAt: SEED_TIMESTAMP,
      updatedAt: SEED_TIMESTAMP,
    },
  ];
}

export const DEFAULT_PRODUCTS: Product[] = getDefaultProducts();

/**
 * Truthful engineering showcases representing active platform foundations
 * and scoped product architectures — never fabricated client case studies.
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
    status: "in-development",
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
    status: "in-development",
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
    status: "in-development",
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
