-- TaxLegalPro initial schema + RLS stubs
-- Apply with Supabase CLI or SQL editor. Non-destructive: create-only.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.app_role as enum ('super_admin', 'admin', 'staff', 'client');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role public.app_role not null default 'client',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  summary text not null,
  description text,
  base_price numeric(14, 2),
  currency text not null default 'PKR',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  company text,
  source text not null default 'website',
  status text not null default 'new',
  service_interest text,
  notes text,
  assigned_to uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_cases (
  id uuid primary key default gen_random_uuid(),
  case_number text not null unique default ('CASE-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  title text not null,
  status text not null default 'intake',
  client_id uuid references public.profiles (id),
  service_id uuid references public.services (id),
  lead_id uuid references public.leads (id),
  assigned_to uuid references public.profiles (id),
  priority text not null default 'normal',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chart_of_accounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  account_type text not null check (account_type in ('asset', 'liability', 'equity', 'income', 'expense')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  entry_number text not null unique default ('JE-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  entry_date date not null,
  memo text,
  status text not null default 'draft' check (status in ('draft', 'posted', 'void')),
  created_by uuid references public.profiles (id),
  posted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.journal_lines (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  account_id uuid not null references public.chart_of_accounts (id),
  debit numeric(14, 2) not null default 0 check (debit >= 0),
  credit numeric(14, 2) not null default 0 check (credit >= 0),
  description text,
  constraint journal_line_one_side check (
    (debit > 0 and credit = 0) or (credit > 0 and debit = 0) or (debit = 0 and credit = 0)
  )
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique default ('INV-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  client_id uuid references public.profiles (id),
  case_id uuid references public.service_cases (id),
  status text not null default 'draft',
  issue_date date not null default current_date,
  due_date date,
  subtotal numeric(14, 2) not null default 0,
  tax_amount numeric(14, 2) not null default 0,
  total numeric(14, 2) not null default 0,
  currency text not null default 'PKR',
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  employee_code text not null unique,
  full_name text not null,
  department text,
  job_title text,
  hire_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  work_date date not null,
  check_in timestamptz,
  check_out timestamptz,
  status text not null default 'present',
  notes text,
  unique (employee_id, work_date)
);

create table if not exists public.tax_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.profiles (id),
  ntn text,
  filer_status text,
  tax_year text not null,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  entity text not null,
  entity_id text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Profile bootstrap on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() in ('super_admin', 'admin', 'staff'), false);
$$;

-- Seed catalog (idempotent)
insert into public.services (slug, name, category, summary, description, base_price, is_featured)
values
  ('ntn-registration', 'NTN Registration', 'Tax', 'Individual and business NTN registration with FBR.', 'End-to-end NTN registration support.', 5000, true),
  ('income-tax-return', 'Income Tax Return', 'Tax', 'Annual return preparation and filing support.', 'Salary, business, and mixed-income returns.', 15000, true),
  ('sales-tax-registration', 'Sales Tax Registration', 'Tax', 'Sales tax registration and compliance setup.', null, 12000, false),
  ('company-incorporation', 'Company Incorporation', 'Business Registration', 'Private limited company formation with SECP.', null, 35000, true),
  ('trademark-filing', 'Trademark Filing', 'IP', 'Search, filing, and prosecution support.', null, 25000, false),
  ('corporate-compliance', 'Corporate Compliance', 'Corporate Compliance', 'Statutory filings and secretarial support.', null, 20000, true)
on conflict (slug) do nothing;

insert into public.chart_of_accounts (code, name, account_type)
values
  ('1000', 'Cash', 'asset'),
  ('1100', 'Bank', 'asset'),
  ('1200', 'Accounts Receivable', 'asset'),
  ('2000', 'Accounts Payable', 'liability'),
  ('3000', 'Owner Equity', 'equity'),
  ('4000', 'Service Revenue', 'income'),
  ('5000', 'Operating Expenses', 'expense'),
  ('5100', 'Salaries Expense', 'expense')
on conflict (code) do nothing;

-- Storage bucket stub (private documents)
insert into storage.buckets (id, name, public)
values ('client-documents', 'client-documents', false)
on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.leads enable row level security;
alter table public.service_cases enable row level security;
alter table public.chart_of_accounts enable row level security;
alter table public.journal_entries enable row level security;
alter table public.journal_lines enable row level security;
alter table public.invoices enable row level security;
alter table public.employees enable row level security;
alter table public.attendance_records enable row level security;
alter table public.tax_profiles enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid() or public.current_role() in ('super_admin', 'admin'));

-- Services: public read of active catalog
create policy "services_public_read" on public.services
  for select using (is_active = true or public.is_staff());
create policy "services_staff_write" on public.services
  for all using (public.is_staff()) with check (public.is_staff());

-- Leads: anon insert (contact forms); staff manage
create policy "leads_anon_insert" on public.leads
  for insert to anon, authenticated
  with check (true);
create policy "leads_staff_all" on public.leads
  for all using (public.is_staff()) with check (public.is_staff());

-- Cases / invoices / tax: client own + staff
create policy "cases_client_or_staff" on public.service_cases
  for select using (client_id = auth.uid() or public.is_staff());
create policy "cases_staff_write" on public.service_cases
  for all using (public.is_staff()) with check (public.is_staff());

create policy "invoices_client_or_staff" on public.invoices
  for select using (client_id = auth.uid() or public.is_staff());
create policy "invoices_staff_write" on public.invoices
  for all using (public.is_staff()) with check (public.is_staff());

create policy "tax_client_or_staff" on public.tax_profiles
  for select using (client_id = auth.uid() or public.is_staff());
create policy "tax_staff_write" on public.tax_profiles
  for all using (public.is_staff()) with check (public.is_staff());

-- Finance / HR staff-only (stubs — tighten with finer RBAC later)
create policy "coa_staff" on public.chart_of_accounts
  for all using (public.is_staff()) with check (public.is_staff());
create policy "journals_staff" on public.journal_entries
  for all using (public.is_staff()) with check (public.is_staff());
create policy "journal_lines_staff" on public.journal_lines
  for all using (public.is_staff()) with check (public.is_staff());
create policy "employees_staff" on public.employees
  for all using (public.is_staff()) with check (public.is_staff());
create policy "attendance_staff" on public.attendance_records
  for all using (public.is_staff()) with check (public.is_staff());
create policy "audit_staff_read" on public.audit_logs
  for select using (public.is_staff());

-- Private storage policies (client folder = user id prefix)
create policy "client_docs_read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-documents'
    and (
      public.is_staff()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
create policy "client_docs_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'client-documents'
    and (
      public.is_staff()
      or (storage.foldername(name))[1] = auth.uid()::text
    )
  );
