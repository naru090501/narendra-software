import { ArrowUpRight, Clock } from "lucide-react";
import { PRODUCT_CATEGORY_META } from "@narendra/core";
import type { Product } from "@narendra/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  buttonVariants,
  cn,
} from "@narendra/ui";
import { CategoryIcon } from "./category-icon";
import { StatusBadge } from "./status-badge";

function formatDisplayHost(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.host}${parsed.pathname === "/" ? "" : parsed.pathname}`;
  } catch {
    return url;
  }
}

export function ProductCard({ product }: { product: Product }) {
  const categoryMeta = PRODUCT_CATEGORY_META[product.category];
  const isUnfinished =
    product.status === "planned" || product.status === "in-development";

  return (
    <Card className="flex h-full flex-col justify-between border-border/80 bg-card/90 hover:border-accent/50 hover:shadow-md">
      <div className="min-w-0">
        <CardHeader className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <CategoryIcon
                category={product.category}
                iconUrl={product.iconUrl}
                productName={product.name}
                className="h-5 w-5"
              />
            </div>
            <StatusBadge status={product.status} />
          </div>

          <div className="min-w-0 space-y-1.5 pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {categoryMeta.label}
            </p>
            <CardTitle className="text-xl sm:text-2xl">{product.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
          <CardDescription className="text-sm leading-relaxed">{product.description}</CardDescription>
          <p
            className="break-words font-mono text-xs text-muted-foreground [overflow-wrap:anywhere]"
            title={product.url ?? undefined}
          >
            {product.url
              ? formatDisplayHost(product.url)
              : "Independent URL pending deployment"}
          </p>
        </CardContent>
      </div>

      <CardFooter className="mt-auto flex flex-col items-stretch gap-2.5 border-t border-border/60 p-5 sm:p-6">
        {product.url ? (
          <>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({
                  variant: isUnfinished ? "outline" : "primary",
                  size: "md",
                }),
                "w-full justify-between min-h-10",
              )}
            >
              <span>Open Product</span>
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
            {isUnfinished ? (
              <p className="text-[11px] leading-snug text-muted-foreground">
                Configured preview endpoint — product is{" "}
                {product.status === "in-development"
                  ? "currently in development"
                  : "planned"}
                .
              </p>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-10 items-center justify-between gap-2.5 rounded-xl border border-dashed border-border/80 bg-muted/40 px-3.5 py-2.5 text-xs leading-normal text-muted-foreground">
            <span className="min-w-0 break-words font-medium">
              {product.status === "in-development"
                ? "Standalone deployment pending"
                : "Planned — URL not yet assigned"}
            </span>
            <Clock className="h-4 w-4 shrink-0 opacity-75" aria-hidden="true" />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
