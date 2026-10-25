# TaxLegalPro (`promedia`)

Public website, client portal, and admin ERP foundation for TaxLegalPro.

**Stack:** Vite · React · TypeScript · React Router · Supabase (Auth, Postgres, Storage, RLS)

**Live reference (legacy):** https://noman-website-xi.vercel.app/

## Quick start

```bash
npm install
cp .env.example .env   # add Supabase URL + anon key
npm run dev
```

Apply SQL in `supabase/migrations/` via the Supabase SQL editor or CLI before expecting auth/CRM data to persist.

```bash
npm run build
npm run preview
```

## Environment

See `.env.example`. Never commit real secrets.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Anon (public) key |

Without these, the public UI still runs with a local catalog fallback; auth and writes show a clear setup message.

## Deploy (Vercel)

`vercel.json` rewrites all routes to `index.html` so deep links work.

## Project docs

Project store (coordinator):

- `docs/project-audit.md` — Phase 1 audit
- `docs/project-context.md` — mission, constraints, phases

## What works now

- Public site: home, services, pricing, about, contact/consultation (lead form), FAQ, resources, legal stubs, auth pages
- Design tokens + shared UI
- Supabase schema + RLS stubs (profiles, services, leads, cases, CoA/journals, invoices, HR/attendance, tax profiles, audit logs, private storage bucket)
- Admin shell (`/app`) with CRM leads, cases, services, finance CoA, invoices, tax, HR screens wired to Supabase
- Client portal shell (`/portal`) with cases/invoices lists (RLS-scoped)

## Still stubbed / next

- Full double-entry posting UI, petty cash, payroll runs, attendance check-in
- Document upload + signed URLs UI
- Task board, reporting exports, automation/notifications
- Finer RBAC matrix, MFA, password-reset email form
- SEO sitemap/robots and counsel-reviewed legal copy
