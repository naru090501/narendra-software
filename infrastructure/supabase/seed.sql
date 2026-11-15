-- ============================================================================
-- Seed: Initial Narendra Software Product Registry Records (Sprint 5)
-- Purpose: Populates the 4 current products with strict metadata.
-- ============================================================================

insert into public.products (
  name,
  slug,
  description,
  short_description,
  category,
  url,
  documentation_url,
  icon_url,
  status,
  version,
  supported_platforms,
  pricing_model,
  requires_registration,
  requires_cloud,
  is_featured,
  sort_order
)
values
  (
    'Developer Toolbox',
    'developer-toolbox',
    'Standalone local-first JSON, XML, CSV, Base64, and text utilities engineered for instant feedback with zero unnecessary server uploads.',
    'Local-first developer utilities for JSON, XML, CSV, Base64, and text processing.',
    'developer-toolbox',
    null,
    '/docs/developer-toolbox',
    null,
    'released',
    '0.1.0',
    array['web']::text[],
    'free',
    false,
    false,
    true,
    10
  ),
  (
    'Document Tools',
    'document-tools',
    'Focused PDF, Excel, and structured document conversion and inspection utilities built with privacy-first local processing.',
    'Privacy-first document transformation and PDF inspection.',
    'document-tools',
    null,
    '/docs/document-tools',
    null,
    'planned',
    '0.1.0',
    array['web']::text[],
    'free',
    false,
    false,
    true,
    20
  ),
  (
    'Image Tools',
    'image-tools',
    'Browser-native image format conversion, lossless/lossy optimization, resizing, and metadata cleanup without server storage.',
    'Client-side image format conversion, compression, and metadata stripping.',
    'image-tools',
    null,
    '/docs/image-tools',
    null,
    'planned',
    '0.1.0',
    array['web']::text[],
    'free',
    false,
    false,
    true,
    30
  ),
  (
    'Windows Disk & USB Utility',
    'windows-disk-usb-utility',
    'Native .NET 10 Windows utility for verified bootable USB creation, partition inspection, and safe drive formatting.',
    'Native Windows desktop application for safe USB and disk operations.',
    'windows-utilities',
    null,
    '/docs/windows-disk-usb-utility',
    null,
    'planned',
    '0.1.0',
    array['windows']::text[],
    'free',
    false,
    false,
    true,
    40
  )
-- On conflict, preserve existing administrator-managed product data
on conflict (slug) do nothing;
