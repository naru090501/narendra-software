import {
  PRICING_MODELS,
  PRODUCT_CATEGORIES,
  PRODUCT_PLATFORMS,
  PRODUCT_STATUSES,
  type Product,
  type ProductCategory,
  type ProductPlatform,
  type ProductPricingModel,
  type ProductRow,
  type ProductStatus,
} from "@narendra/types";

export interface ProductFilterOptions {
  category?: ProductCategory | "all";
  platform?: ProductPlatform | "all";
  pricingModel?: ProductPricingModel | "all";
  query?: string;
  includeArchived?: boolean;
}

export function isValidProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export function isValidProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function isValidProductPlatform(value: string): value is ProductPlatform {
  return (PRODUCT_PLATFORMS as readonly string[]).includes(value);
}

export function isValidPricingModel(value: string): value is ProductPricingModel {
  return (PRICING_MODELS as readonly string[]).includes(value);
}

export function sortProducts(products: readonly Product[]): Product[] {
  return [...products].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.name.localeCompare(b.name);
  });
}

export function filterProducts(
  products: readonly Product[],
  options: ProductFilterOptions = {},
): Product[] {
  const {
    category = "all",
    platform = "all",
    pricingModel = "all",
    query = "",
    includeArchived = false,
  } = options;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (!includeArchived && (product.status === "archived" || product.status === "deprecated")) {
      return false;
    }

    if (category !== "all" && product.category !== category) {
      return false;
    }

    if (platform !== "all" && !product.supportedPlatforms.includes(platform)) {
      return false;
    }

    if (pricingModel !== "all" && product.pricingModel !== pricingModel) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const searchable = `${product.name} ${product.description} ${product.shortDescription ?? ""} ${product.category} ${product.slug}`.toLowerCase();
      if (!searchable.includes(normalizedQuery)) {
        return false;
      }
    }

    return true;
  });

  return sortProducts(filtered);
}

export function getFeaturedProducts(products: readonly Product[]): Product[] {
  return sortProducts(
    products.filter(
      (product) =>
        product.isFeatured &&
        product.status !== "archived" &&
        product.status !== "deprecated",
    ),
  );
}

export function sanitizeHttpUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
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

export function sanitizeRelativeOrHttpUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !/\s/.test(trimmed)) {
    return trimmed;
  }
  return sanitizeHttpUrl(trimmed);
}

export function sanitizeIconUrl(value: string | null | undefined): string | null {
  return sanitizeRelativeOrHttpUrl(value);
}

export function parsePlatforms(
  rawPlatforms?: string[] | null,
): ProductPlatform[] {
  if (!Array.isArray(rawPlatforms) || rawPlatforms.length === 0) {
    return ["web"];
  }
  const valid = rawPlatforms.filter(isValidProductPlatform);
  return valid.length > 0 ? valid : ["web"];
}

export function mapProductRowToProduct(row: ProductRow): Product | null {
  if (!isValidProductCategory(row.category) || !isValidProductStatus(row.status)) {
    return null;
  }

  const pricingModel =
    row.pricing_model && isValidPricingModel(row.pricing_model)
      ? row.pricing_model
      : "free";

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    shortDescription: row.short_description?.trim() || undefined,
    category: row.category,
    url: sanitizeHttpUrl(row.url),
    documentationUrl: sanitizeRelativeOrHttpUrl(row.documentation_url),
    iconUrl: sanitizeIconUrl(row.icon_url),
    status: row.status,
    version: row.version?.trim() || "0.1.0",
    supportedPlatforms: parsePlatforms(row.supported_platforms),
    pricingModel,
    requiresRegistration: Boolean(row.requires_registration),
    requiresCloud: Boolean(row.requires_cloud),
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
