import nodemailer from "nodemailer";
import crypto from "node:crypto";
import { escapeHtml, sanitizeHeaderValue, sanitizePlainText } from "@narendra/core";
import type { ContactFormInput, ContactSubmissionResult } from "@narendra/types";
import {
  checkContactRateLimit,
  checkInMemoryRateLimit,
  checkSharedRateLimit,
  extractClientIp,
  getClientIp,
  hashClientIp,
  resetInMemoryRateLimits,
  type RateLimitResult,
} from "./rate-limiter";

export {
  checkContactRateLimit,
  checkInMemoryRateLimit,
  checkSharedRateLimit,
  extractClientIp,
  getClientIp,
  hashClientIp,
  resetInMemoryRateLimits,
  type RateLimitResult,
};

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  toEmail: string;
}

// In-memory rate limiting map: IP -> timestamps (preserved for synchronous compatibility)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 5;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitMap.set(ip, validTimestamps);
    return { allowed: false, remaining: 0 };
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - validTimestamps.length,
  };
}

// In-memory deduplication cache: hash -> timestamp
const deduplicationCache = new Map<string, number>();
const DEDUP_WINDOW_MS = 60 * 1000; // 60 seconds window to catch double-clicks

export function computeSubmissionHash(
  ip: string,
  input: Pick<ContactFormInput, "email" | "message" | "topic">,
): string {
  const rawKey = `${ip}:${input.email.toLowerCase()}:${input.topic}:${input.message.trim()}`;
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function isDuplicateSubmission(
  ip: string,
  input: Pick<ContactFormInput, "email" | "message" | "topic">,
): boolean {
  const now = Date.now();
  const hash = computeSubmissionHash(ip, input);
  const lastSeen = deduplicationCache.get(hash);

  if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
    return true;
  }

  return false;
}

export function recordSuccessfulSubmission(
  ip: string,
  input: Pick<ContactFormInput, "email" | "message" | "topic">,
): void {
  const now = Date.now();
  const hash = computeSubmissionHash(ip, input);
  deduplicationCache.set(hash, now);

  // Periodically cleanup expired entries
  if (deduplicationCache.size > 200) {
    for (const [key, ts] of deduplicationCache.entries()) {
      if (now - ts >= DEDUP_WINDOW_MS) {
        deduplicationCache.delete(key);
      }
    }
  }
}

export function getSmtpConfig(
  env: Record<string, string | undefined> = process.env,
): SmtpConfig | null {
  const user = env.CONTACT_SMTP_USER?.trim();
  const pass = env.CONTACT_SMTP_PASS?.trim();

  if (!user || !pass) {
    return null;
  }

  const host = env.CONTACT_SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = parseInt(env.CONTACT_SMTP_PORT?.trim() || "465", 10);
  const secure = env.CONTACT_SMTP_SECURE
    ? env.CONTACT_SMTP_SECURE === "true"
    : port === 465;
  const toEmail = env.CONTACT_TO_EMAIL?.trim() || user;

  return {
    host,
    port,
    secure,
    user,
    pass,
    toEmail,
  };
}

export async function sendContactEmail(
  input: ContactFormInput,
  options: {
    clientIp?: string;
    config?: SmtpConfig | null;
  } = {},
): Promise<ContactSubmissionResult> {
  const config = options.config !== undefined ? options.config : getSmtpConfig();

  if (!config) {
    return {
      success: false,
      message:
        "Transactional email delivery is not configured on this server. Contact the administrator to set server-side SMTP credentials.",
    };
  }

  const deliveryId = crypto.randomUUID();

  // Strict header sanitization: strip any carriage returns or newlines to prevent header injection
  const safeName = sanitizeHeaderValue(input.name);
  const safeEmail = sanitizeHeaderValue(input.email);
  const safeOrganization = input.organization ? sanitizeHeaderValue(input.organization) : null;
  const safeTopic = sanitizeHeaderValue(input.topic);

  // Message body sanitization
  const safeMessage = sanitizePlainText(input.message);

  const plainTextBody = [
    `Narendra Software Contact System — New Inquiry`,
    `--------------------------------------------------`,
    `Delivery ID:  ${deliveryId}`,
    `Submitted At: ${new Date().toISOString()}`,
    `Topic:        ${safeTopic}`,
    `Name:         ${safeName}`,
    `Email:        ${safeEmail}`,
    safeOrganization ? `Organization: ${safeOrganization}` : null,
    `--------------------------------------------------`,
    `Message:`,
    safeMessage,
    `--------------------------------------------------`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff; color: #0f172a;">
      <h2 style="margin-top: 0; color: #0d2347; font-size: 20px; border-bottom: 2px solid #38bdf8; padding-bottom: 8px;">
        New Contact Inquiry — Narendra Software
      </h2>
      <p style="font-size: 13px; color: #64748b; margin-top: 4px;">
        Delivery ID: <code>${escapeHtml(deliveryId)}</code> • ${new Date().toUTCString()}
      </p>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; width: 120px;"><strong>Topic:</strong></td>
          <td style="padding: 6px 0; font-weight: 600; color: #0284c7;">${escapeHtml(safeTopic)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Name:</strong></td>
          <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(safeName)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;"><strong>Email:</strong></td>
          <td style="padding: 6px 0;"><a href="mailto:${escapeHtml(safeEmail)}" style="color: #0284c7; text-decoration: none;">${escapeHtml(safeEmail)}</a></td>
        </tr>
        ${
          safeOrganization
            ? `<tr>
                <td style="padding: 6px 0; color: #64748b;"><strong>Organization:</strong></td>
                <td style="padding: 6px 0; color: #0f172a;">${escapeHtml(safeOrganization)}</td>
              </tr>`
            : ""
        }
      </table>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 16px;">
        <h3 style="margin-top: 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">
          Message
        </h3>
        <p style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; margin: 0; color: #1e293b;">${escapeHtml(safeMessage)}</p>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
        Sent via Narendra Software Platform Contact API • Privacy-First Architecture
      </p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });

    await transporter.sendMail({
      from: `"Narendra Software Contact" <${config.user}>`,
      replyTo: `"${safeName}" <${safeEmail}>`,
      to: config.toEmail,
      subject: `[Narendra Software] [${safeTopic}] from ${safeName}`,
      text: plainTextBody,
      html: htmlBody,
    });

    return {
      success: true,
      message: "Your message has been delivered successfully. Thank you for reaching out!",
      deliveryId,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown SMTP transport error";
    // Never leak credentials or raw auth data
    return {
      success: false,
      message: `Failed to deliver email: ${errorMessage}. Please try again later or reach out directly.`,
    };
  }
}
