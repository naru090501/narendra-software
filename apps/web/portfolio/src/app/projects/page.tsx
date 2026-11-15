import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Info } from "lucide-react";
import { PROJECT_SHOWCASES } from "@narendra/core";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SectionHeading,
  buttonVariants,
} from "@narendra/ui";
import { ProjectPreview } from "@/components/project-preview";
import { StatusBadge } from "@/components/status-badge";

export const metadata: Metadata = {
  title: "Projects & Architecture",
  description:
    "Explore Narendra Software engineering showcases, architectural blueprints, and active platform initiatives.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="Engineering Portfolio"
        title="Projects & System Architectures"
        description="A transparent view of the software systems currently being engineered at Narendra Software—spanning our central platform, local-first web utilities, and native .NET 10 Windows tooling."
      />

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-border bg-card/80 p-4 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
        <p>
          Each entry below reflects an active internal engineering milestone or
          scoped architecture. We publish verified product states without
          fabricated client logos, testimonials, or completed-project claims.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {PROJECT_SHOWCASES.map((project) => {
          const isInternal = project.externalUrl?.startsWith("/");
          return (
            <Card
              key={project.id}
              className="flex flex-col justify-between border-border/80"
            >
              <div>
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="min-w-0 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {project.category === "platform"
                        ? "Core Platform"
                        : project.category}
                    </span>
                    <StatusBadge status={project.status} />
                  </div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <ProjectPreview
                    type={project.screenshotPreviewType}
                    caption={project.screenshotCaption}
                  />

                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Engineering Highlights
                    </h3>
                    <ul className="space-y-1.5 text-sm text-foreground/90">
                      {project.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                          />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {project.technologies.map((tech) => (
                      <Badge key={tech} variant="default">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </div>

              {project.externalUrl ? (
                <CardFooter className="border-t border-border/60 pt-4">
                  {isInternal ? (
                    <Link
                      href={project.externalUrl}
                      className={buttonVariants({
                        variant: "primary",
                        size: "sm",
                      })}
                    >
                      {project.externalLabel ?? "Explore"}
                    </Link>
                  ) : (
                    <a
                      href={project.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      {project.externalLabel ?? "Open Link"}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </CardFooter>
              ) : null}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
