import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

const PLACEHOLDER_MARKERS = [
  "your-project-ref",
  "your-supabase-anon",
  "example.supabase.co",
];

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

function isLocalHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

export function getSupabasePublicConfig(
  env?: Record<string, string | undefined>,
): SupabasePublicConfig | null {
  const url = (
    env ? env.NEXT_PUBLIC_SUPABASE_URL : process.env.NEXT_PUBLIC_SUPABASE_URL
  )?.trim();
  const anonKey = (
    env
      ? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !anonKey) {
    return null;
  }

  if (isPlaceholder(url) || isPlaceholder(anonKey)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") {
      return { url: parsed.origin, anonKey };
    }
    if (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)) {
      return { url: parsed.origin, anonKey };
    }
    return null;
  } catch {
    return null;
  }
}

export function createPublicSupabaseClient(
  config: SupabasePublicConfig | null = getSupabasePublicConfig(),
): SupabaseClient | null {
  if (!config) {
    return null;
  }

  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface SupabaseAdminConfig {
  url: string;
  serviceRoleKey: string;
}

export function getSupabaseAdminConfig(
  env?: Record<string, string | undefined>,
): SupabaseAdminConfig | null {
  const currentEnv = env || process.env;
  const url = (currentEnv.SUPABASE_URL || currentEnv.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const serviceRoleKey = (
    currentEnv.SUPABASE_SERVICE_ROLE_KEY || currentEnv.SUPABASE_SERVICE_KEY
  )?.trim();

  if (!url || !serviceRoleKey) {
    return null;
  }

  if (isPlaceholder(url) || isPlaceholder(serviceRoleKey)) {
    return null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:") {
      return { url: parsed.origin, serviceRoleKey };
    }
    if (parsed.protocol === "http:" && isLocalHostname(parsed.hostname)) {
      return { url: parsed.origin, serviceRoleKey };
    }
    return null;
  } catch {
    return null;
  }
}

export function createServiceRoleSupabaseClient(
  config: SupabaseAdminConfig | null = getSupabaseAdminConfig(),
): SupabaseClient | null {
  if (!config) {
    return null;
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
