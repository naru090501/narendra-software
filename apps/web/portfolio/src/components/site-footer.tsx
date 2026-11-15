import Link from "next/link";
import { PRODUCT_CATEGORY_LIST } from "@narendra/core";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 md:gap-10">
          <div className="min-w-0 space-y-3 sm:col-span-2">
            <p className="text-base font-semibold tracking-tight text-foreground">
              Narendra Software
            </p>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              A personal software project building focused, 100% free web
              utilities and native Windows applications with privacy-first local
              processing as the default. Free for everyone, with zero forced accounts.
            </p>
            <p className="text-xs text-muted-foreground">
              No mandatory sign-ups, paywalls, or telemetry for everyday tools.
              Independent utilities built with quality and care.
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
              Navigation
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
          <p>&copy; {new Date().getFullYear()} Narendra Software. Free and open software for everyone.</p>
          <p>Personal Project &bull; Local-First Architecture</p>
        </div>
      </div>
    </footer>
  );
}
