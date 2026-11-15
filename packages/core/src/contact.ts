import {
  CONTACT_TOPICS,
  type ContactFormInput,
  type ContactValidationErrors,
} from "@narendra/types";

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function sanitizePlainText(input: string): string {
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

/**
 * Strips carriage returns, newlines, null bytes, and control characters to
 * prevent SMTP email header injection attacks in subject, from, or replyTo.
 */
export function sanitizeHeaderValue(input: string): string {
  return input
    .replace(/[\r\n\t\0]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function validateContactInput(input: ContactFormInput): {
  valid: boolean;
  errors: ContactValidationErrors;
  isSpamBot: boolean;
} {
  const errors: ContactValidationErrors = {};

  // Honeypot check: automated spambots fill invisible fields
  const isSpamBot = Boolean(input.honeypot && input.honeypot.trim().length > 0);
  if (isSpamBot) {
    errors.honeypot = "Spam detected.";
    return {
      valid: false,
      errors,
      isSpamBot: true,
    };
  }

  // Header injection defense: name, email, organization must never contain newlines
  if (input.name && /[\r\n]/.test(input.name)) {
    errors.name = "Name must not contain line breaks.";
  }
  if (input.email && /[\r\n]/.test(input.email)) {
    errors.email = "Email address must not contain line breaks.";
  }
  if (input.organization && /[\r\n]/.test(input.organization)) {
    errors.organization = "Organization must not contain line breaks.";
  }

  const name = sanitizeHeaderValue(input.name || "");
  const email = sanitizeHeaderValue(input.email || "");
  const organization = sanitizeHeaderValue(input.organization || "");
  const message = sanitizePlainText(input.message || "");
  const topic = input.topic;

  if (!errors.name) {
    if (name.length < 2) {
      errors.name = "Please enter your full name (at least 2 characters).";
    } else if (name.length > 100) {
      errors.name = "Name must be 100 characters or fewer.";
    }
  }

  if (!errors.email) {
    if (email.length === 0) {
      errors.email = "Please enter your email address.";
    } else if (!EMAIL_REGEX.test(email) || email.length > 254) {
      errors.email = "Please enter a valid email address.";
    }
  }

  if (!errors.organization && organization && organization.length > 120) {
    errors.organization = "Organization name must be 120 characters or fewer.";
  }

  if (!topic || !(CONTACT_TOPICS as readonly string[]).includes(topic)) {
    errors.topic = "Please select a valid inquiry topic.";
  }

  if (message.length < 20) {
    errors.message = "Please include at least 20 characters describing your inquiry.";
  } else if (message.length > 2000) {
    errors.message = "Message must be 2,000 characters or fewer.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    isSpamBot: false,
  };
}
