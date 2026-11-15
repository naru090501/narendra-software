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
  "in_development",
  "in-development",
  "beta",
  "released",
  "live",
  "deprecated",
  "archived",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type PublicProductStatus = Exclude<ProductStatus, "archived" | "deprecated">;

export const PRODUCT_PLATFORMS = [
  "web",
  "windows",
  "linux",
  "macos",
  "android",
  "ios",
] as const;

export type ProductPlatform = (typeof PRODUCT_PLATFORMS)[number];

export const PRICING_MODELS = [
  "free",
  "open-source",
  "freemium",
  "paid",
] as const;

export type ProductPricingModel = (typeof PRICING_MODELS)[number];

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: ProductCategory;
  url: string | null;
  documentationUrl: string | null;
  iconUrl: string | null;
  status: ProductStatus;
  version: string;
  supportedPlatforms: ProductPlatform[];
  pricingModel: ProductPricingModel;
  requiresRegistration: boolean;
  requiresCloud: boolean;
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
  short_description?: string | null;
  category: string;
  url: string | null;
  documentation_url?: string | null;
  icon_url: string | null;
  status: string;
  version?: string | null;
  supported_platforms?: string[] | null;
  pricing_model?: string | null;
  requires_registration?: boolean | null;
  requires_cloud?: boolean | null;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductReleaseInfo {
  productSlug: string;
  productName: string;
  version: string;
  releaseDate: string;
  releaseStatus: ProductStatus;
  title: string;
  releaseNotes: string[];
  updateInfo: {
    channel: "stable" | "beta" | "preview";
    downloadUrl?: string | null;
    webUrl?: string | null;
  };
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

export const CONTACT_TOPICS = [
  "product-feedback",
  "collaboration",
  "enterprise-inquiry",
  "general",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ContactFormInput {
  name: string;
  email: string;
  organization?: string;
  topic: ContactTopic;
  message: string;
  honeypot?: string;
}

export type ContactValidationErrors = Partial<Record<keyof ContactFormInput, string>>;

// ----------------------------------------------------------------------------
// Rate Limiting Types
// ----------------------------------------------------------------------------

export interface RateLimitPolicy {
  action: string;
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: string;
  retryAfterSeconds: number;
  source: "supabase" | "in-memory-fallback";
  bucketKey: string;
  isConfigurationError?: boolean;
  warning?: string;
}

export interface ContactSubmissionResult {
  success: boolean;
  message: string;
  deliveryId?: string;
  retryAfter?: number;
  errors?: ContactValidationErrors;
}

// ----------------------------------------------------------------------------
// Phase 3 & 4: Extensible Contact Channels & Shared Platform Configuration
// ----------------------------------------------------------------------------

export const CONTACT_CHANNEL_TYPES = [
  "email",
  "contact-form",
  "whatsapp",
  "phone",
  "github",
  "linkedin",
  "x",
] as const;

export type ContactChannelType = (typeof CONTACT_CHANNEL_TYPES)[number];

export interface ContactChannel {
  id: string;
  type: ContactChannelType;
  label: string;
  destination: string | null;
  actionUrl: string | null;
  isEnabled: boolean;
  displayOrder: number;
  description?: string;
  visibility?: "public" | "inquiry-only" | "footer-only";
}

export interface CompanyInfo {
  legalName: string;
  displayName: string;
  tagline: string;
  foundedYear: number;
  headquarters: string;
  contactEmail: string;
  websiteUrl: string;
  githubUrl: string;
  privacyCommitment: string;
}

export interface FeatureFlagConfig {
  enableSupabaseRegistry: boolean;
  enableContactEmailDelivery: boolean;
  enableWhatsAppChannel: boolean;
  enableCommunityChat: boolean;
}

export interface PlatformConfig {
  company: CompanyInfo;
  features: FeatureFlagConfig;
  channels: ContactChannel[];
  products: {
    developerToolboxUrl: string | null;
    defaultDocumentationBaseUrl: string;
  };
}
