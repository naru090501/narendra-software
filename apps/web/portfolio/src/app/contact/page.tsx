import type { Metadata } from "next";
import { Building2, Clock, Mail, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  SectionHeading,
} from "@narendra/ui";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Narendra Software for product feedback, collaboration, or technical inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact Narendra Software"
        description="Have feedback on an upcoming tool, a technical collaboration proposal, or a question about our product ecosystem? Prepare your inquiry below."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="space-y-5">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Direct Channels</CardTitle>
              <CardDescription>
                Reach out regarding product roadmaps, partnerships, or platform
                inquiries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a
                    href="mailto:contact@narendrasoftware.com"
                    className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    contact@narendrasoftware.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Building2
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-foreground">Organization</p>
                  <p className="text-muted-foreground">
                    Narendra Software &bull; Product Studio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageSquare
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-foreground">Inquiry Scope</p>
                  <p className="text-muted-foreground">
                    Developer tools, document workflows, native Windows
                    utilities, and collaborations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div>
                  <p className="font-medium text-foreground">Form Status</p>
                  <p className="text-muted-foreground">
                    Client-side validation active; backend mail integration
                    planned in an upcoming milestone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 lg:col-span-2">
          <CardHeader>
            <CardTitle>Send an Inquiry</CardTitle>
            <CardDescription>
              All fields marked with * are validated before preparing your
              message summary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
