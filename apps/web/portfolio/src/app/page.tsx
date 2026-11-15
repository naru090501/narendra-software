import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Database,
  Layers,
  Lock,
  Monitor,
  Terminal,
} from "lucide-react";
import {
  PRODUCT_CATEGORY_LIST,
  PROJECT_SHOWCASES,
  getFeaturedProducts,
} from "@narendra/core";
import { fetchProductCatalog } from "@narendra/supabase";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SectionHeading,
  buttonVariants,
  cn,
} from "@narendra/ui";
import { CategoryIcon } from "@/components/category-icon";
import { ProductCard } from "@/components/product-card";
import { ProjectPreview } from "@/components/project-preview";
import { StatusBadge } from "@/components/status-badge";

export const dynamic = "force-dynamic";

const TECH_STACK = [
  {
    name: "Next.js & React 19",
    role: "Independent Web Applications",
    detail:
      "Each web product deploys independently on App Router with strict TypeScript and accessible UI primitives.",
    icon: Layers,
  },
  {
    name: "Local-First Processing",
    role: "Privacy by Architecture",
    detail:
      "Developer, document, and image utilities execute client-side by default without unnecessary file uploads.",
    icon: Lock,
  },
  {
    name: "Supabase (narendramain)",
    role: "Central Platform Registry",
    detail:
      "Shared PostgreSQL product registry protected by Row Level Security with deterministic local fallback.",
    icon: Database,
  },
  {
    name: ".NET 10 LTS",
    role: "Native Windows Utilities",
    detail:
      "Dedicated C#/.NET solution kept isolated from pnpm workspaces for future disk and USB engineering.",
    icon: Monitor,
  },
] as const;

export default async function HomePage() {
  const catalog = await fetchProductCatalog();
  const featuredProducts = getFeaturedProducts(catalog.products);
  const featuredShowcases = PROJECT_SHOWCASES.slice(0, 2);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-[#071226] text-slate-100">
        <div className="bg-navy-grid absolute inset-0 opacity-80" aria-hidden="true" />
        <div
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-3xl space-y-6">
            <Badge
              variant="navy"
              className="max-w-full min-h-8 border-sky-400/30 bg-sky-400/10 px-3.5 py-1.5 text-left text-xs font-medium text-sky-300 sm:whitespace-nowrap"
            >
              <Terminal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Narendra Software &bull; Personal Project &bull; 100% Free Tools</span>
            </Badge>

            <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Focused software tools, engineered for privacy and clarity.
            </h1>

            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              A personal software project crafting independent web utilities and native
              Windows applications—free and open for everyone. Built with local-first
              privacy as the default across developer toolkits, document workflows, image
              tools, security utilities, and .NET 10 desktop software.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "accent", size: "lg" }),
                  "font-semibold",
                )}
              >
                Explore Products
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex min-h-11 max-w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-center text-sm font-medium leading-snug text-slate-100 transition-colors hover:bg-slate-800 sm:px-6 sm:text-base"
              >
                View Architecture &amp; Projects
              </Link>
            </div>

            <div className="grid gap-3 pt-6 text-xs text-slate-300 sm:grid-cols-3">
              <div className="flex items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-sky-400"
                  aria-hidden="true"
                />
                <span>Local processing by default</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-sky-400"
                  aria-hidden="true"
                />
                <span>No forced login for free utilities</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-slate-800/90 bg-slate-900/50 px-3.5 py-2.5">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-sky-400"
                  aria-hidden="true"
                />
                <span>Independent product deployments</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Product Registry"
            title="Featured products on the roadmap"
            description="Every product is scoped as a dedicated, independently deployable application. Unfinished products are clearly marked with their active build status."
          />
          <Link
            href="/products"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            View all products
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Product Categories */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            eyebrow="Ecosystem Pillars"
            title="Six product categories under one standard"
            description="From browser-local developer parsers to native .NET 10 Windows utilities, each category solves practical daily engineering and productivity problems."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_CATEGORY_LIST.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="h-full border-border/80 bg-card transition-all group-hover:border-accent/50 group-hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                      <CategoryIcon category={category.id} className="h-5 w-5" />
                    </div>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>{category.label}</span>
                      <ArrowRight
                        className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent"
                        aria-hidden="true"
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Project Showcase Preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="Engineering Showcase"
            title="Platform foundations and active architectures"
            description="Inspect how the central platform, local-first web utilities, and isolated .NET 10 Windows solution fit together."
          />
          <Link
            href="/projects"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            All showcases
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {featuredShowcases.map((project) => (
            <Card key={project.id} className="overflow-hidden border-border/80">
              <CardHeader className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    {project.category === "platform"
                      ? "Core Platform"
                      : project.category}
                  </span>
                  <StatusBadge status={project.status} />
                </div>
                <CardTitle>{project.title}</CardTitle>
                <CardDescription>{project.summary}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProjectPreview
                  type={project.screenshotPreviewType}
                  caption={project.screenshotCaption}
                />
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="default">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Technology Overview */}
      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <SectionHeading
            eyebrow="Architecture Stack"
            title="Built for clean boundaries and independent scale"
            description="Shared design tokens and domain contracts keep products consistent without creating fragile monoliths."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.name} className="border-border/80">
                  <CardHeader className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-accent">
                        {item.role}
                      </p>
                      <CardTitle className="mt-1 text-base">
                        {item.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{item.detail}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact / Collaboration CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-sky-400/25 bg-[#08152c] px-6 py-12 text-slate-100 shadow-lg sm:px-12">
          <div className="bg-navy-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                <Cpu className="h-4 w-4" aria-hidden="true" />
                Connect with Narendra Software
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Have feedback, suggestions, or ideas for these free tools?
              </h2>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                Share feedback on upcoming developer, document, or Windows
                utilities, suggest new features, or connect with the project.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className={buttonVariants({ variant: "accent", size: "lg" })}
              >
                Get in Touch
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-11 max-w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-center text-sm font-medium leading-snug text-slate-100 transition-colors hover:bg-slate-800 sm:px-6 sm:text-base"
              >
                Our Vision
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
