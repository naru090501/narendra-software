import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Cpu,
  Lock,
  Layers,
  ShieldCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SectionHeading,
  buttonVariants,
} from "@narendra/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Narendra Software's product-building vision, local-first architecture, and engineering principles.",
};

const PRINCIPLES = [
  {
    title: "Local Processing by Default",
    description:
      "Utility tools should not force users to upload confidential payloads, documents, or images to remote servers when the browser or native desktop hardware can process them locally.",
    icon: Lock,
  },
  {
    title: "Zero Friction for Free Tools",
    description:
      "Visitors should never have to register an account just to format JSON, inspect a PDF, or convert an image. Core utilities remain accessible without login gates.",
    icon: ShieldCheck,
  },
  {
    title: "Independent Products, One Standard",
    description:
      "Each product in our ecosystem is designed to be deployed and evolved independently while sharing strict TypeScript contracts, accessible UI components, and consistent quality.",
    icon: Layers,
  },
  {
    title: "Right Runtime for the Job",
    description:
      "Web utilities run on Next.js, React, and TypeScript; low-level hardware and Windows storage utilities are cleanly separated into an isolated .NET 10 LTS solution.",
    icon: Cpu,
  },
] as const;

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <section className="max-w-3xl space-y-5">
        <SectionHeading
          eyebrow="About Narendra Software"
          title="Building focused, dependable software tools under one brand"
          description="Narendra Software is a software product organization dedicated to creating practical, well-crafted utilities for developers, technical teams, and everyday Windows and web users."
        />
        <p className="text-base leading-relaxed text-muted-foreground">
          Rather than bundling unrelated features into bloated suites or hiding
          simple utilities behind mandatory sign-up walls, we build focused
          applications—each dedicated to doing its core job reliably, quickly,
          and transparently.
        </p>
      </section>

      <section className="space-y-8">
        <SectionHeading
          eyebrow="Product Philosophy"
          title="Engineering principles that guide every release"
          description="These rules shape how we design, scope, and ship products across our web and Windows platforms."
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title} className="border-border/80">
                <CardHeader className="space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{principle.description}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-10">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              <Compass className="h-4 w-4" aria-hidden="true" />
              Roadmap Transparency
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Honest status at every stage
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Our central product registry tracks every application from early
              planning through active engineering and public release. Explore
              what is currently in development or reach out with product ideas.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className={buttonVariants({ variant: "primary" })}
            >
              Explore Product Registry
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: "outline" })}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
