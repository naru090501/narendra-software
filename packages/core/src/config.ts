import type { CompanyInfo, FeatureFlagConfig, PlatformConfig } from "@narendra/types";
import { DEFAULT_CONTACT_CHANNELS, getContactChannels } from "./channels.js";
import { resolveConfiguredProductUrl } from "./catalog.js";

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  legalName: "Narendra Software",
  displayName: "Narendra Software",
  tagline: "Independent, privacy-first web utilities and native .NET 10 Windows software.",
  foundedYear: 2026,
  headquarters: "Mumbai, India",
  contactEmail: "contact@narendrasoftware.com",
  websiteUrl: "https://narendrasoftware.com",
  githubUrl: "https://github.com/naru090501/narendra-software",
  privacyCommitment: "100% free, browser-local execution with zero payload upload or monetization of user assets.",
};

export const DEFAULT_FEATURE_FLAGS: FeatureFlagConfig = {
  enableSupabaseRegistry: true,
  enableContactEmailDelivery: true,
  enableWhatsAppChannel: false,
  enableCommunityChat: false,
};

export function getPlatformConfig(
  env: Record<string, string | undefined> = typeof process !== "undefined"
    ? process.env
    : {},
): PlatformConfig {
  const hasSupabaseUrl = Boolean(env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const hasAnonKey = Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim());

  return {
    company: {
      ...DEFAULT_COMPANY_INFO,
      contactEmail: env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || DEFAULT_COMPANY_INFO.contactEmail,
    },
    features: {
      ...DEFAULT_FEATURE_FLAGS,
      enableSupabaseRegistry: hasSupabaseUrl && hasAnonKey,
      enableWhatsAppChannel: env.NEXT_PUBLIC_ENABLE_WHATSAPP === "true",
    },
    channels: getContactChannels(env),
    products: {
      developerToolboxUrl: resolveConfiguredProductUrl(env.NEXT_PUBLIC_DEV_TOOLS_URL),
      defaultDocumentationBaseUrl: "/docs",
    },
  };
}
