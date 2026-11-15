# Narendra Software — Monorepo Architecture

## Design Goals

1. **Independent Products Under One Brand**: Every user-facing web tool or native desktop utility can be built, tested, and deployed independently without coupling release lifecycles.
2. **Local Processing by Default**: Everyday developer, document, image, and security utilities process data in the user's browser or native machine rather than uploading files to remote servers.
3. **Zero Mandatory Registration**: Visitors can discover and use core free utilities without creating accounts.
4. **Runtime Separation**: JavaScript/TypeScript web apps live under `apps/web/*` and `packages/*` managed by `pnpm` + `Turborepo`. Native Windows applications live under `dotnet/` managed exclusively by the .NET 10 SDK.

## Repository Layout

```text
apps/
  web/
    portfolio/        # Central portfolio website & product directory (Next.js App Router)
packages/
  types/              # Shared TypeScript domain contracts
  core/               # Catalog defaults, filtering, search, and contact validation
  supabase/           # Public Supabase client + local fallback product repository
  ui/                 # Shared accessible Tailwind + shadcn-style UI primitives
dotnet/               # Isolated .NET 10 LTS solution for future native Windows apps
infrastructure/
  supabase/           # SQL migrations, optional seed script, and deployment guide
docs/                 # Architecture and operational documentation
```

## Shared Packages

- **`@narendra/types`**: Zero-runtime-dependency interfaces and enums (`Product`, `ProductCategory`, `ProductStatus`, `ProjectShowcase`, `ContactFormInput`).
- **`@narendra/core`**: Pure TypeScript domain logic, fallback product catalog, project showcases, filtering/search utilities, and contact validation.
- **`@narendra/supabase`**: Reads public environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`), queries `public.products`, and falls back safely to `@narendra/core`'s `DEFAULT_PRODUCTS` when unconfigured or unreachable.
- **`@narendra/ui`**: Shared React UI components (`Button`, `Badge`, `Card`, `Input`, `Label`, `Textarea`, `SectionHeading`, `cn`) built with Tailwind CSS and `class-variance-authority`.
