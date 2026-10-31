# TaxLegalPro (`promedia`)

Public website, client portal, and admin ERP for TaxLegalPro.

**Stack:** Vite · React · TypeScript · React Router · Supabase (Auth, Postgres, Storage, RLS)

**Live reference (legacy):** https://noman-website-xi.vercel.app/  
**PR:** https://github.com/Hassan-byte-svg/promedia/pull/1

## Quick start

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
# Apply both SQL files in supabase/migrations/ (SQL editor or CLI)
npm run dev
```

```bash
npm run test
npm run build
npm run preview
```

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Anon (public) key |
| `VITE_APP_URL` | Canonical site origin (SEO / sitemap replacement) |

Without Supabase env vars the public UI still runs (catalog fallback); auth and writes show clear errors. Admin/portal shells are previewable locally for design review; **RBAC is enforced when Supabase is configured**.

## Migrations

1. `supabase/migrations/20261025100000_initial_schema.sql` — profiles, services, leads, cases, CoA/journals, invoices, HR base, tax profiles, storage bucket, RLS  
2. `supabase/migrations/20261025220000_erp_modules.sql` — fiscal periods, banks, petty cash, payments/allocations, leave, payroll, tax filings/deadlines, documents, tasks/comments, notifications/automation, period-lock helper

## Modules

| Area | Status |
| --- | --- |
| Public site + SEO (`robots.txt`, `sitemap.xml`, meta) | Working |
| CRM leads / cases / services | Working (Supabase) |
| Journals (balanced post + period lock + idempotency) | Working |
| Payments + allocation, banks, petty cash | Working |
| HR attendance, leave, payroll (no duplicate post) | Working |
| Tax filings workflow + deadlines (no fake FBR ack) | Working |
| Documents (private bucket + signed URLs) | Working |
| Tasks + comments + notifications | Working |
| Reports / settings matrix UI | Stub |
| Live Supabase credentials in this environment | **Blocked** — owner must supply |

## Deploy

`vercel.json` rewrites SPA routes to `index.html`. Set production env vars in Vercel; replace sitemap host with your domain.
