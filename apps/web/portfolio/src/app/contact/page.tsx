import type { Metadata } from "next";
import { Building2, CheckCircle, Clock, Code2, ExternalLink, Mail, MessageSquare, PhoneCall } from "lucide-react";
import {
  DEFAULT_CONTACT_CHANNELS,
} from "@narendra/core";
import {
  Badge,
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
    "Get in touch with Narendra Software for feedback, suggestions, or technical inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="Get in Touch"
        title="Contact Narendra Software"
        description="Have feedback on an upcoming tool, a bug report, or a collaboration inquiry? Send a message through our secure contact system."
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <div className="min-w-0 space-y-5">
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-base">Communication Channels</CardTitle>
              <CardDescription>
                Available and planned channels configured across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {DEFAULT_CONTACT_CHANNELS.map((channel) => (
                <div key={channel.id} className="flex items-start gap-3">
                  {channel.type === "email" ? (
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  ) : channel.type === "github" ? (
                    <Code2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  ) : channel.type === "whatsapp" ? (
                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : channel.type === "phone" ? (
                    <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground">{channel.label}</p>
                      {channel.isEnabled ? (
                        <Badge variant="emerald" className="min-h-5 px-2 py-0 text-[10px]">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="slate" className="min-h-5 px-2 py-0 text-[10px]">
                          Planned
                        </Badge>
                      )}
                    </div>
                    {channel.actionUrl ? (
                      <a
                        href={channel.actionUrl}
                        target={channel.actionUrl.startsWith("http") ? "_blank" : undefined}
                        rel={channel.actionUrl.startsWith("http") ? "noreferrer noopener" : undefined}
                        className="inline-flex items-center gap-1 break-all text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        {channel.destination}
                        {channel.actionUrl.startsWith("http") ? (
                          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
                        ) : null}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        {channel.description || "Future integration channel"}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t border-border/80 pt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-foreground">Delivery Architecture</p>
                    <p className="text-xs text-muted-foreground">
                      Server-side transactional delivery with rate limiting, anti-spam validation, and zero permanent message tracking.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-medium text-foreground">Response Expectations</p>
                    <p className="text-xs text-muted-foreground">
                      Typically answered within 1–2 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/80 lg:col-span-2">
          <CardHeader>
            <CardTitle>Send an Inquiry</CardTitle>
            <CardDescription>
              Messages are processed server-side with spam protection and delivered directly to our inbox.
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
