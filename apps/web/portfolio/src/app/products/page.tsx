import type { Metadata } from "next";
import { isValidProductCategory } from "@narendra/core";
import { fetchProductCatalog } from "@narendra/supabase";
import { SectionHeading } from "@narendra/ui";
import { ProductsExplorer } from "@/components/products-explorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore the Narendra Software product registry across Developer Toolbox, Document Tools, Image Tools, Security Tools, AI Tools, and Windows Utilities.",
};

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const initialCategory =
    params.category && isValidProductCategory(params.category)
      ? params.category
      : "all";
  const initialQuery = params.q?.trim() ?? "";

  const catalog = await fetchProductCatalog();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="Product Directory"
        title="Narendra Software Ecosystem"
        description="Browse every product registered on our platform. Each product runs as an independent application with transparent release status—planned and in-development items are marked clearly."
      />

      <div className="mt-10">
        <ProductsExplorer
          products={catalog.products}
          source={catalog.source}
          notice={catalog.notice}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
        />
      </div>
    </div>
  );
}
