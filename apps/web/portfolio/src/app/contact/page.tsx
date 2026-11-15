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
    "Get in touch with Narendra Software for feedback, suggestions, or questions about these free tools.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact Narendra Software"
        description="Have feedback on an upcoming tool, a feature suggestion, or a question about this personal software project? Prepare your message below."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-5">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Direct Channels</CardTitle>
              <CardDescription>
                Reach out regarding tool feedback, feature ideas, or general
                questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">Email</p>
                  <a
                    href="mailto:contact@narendrasoftware.com"
                    className="break-all text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
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
                  <p className="font-medium text-foreground">Project</p>
                  <p className="text-muted-foreground">
                    Narendra Software &bull; Personal Project
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
                    utilities, and community feedback.
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
