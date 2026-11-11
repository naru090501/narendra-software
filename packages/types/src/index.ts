export const PRODUCT_CATEGORIES = [
  "developer-toolbox",
  "document-tools",
  "image-tools",
  "security-tools",
  "ai-tools",
  "windows-utilities",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_STATUSES = [
  "planned",
  "in-development",
  "beta",
  "live",
  "archived",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type PublicProductStatus = Exclude<ProductStatus, "archived">;

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ProductCategory;
  url: string | null;
  iconUrl: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  url: string | null;
  icon_url: string | null;
  status: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoryMeta {
  id: ProductCategory;
  label: string;
  shortLabel: string;
  description: string;
  iconKey: "code" | "file-text" | "image" | "shield" | "sparkles" | "monitor";
}

export interface ProjectShowcase {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  category: ProductCategory | "platform";
  status: PublicProductStatus;
  technologies: string[];
  highlights: string[];
  screenshotCaption: string;
  screenshotPreviewType:
    | "portfolio-architecture"
    | "developer-toolbox"
    | "document-tools"
    | "windows-usb";
  externalUrl: string | null;
  externalLabel: string | null;
}

export type CatalogSource = "supabase" | "local-fallback";

export interface ProductCatalogResult {
  products: Product[];
  source: CatalogSource;
  notice?: string;
}

export interface ContactFormInput {
  name: string;
  email: string;
  organization: string;
  topic: "product-feedback" | "collaboration" | "enterprise-inquiry" | "general";
  message: string;
}

export type ContactValidationErrors = Partial<Record<keyof ContactFormInput, string>>;
