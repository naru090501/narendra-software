"use client";

import { useState, type FormEvent } from "react";
import { AlertCircle, Check, Copy, Info, Mail } from "lucide-react";
import { validateContactInput } from "@narendra/core";
import type { ContactFormInput, ContactValidationErrors } from "@narendra/types";
import { Button, Input, Label, Textarea } from "@narendra/ui";

const INITIAL_VALUES: ContactFormInput = {
  name: "",
  email: "",
  organization: "",
  topic: "collaboration",
  message: "",
};

export function ContactForm() {
  const [values, setValues] = useState<ContactFormInput>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [validatedSummary, setValidatedSummary] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopied(false);

    const validation = validateContactInput(values);
    if (!validation.valid) {
      setErrors(validation.errors);
      setValidatedSummary(null);
      return;
    }

    setErrors({});
    const summary = [
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.organization.trim()
        ? `Organization: ${values.organization.trim()}`
        : null,
      `Topic: ${values.topic}`,
      "",
      values.message.trim(),
    ]
      .filter((line): line is string => line !== null)
      .join("\n");

    setValidatedSummary(summary);
  }

  async function copySummary() {
    if (!validatedSummary || typeof navigator === "undefined") {
      return;
    }
    try {
      await navigator.clipboard.writeText(validatedSummary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const mailtoHref = validatedSummary
    ? `mailto:contact@narendrasoftware.com?subject=${encodeURIComponent(
        `[Narendra Software] ${values.topic} inquiry from ${values.name.trim()}`,
      )}&body=${encodeURIComponent(validatedSummary)}`
    : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3.5 text-xs leading-relaxed text-foreground">
        <div className="flex items-start gap-2.5">
          <Info
            className="mt-0.5 h-4 w-4 shrink-0 text-accent"
            aria-hidden="true"
          />
          <p>
            <strong>Validation preview mode:</strong> Automated backend message
            delivery is not enabled in this foundation milestone. Validating
            this form prepares a formatted inquiry summary you can copy or open
            in your email client.
          </p>
        </div>
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
            placeholder="you@organization.com"
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
          <Label htmlFor="contact-org">Organization (optional)</Label>
          <Input
            id="contact-org"
            name="organization"
            value={values.organization}
            onChange={(e) => updateField("organization", e.target.value)}
            placeholder="Company or team name"
            aria-invalid={Boolean(errors.organization)}
            aria-describedby={
              errors.organization ? "contact-org-error" : undefined
            }
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
          <select
            id="contact-topic"
            name="topic"
            value={values.topic}
            onChange={(e) =>
              updateField(
                "topic",
                e.target.value as ContactFormInput["topic"],
              )
            }
            className="flex h-10 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <option value="collaboration">Collaboration &amp; Partnerships</option>
            <option value="product-feedback">Product Feedback</option>
            <option value="enterprise-inquiry">Enterprise Inquiry</option>
            <option value="general">General Question</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">
          Message <span className="text-accent">*</span>
        </Label>
        <Textarea
          id="contact-message"
          name="message"
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          placeholder="Tell us about your use case, collaboration idea, or product question (minimum 20 characters)..."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "contact-message-error" : undefined
          }
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

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary">
          Validate &amp; Prepare Inquiry
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setValues(INITIAL_VALUES);
            setErrors({});
            setValidatedSummary(null);
            setCopied(false);
          }}
        >
          Clear Form
        </Button>
      </div>

      {validatedSummary ? (
        <div
          role="status"
          className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm"
        >
          <p className="font-medium text-foreground">
            Your inquiry passed validation and is ready to send via your email
            client (not automatically transmitted by this static form).
          </p>
          <pre className="overflow-x-auto rounded-lg border border-border bg-card p-3 font-mono text-xs text-muted-foreground">
            {validatedSummary}
          </pre>
          <div className="flex flex-wrap gap-2.5">
            <Button type="button" size="sm" variant="outline" onClick={copySummary}>
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy Inquiry Summary
                </>
              )}
            </Button>
            {mailtoHref ? (
              <a
                href={mailtoHref}
                className="inline-flex h-8 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                Open Email Draft
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </form>
  );
}
