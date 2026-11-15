import type { ProductReleaseInfo } from "@narendra/types";

/**
 * Practical, static release information registry for Narendra Software products (Sprint 5).
 * Encapsulates versioning, release dates, release notes, and update channels without
 * requiring complex or unnecessary automated update server infrastructure.
 */
export const INITIAL_PRODUCT_RELEASES: ProductReleaseInfo[] = [
  {
    productSlug: "developer-toolbox",
    productName: "Developer Toolbox",
    version: "0.1.0",
    releaseDate: "2026-11-15",
    releaseStatus: "released",
    title: "Initial Developer Utilities Release",
    releaseNotes: [
      "Client-side JSON formatter, validator, and minifier with large payload warnings.",
      "XML formatter with DOMParser validation and indentation control.",
      "RFC-4180 compliant CSV to JSON and JSON to CSV bidirectional converter.",
      "Base64 encoder and decoder with standard and URL-safe base64url alphabet support.",
      "Multi-task text transformation pipeline supporting simultaneous case conversions, special character removal, space handling, line sorting, and deduplication.",
      "Responsive UI controls with keyboard accessibility and high-contrast dark mode support.",
    ],
    updateInfo: {
      channel: "stable",
      webUrl: "https://devtools.narendrasoftware.com",
    },
  },
  {
    productSlug: "document-tools",
    productName: "Document Tools",
    version: "0.1.0",
    releaseDate: "2026-12-01",
    releaseStatus: "planned",
    title: "Document Tools Preview Specification",
    releaseNotes: [
      "Planned client-side PDF metadata inspection and page extraction.",
      "Structured document conversion (Markdown, HTML, text).",
      "Spreadsheet inspection utilities with zero external server upload.",
    ],
    updateInfo: {
      channel: "preview",
    },
  },
  {
    productSlug: "image-tools",
    productName: "Image Tools",
    version: "0.1.0",
    releaseDate: "2026-12-15",
    releaseStatus: "planned",
    title: "Image Tools Preview Specification",
    releaseNotes: [
      "Browser-native Canvas and WebAssembly image format conversion (PNG, JPEG, WebP, AVIF).",
      "Lossless compression and dimension resizing.",
      "EXIF metadata cleanup to protect user privacy.",
    ],
    updateInfo: {
      channel: "preview",
    },
  },
  {
    productSlug: "windows-disk-usb-utility",
    productName: "Windows Disk & USB Utility",
    version: "0.1.0",
    releaseDate: "2027-01-15",
    releaseStatus: "planned",
    title: "Native Windows .NET 10 Utility Specification",
    releaseNotes: [
      "Native .NET 10 Windows desktop interface with WinUI 3 controls.",
      "Verified bootable USB creation and ISO flashing with checksum verification.",
      "Non-destructive partition inspection and safe drive formatting.",
    ],
    updateInfo: {
      channel: "preview",
      downloadUrl: null,
    },
  },
];

export function getProductRelease(slug: string): ProductReleaseInfo | undefined {
  return INITIAL_PRODUCT_RELEASES.find((r) => r.productSlug === slug);
}

export function getAllProductReleases(): ProductReleaseInfo[] {
  return [...INITIAL_PRODUCT_RELEASES];
}
