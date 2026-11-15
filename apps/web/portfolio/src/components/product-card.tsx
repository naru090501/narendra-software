import { ArrowUpRight, BookOpen, Clock, Globe, Info, Monitor, Tag } from "lucide-react";
import { PRODUCT_CATEGORY_META, getProductRelease } from "@narendra/core";
import type { Product } from "@narendra/types";
import {
  Badge,
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
  const releaseInfo = getProductRelease(product.slug);
  const isUnfinished =
    product.status === "planned" ||
    product.status === "in-development" ||
    product.status === "in_development";

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
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {categoryMeta.label}
              </p>
              <span className="text-xs text-muted-foreground/60">•</span>
              <span className="font-mono text-[11px] text-muted-foreground">v{product.version}</span>
            </div>
            <CardTitle className="text-xl sm:text-2xl">{product.name}</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-5 pb-5 sm:px-6 sm:pb-6">
          <CardDescription className="text-sm leading-relaxed">{product.description}</CardDescription>

          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {product.supportedPlatforms.map((platform) => (
              <Badge key={platform} variant="default" className="gap-1 min-h-6 px-2 py-0.5 text-[11px] font-normal">
                {platform === "windows" ? (
                  <Monitor className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Globe className="h-3 w-3" aria-hidden="true" />
                )}
                {platform === "windows" ? "Windows Native" : "Web Local"}
              </Badge>
            ))}
            <Badge variant="emerald" className="min-h-6 px-2 py-0.5 text-[11px] font-normal">
              {product.pricingModel === "free" ? "100% Free" : product.pricingModel}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p
              className="break-words font-mono text-xs text-muted-foreground [overflow-wrap:anywhere]"
              title={product.url ?? undefined}
            >
              {product.url
                ? formatDisplayHost(product.url)
                : "Independent URL pending deployment"}
            </p>

            {product.documentationUrl ? (
              <a
                href={product.documentationUrl}
                className="inline-flex items-center gap-1 font-sans text-xs text-muted-foreground hover:text-accent"
              >
                <BookOpen className="h-3 w-3" aria-hidden="true" />
                Docs
              </a>
            ) : null}
          </div>

          {releaseInfo ? (
            <div className="pt-2 border-t border-border/50 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <Tag className="h-3 w-3" aria-hidden="true" />
                  v{releaseInfo.version} ({releaseInfo.updateInfo.channel})
                </span>
                <span>{releaseInfo.releaseDate}</span>
              </div>
              {releaseInfo.releaseNotes.length > 0 ? (
                <details className="mt-1.5 cursor-pointer text-muted-foreground group">
                  <summary className="text-[11px] font-medium text-foreground/80 hover:text-accent list-none flex items-center gap-1">
                    <Info className="h-3 w-3" aria-hidden="true" />
                    <span>View Release Notes</span>
                  </summary>
                  <ul className="mt-1.5 space-y-1 pl-4 list-disc text-[11px] leading-relaxed text-muted-foreground/90">
                    {releaseInfo.releaseNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          ) : null}
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
                {product.status === "in-development" || product.status === "in_development"
                  ? "currently in development"
                  : "planned"}
                .
              </p>
            ) : null}
          </>
        ) : (
          <div className="flex min-h-10 items-center justify-between gap-2.5 rounded-xl border border-dashed border-border/80 bg-muted/40 px-3.5 py-2.5 text-xs leading-normal text-muted-foreground">
            <span className="min-w-0 break-words font-medium">
              {product.status === "released" || product.status === "live"
                ? "Standalone deployment active"
                : product.status === "in-development" || product.status === "in_development"
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
