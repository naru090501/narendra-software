import {
  PRODUCT_CATEGORIES,
  PRODUCT_STATUSES,
  type Product,
  type ProductCategory,
  type ProductRow,
  type ProductStatus,
} from "@narendra/types";

export interface ProductFilterOptions {
  category?: ProductCategory | "all";
  query?: string;
  includeArchived?: boolean;
}

export function isValidProductCategory(value: string): value is ProductCategory {
  return (PRODUCT_CATEGORIES as readonly string[]).includes(value);
}

export function isValidProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
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
  const { category = "all", query = "", includeArchived = false } = options;
  const normalizedQuery = query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (!includeArchived && product.status === "archived") {
      return false;
    }

    if (category !== "all" && product.category !== category) {
      return false;
    }

    if (normalizedQuery.length > 0) {
      const searchable = `${product.name} ${product.description} ${product.category} ${product.slug}`.toLowerCase();
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
    products.filter((product) => product.isFeatured && product.status !== "archived"),
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

export function sanitizeIconUrl(value: string | null | undefined): string | null {
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

export function mapProductRowToProduct(row: ProductRow): Product | null {
  if (!isValidProductCategory(row.category) || !isValidProductStatus(row.status)) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    url: sanitizeHttpUrl(row.url),
    iconUrl: sanitizeIconUrl(row.icon_url),
    status: row.status,
    isFeatured: row.is_featured,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
