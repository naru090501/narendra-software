import { NextResponse } from "next/server";
import { validateContactInput } from "@narendra/core";
import type { ContactFormInput, ContactSubmissionResult } from "@narendra/types";
import {
  checkSharedRateLimit,
  getClientIp,
  isDuplicateSubmission,
  recordSuccessfulSubmission,
  sendContactEmail,
} from "@/lib/email-service";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<NextResponse<ContactSubmissionResult>> {
  // 1. Extract verified client IP (prioritizing trusted edge-injected headers)
  const ip = getClientIp(request);

  // 2. Parse request payload safely
  // Malformed requests are rejected immediately and NOT counted as accepted attempts
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid request payload. Expected JSON body.",
      },
      { status: 400 },
    );
  }

  const input = body as ContactFormInput;

  // 3. Validation & Honeypot spam bot check
  // Invalid form submissions do NOT count against the rate limit
  const validation = validateContactInput(input);

  if (validation.isSpamBot) {
    // Silently drop spam bots with simulated 200 to prevent bot tuning
    return NextResponse.json(
      {
        success: true,
        message: "Inquiry received.",
      },
      { status: 200 },
    );
  }

  if (!validation.valid) {
    return NextResponse.json(
      {
        success: false,
        message: "Please correct the highlighted fields.",
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  // 4. Duplicate submission check (prevents rapid double-clicks from consuming attempts)
  if (isDuplicateSubmission(ip, input)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A message with this content was already submitted recently. Please wait a moment before sending another inquiry.",
      },
      { status: 409 },
    );
  }

  // 5. Atomic shared rate limiting check
  // Policy: Max 5 accepted attempts per 15 minutes (900 seconds) per client HMAC
  const rateLimit = await checkSharedRateLimit({
    clientIp: ip,
    action: "contact-form",
    maxRequests: 5,
    windowSeconds: 900,
  });

  if (rateLimit.warning) {
    console.warn(`[ContactAPI] Rate limiter: ${rateLimit.warning}`);
  }

  const rateLimitHeaders: Record<string, string> = {
    "X-RateLimit-Limit": rateLimit.limit.toString(),
    "X-RateLimit-Remaining": rateLimit.remaining.toString(),
    "X-RateLimit-Reset": rateLimit.resetAt,
    "X-RateLimit-Source": rateLimit.source,
  };

  if (!rateLimit.allowed) {
    // In production, when the limiter fails closed due to missing RPC or configuration,
    // return a controlled 503 Service Unavailable rather than 429 quota exhaustion.
    if (rateLimit.isConfigurationError) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The contact service is temporarily unavailable due to a security configuration requirement. Please try again shortly.",
        },
        {
          status: 503,
          headers: {
            "Retry-After": "60",
            "X-RateLimit-Source": rateLimit.source,
          },
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: `Too many inquiries sent from your IP address. Please wait ${rateLimit.retryAfterSeconds} seconds before submitting again.`,
        retryAfter: rateLimit.retryAfterSeconds,
      },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders,
          "Retry-After": rateLimit.retryAfterSeconds.toString(),
        },
      },
    );
  }

  // 6. Server-side transactional email delivery
  const result = await sendContactEmail(input, { clientIp: ip });

  if (!result.success) {
    return NextResponse.json(result, {
      status: 502,
      headers: rateLimitHeaders,
    });
  }

  // 7. Only record in deduplication cache AFTER confirmed successful delivery
  recordSuccessfulSubmission(ip, input);

  return NextResponse.json(result, {
    status: 200,
    headers: rateLimitHeaders,
  });
}
