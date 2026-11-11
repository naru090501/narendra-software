"use client";

import { useMemo, useState } from "react";
import { Database, Info, Search, X } from "lucide-react";
import {
  PRODUCT_CATEGORY_LIST,
  filterProducts,
} from "@narendra/core";
import type {
  CatalogSource,
  Product,
  ProductCategory,
} from "@narendra/types";
import { Badge, Button, Input, cn } from "@narendra/ui";
import { ProductCard } from "./product-card";

interface ProductsExplorerProps {
  products: Product[];
  source: CatalogSource;
  notice?: string;
  initialCategory?: ProductCategory | "all";
  initialQuery?: string;
}

export function ProductsExplorer({
  products,
  source,
  notice,
  initialCategory = "all",
  initialQuery = "",
}: ProductsExplorerProps) {
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | "all"
  >(initialCategory);
  const [query, setQuery] = useState(initialQuery);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const cat of PRODUCT_CATEGORY_LIST) {
      counts[cat.id] = products.filter((p) => p.category === cat.id).length;
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      filterProducts(products, {
        category: selectedCategory,
        query,
      }),
    [products, selectedCategory, query],
  );

  function resetFilters() {
    setSelectedCategory("all");
    setQuery("");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground sm:items-center">
          {source === "supabase" ? (
            <Database
              className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:mt-0"
              aria-hidden="true"
            />
          ) : (
            <Info
              className="mt-0.5 h-4 w-4 shrink-0 text-accent sm:mt-0"
              aria-hidden="true"
            />
          )}
          <span>
            {source === "supabase"
              ? "Live registry connected to Supabase (narendramain)."
              : notice ??
                "Displaying local development catalog fallback (Supabase not configured)."}
          </span>
        </div>
        <Badge variant={source === "supabase" ? "emerald" : "navy"}>
          {filteredProducts.length} of {products.length} products
        </Badge>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter products by category"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
              selectedCategory === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span>All</span>
            <span className="opacity-75">({categoryCounts.all ?? 0})</span>
          </button>

          {PRODUCT_CATEGORY_LIST.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                aria-pressed={active}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{category.shortLabel}</span>
                <span className="opacity-75">
                  ({categoryCounts[category.id] ?? 0})
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="pl-9 pr-9"
          />
          {query.length > 0 ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
          <p className="text-base font-medium text-foreground">
            No products match your current filter.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing your search term or switching back to all categories.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={resetFilters}
            className="mt-5"
          >
            Reset filters
          </Button>
        </div>
      )}
    </div>
  );
}
