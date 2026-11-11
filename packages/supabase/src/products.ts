import {
  filterProducts,
  getDefaultProducts,
  mapProductRowToProduct,
} from "@narendra/core";
import type { Product, ProductCatalogResult, ProductRow } from "@narendra/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicSupabaseClient, getSupabasePublicConfig } from "./client.js";

export interface FetchProductCatalogOptions {
  client?: SupabaseClient | null;
  env?: Record<string, string | undefined>;
}

const PRODUCT_SELECT_COLUMNS =
  "id, name, slug, description, category, url, icon_url, status, is_featured, sort_order, created_at, updated_at";

const PUBLIC_PRODUCT_STATUSES = [
  "planned",
  "in-development",
  "beta",
  "live",
] as const;

export async function fetchProductCatalog(
  options: FetchProductCatalogOptions = {},
): Promise<ProductCatalogResult> {
  const fallbackProducts = filterProducts(getDefaultProducts(options.env));

  const client =
    options.client !== undefined
      ? options.client
      : createPublicSupabaseClient(getSupabasePublicConfig(options.env));

  if (!client) {
    return {
      products: fallbackProducts,
      source: "local-fallback",
      notice:
        "Supabase credentials are not configured; displaying the built-in local product catalog.",
    };
  }

  try {
    const { data, error } = await client
      .from("products")
      .select(PRODUCT_SELECT_COLUMNS)
      .in("status", [...PUBLIC_PRODUCT_STATUSES])
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      return {
        products: fallbackProducts,
        source: "local-fallback",
        notice:
          "Unable to query Supabase products registry; displaying the built-in local product catalog.",
      };
    }

    const rows = (data ?? []) as ProductRow[];
    const mapped = rows
      .map(mapProductRowToProduct)
      .filter((item): item is Product => item !== null);

    if (mapped.length === 0) {
      return {
        products: fallbackProducts,
        source: "local-fallback",
        notice:
          "Supabase registry returned no active products yet; displaying the built-in local product catalog.",
      };
    }

    return {
      products: filterProducts(mapped),
      source: "supabase",
    };
  } catch {
    return {
      products: fallbackProducts,
      source: "local-fallback",
      notice:
        "Supabase registry is unreachable; displaying the built-in local product catalog.",
    };
  }
}
