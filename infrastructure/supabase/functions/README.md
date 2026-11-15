# Supabase Edge Functions (`narendramain`)

This directory contains standalone Edge Functions designed to run in Supabase's Deno-based Edge runtime.

## `send-contact-email`

Server-side handler to validate, throttle, and forward contact inquiries from the web applications to the administrator email inbox without storing sensitive user message payloads in permanent database tables.

### Required Secrets

When deploying to the linked remote Supabase project, configure the following secrets via the Supabase CLI:

```bash
supabase secrets set CONTACT_SMTP_USER="your-email@gmail.com"
supabase secrets set CONTACT_SMTP_PASS="your-16-char-app-password"
supabase secrets set CONTACT_TO_EMAIL="contact@narendrasoftware.com"
```

### Deployment (Subject to Manual Approval)

```bash
supabase functions deploy send-contact-email
```
