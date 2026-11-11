-- ============================================================================
-- Seed: Initial Narendra Software Product Registry Records
-- Note: All initial products are truthfully marked as `in-development` or
--       `planned`, with `url` left NULL until each independent deployment
--       receives its verified production URL.
-- ============================================================================

insert into public.products (
  name,
  slug,
  description,
  category,
  url,
  icon_url,
  status,
  is_featured,
  sort_order
)
values
  (
    'Developer Toolbox',
    'developer-toolbox',
    'Local-first JSON, XML, CSV, Base64, and text utilities engineered for speed and zero unnecessary server uploads.',
    'developer-toolbox',
    null,
    null,
    'in-development',
    true,
    10
  ),
  (
    'Document Tools',
    'document-tools',
    'Focused PDF, Excel, and structured document conversion and inspection utilities built with privacy-first local processing.',
    'document-tools',
    null,
    null,
    'in-development',
    true,
    20
  ),
  (
    'Image Tools',
    'image-tools',
    'Fast client-side image format conversion, compression, resizing, and metadata stripping without uploading user assets.',
    'image-tools',
    null,
    null,
    'planned',
    true,
    30
  ),
  (
    'Security Tools',
    'security-tools',
    'Browser-native cryptographic hashing, password entropy inspection, and privacy-focused verification utilities.',
    'security-tools',
    null,
    null,
    'planned',
    false,
    40
  ),
  (
    'AI Tools',
    'ai-tools',
    'Selectively AI-powered workflows for structured text transformation, summarization, and developer productivity.',
    'ai-tools',
    null,
    null,
    'planned',
    false,
    50
  ),
  (
    'Windows Disk & USB Utility',
    'windows-disk-usb-utility',
    'Native .NET 10 Windows utility for verified bootable USB creation, partition inspection, and safe drive formatting.',
    'windows-utilities',
    null,
    null,
    'planned',
    true,
    60
  )
on conflict (slug) do nothing;
