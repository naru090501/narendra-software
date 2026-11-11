import Link from "next/link";
import { PRODUCT_CATEGORY_LIST } from "@narendra/core";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3 md:col-span-2">
            <p className="text-base font-semibold tracking-tight text-foreground">
              Narendra Software
            </p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              A software product organization building focused, independent web
              utilities and native Windows applications with privacy-first local
              processing as the default.
            </p>
            <p className="text-xs text-muted-foreground">
              No mandatory sign-up for everyday utilities. Independent
              deployments backed by a unified platform foundation.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Ecosystem
            </h3>
            <ul className="space-y-2 text-sm">
              {PRODUCT_CATEGORY_LIST.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/products?category=${category.id}`}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Product Registry
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Projects &amp; Architecture
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About &amp; Vision
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Narendra Software. All rights reserved.</p>
          <p>Central Portfolio &bull; Platform Foundation</p>
        </div>
      </div>
    </footer>
  );
}
