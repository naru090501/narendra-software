function normalizeHttpUrl(raw?: string): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function resolveSiteUrl(devFallback: string): string | null {
  const explicit = normalizeHttpUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (explicit) {
    return explicit;
  }

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProd) {
    return normalizeHttpUrl(`https://${vercelProd}`);
  }

  const vercelPreview = process.env.VERCEL_URL?.trim();
  if (vercelPreview) {
    return normalizeHttpUrl(`https://${vercelPreview}`);
  }

  if (process.env.NODE_ENV !== "production") {
    return devFallback;
  }

  return null;
}

export function sanitizeOptionalUrl(raw?: string): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
