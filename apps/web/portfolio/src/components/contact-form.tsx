"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, Copy, Loader2, Mail, Send } from "lucide-react";
import { validateContactInput } from "@narendra/core";
import type { ContactFormInput, ContactSubmissionResult, ContactValidationErrors } from "@narendra/types";
import { Button, Input, Label, Select, Textarea } from "@narendra/ui";

const INITIAL_VALUES: ContactFormInput = {
  name: "",
  email: "",
  organization: "",
  topic: "collaboration",
  message: "",
  honeypot: "",
};

export function ContactForm() {
  const [values, setValues] = useState<ContactFormInput>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ContactSubmissionResult | null>(null);
  const [copiedFallback, setCopiedFallback] = useState(false);

  function updateField<K extends keyof ContactFormInput>(
    field: K,
    value: ContactFormInput[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (submissionResult && !submissionResult.success) {
      setSubmissionResult(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopiedFallback(false);
    setSubmissionResult(null);

    // Client-side pre-validation
    const validation = validateContactInput(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as ContactSubmissionResult;

      if (!response.ok || !data.success) {
        if (data.errors) {
          setErrors(data.errors);
        }
        setSubmissionResult({
          success: false,
          message:
            data.message ||
            "Unable to deliver message through the contact server. Please try again or use direct email.",
        });
        return;
      }

      // Successful server-side delivery confirmed!
      setSubmissionResult({
        success: true,
        message: data.message,
        deliveryId: data.deliveryId,
      });
      setValues(INITIAL_VALUES);
    } catch {
      setSubmissionResult({
        success: false,
        message:
          "Network error while connecting to the email delivery service. Please check your internet connection or use direct email.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyFallbackDraft() {
    const summary = [
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.organization?.trim() ? `Organization: ${values.organization.trim()}` : null,
      `Topic: ${values.topic}`,
      "",
      values.message.trim(),
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedFallback(true);
    } catch {
      setCopiedFallback(false);
    }
  }

  const directMailto = `mailto:contact@narendrasoftware.com?subject=${encodeURIComponent(
    `[Narendra Software] ${values.topic} inquiry from ${values.name.trim() || "Visitor"}`,
  )}&body=${encodeURIComponent(
    values.message.trim() || "Inquiry message content...",
  )}`;

  return (
    <div className="space-y-6">
      {submissionResult?.success ? (
        <div
          role="status"
          aria-live="polite"
          className="space-y-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-foreground shadow-sm"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">
                Inquiry Successfully Delivered
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {submissionResult.message}
              </p>
              {submissionResult.deliveryId ? (
                <p className="font-mono text-xs text-muted-foreground/80">
                  Reference ID: {submissionResult.deliveryId}
                </p>
              ) : null}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSubmissionResult(null);
                setValues(INITIAL_VALUES);
                setErrors({});
              }}
            >
              Send Another Inquiry
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {submissionResult && !submissionResult.success ? (
            <div
              role="alert"
              className="space-y-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-foreground"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Delivery Issue</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {submissionResult.message}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={directMailto}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  Send via Mail Client
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyFallbackDraft}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copiedFallback ? "Copied Draft!" : "Copy Message Draft"}
                </Button>
              </div>
            </div>
          ) : null}

          {/* Honeypot field - invisible to humans, traps automated spam bots */}
          <div aria-hidden="true" className="hidden" tabIndex={-1}>
            <label htmlFor="contact-hp">Do not fill this field</label>
            <input
              id="contact-hp"
              type="text"
              name="honeypot"
              tabIndex={-1}
              autoComplete="off"
              value={values.honeypot}
              onChange={(e) => updateField("honeypot", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">
                Full name <span className="text-accent">*</span>
              </Label>
              <Input
                id="contact-name"
                name="name"
                value={values.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Your full name"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "contact-name-error" : undefined}
              />
              {errors.name ? (
                <p
                  id="contact-name-error"
                  className="flex items-center gap-1.5 text-xs text-rose-500"
                >
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">
                Email address <span className="text-accent">*</span>
              </Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                value={values.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "contact-email-error" : undefined}
              />
              {errors.email ? (
                <p
                  id="contact-email-error"
                  className="flex items-center gap-1.5 text-xs text-rose-500"
                >
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-org">Affiliation / Project (optional)</Label>
              <Input
                id="contact-org"
                name="organization"
                value={values.organization}
                onChange={(e) => updateField("organization", e.target.value)}
                placeholder="Independent, student, team, or open source"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.organization)}
                aria-describedby={errors.organization ? "contact-org-error" : undefined}
              />
              {errors.organization ? (
                <p
                  id="contact-org-error"
                  className="flex items-center gap-1.5 text-xs text-rose-500"
                >
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  {errors.organization}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-topic">Inquiry topic</Label>
              <Select
                id="contact-topic"
                name="topic"
                value={values.topic}
                disabled={isSubmitting}
                onChange={(e) =>
                  updateField(
                    "topic",
                    e.target.value as ContactFormInput["topic"],
                  )
                }
                containerClassName="w-full"
                className="h-10 w-full rounded-xl pl-3 pr-8 text-sm"
              >
                <option value="collaboration">Open Source &amp; Collaboration</option>
                <option value="product-feedback">Product Feedback / Suggestion</option>
                <option value="enterprise-inquiry">Feature Request / Custom Need</option>
                <option value="general">General Inquiry</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">
              Message <span className="text-accent">*</span>
            </Label>
            <Textarea
              id="contact-message"
              name="message"
              rows={5}
              value={values.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Tell us about your use case, question, or feedback (minimum 20 characters)..."
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "contact-message-error" : undefined}
            />
            {errors.message ? (
              <p
                id="contact-message-error"
                className="flex items-center gap-1.5 text-xs text-rose-500"
              >
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {errors.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Sending Inquiry...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  Send Inquiry
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={() => {
                setValues(INITIAL_VALUES);
                setErrors({});
                setSubmissionResult(null);
                setCopiedFallback(false);
              }}
            >
              Clear Form
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
