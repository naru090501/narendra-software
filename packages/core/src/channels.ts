import type { ContactChannel } from "@narendra/types";

export const DEFAULT_CONTACT_EMAIL = "contact@narendrasoftware.com";

/**
 * Builds the contact channels list with environment-driven destination overrides.
 * Public destinations only; secrets and sensitive credentials must never be placed here.
 * Notice: contact@narendrasoftware.com is flagged as pending domain mailbox verification
 * unless an authorized custom email is configured.
 */
export function getContactChannels(
  env: Record<string, string | undefined> = typeof process !== "undefined"
    ? process.env
    : {},
): ContactChannel[] {
  const configuredEmail = env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL;
  const isCustomEmail = Boolean(env.NEXT_PUBLIC_CONTACT_EMAIL?.trim());

  return [
    {
      id: "channel-contact-form",
      type: "contact-form",
      label: "Website Inquiry Form",
      destination: "/contact",
      actionUrl: "/contact",
      isEnabled: true,
      displayOrder: 1,
      description: "Direct validated inquiry through the Narendra Software contact system.",
      visibility: "public",
    },
    {
      id: "channel-email",
      type: "email",
      label: "Direct Email (Pending Mailbox Confirmation)",
      destination: configuredEmail,
      actionUrl: `mailto:${configuredEmail}`,
      isEnabled: true,
      displayOrder: 2,
      description: isCustomEmail
        ? "Verified contact inbox."
        : "Default contact address. Pending domain mailbox MX configuration confirmation by owner.",
      visibility: "public",
    },
    {
      id: "channel-github",
      type: "github",
      label: "GitHub Repository",
      destination: "https://github.com/naru090501/narendra-software",
      actionUrl: "https://github.com/naru090501/narendra-software",
      isEnabled: true,
      displayOrder: 3,
      description: "Browse open source architecture, report issues, and follow releases.",
      visibility: "public",
    },
    {
      id: "channel-whatsapp",
      type: "whatsapp",
      label: "WhatsApp Business (Planned — Unconfigured)",
      destination: null,
      actionUrl: null,
      isEnabled: false,
      displayOrder: 4,
      description: "Future direct messaging channel. Strictly disabled until real business account is verified.",
      visibility: "inquiry-only",
    },
    {
      id: "channel-phone",
      type: "phone",
      label: "Telephone Support (Planned — Unconfigured)",
      destination: null,
      actionUrl: null,
      isEnabled: false,
      displayOrder: 5,
      description: "Reserved for future verified enterprise support. Strictly disabled until configured.",
      visibility: "inquiry-only",
    },
  ];
}

export const DEFAULT_CONTACT_CHANNELS: ContactChannel[] = getContactChannels();

export function getActiveContactChannels(
  channels: readonly ContactChannel[] = DEFAULT_CONTACT_CHANNELS,
): ContactChannel[] {
  return [...channels]
    .filter((ch) => ch.isEnabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getPublicDisplayChannels(
  channels: readonly ContactChannel[] = DEFAULT_CONTACT_CHANNELS,
): ContactChannel[] {
  return [...channels]
    .filter((ch) => ch.isEnabled && ch.visibility === "public")
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
