-- TaxLegalPro ERP expansion: finance, HR, tax filings, docs, tasks, automation
-- Versioned, non-destructive (create-only / additive).

-- ========== Finance ==========
create table if not exists public.fiscal_periods (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  start_date date not null,
  end_date date not null,
  is_locked boolean not null default false,
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bank_name text,
  account_number text,
  currency text not null default 'PKR',
  opening_balance numeric(14, 2) not null default 0,
  gl_account_id uuid references public.chart_of_accounts (id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.petty_cash_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  custodian text,
  gl_account_id uuid references public.chart_of_accounts (id),
  balance numeric(14, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.petty_cash_entries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.petty_cash_accounts (id) on delete cascade,
  entry_date date not null default current_date,
  direction text not null check (direction in ('in', 'out')),
  amount numeric(14, 2) not null check (amount > 0),
  memo text,
  journal_entry_id uuid references public.journal_entries (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payment_number text not null unique default ('PAY-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  client_id uuid references public.profiles (id),
  invoice_id uuid references public.invoices (id),
  bank_account_id uuid references public.bank_accounts (id),
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'PKR',
  payment_date date not null default current_date,
  method text not null default 'bank_transfer',
  status text not null default 'recorded' check (status in ('recorded', 'allocated', 'void')),
  memo text,
  journal_entry_id uuid references public.journal_entries (id),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments (id) on delete cascade,
  invoice_id uuid not null references public.invoices (id),
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique (payment_id, invoice_id)
);

-- Link journals to fiscal period + idempotency key for money posts
alter table public.journal_entries
  add column if not exists fiscal_period_id uuid references public.fiscal_periods (id),
  add column if not exists idempotency_key text;

create unique index if not exists journal_entries_idempotency_uidx
  on public.journal_entries (idempotency_key)
  where idempotency_key is not null;

-- ========== HR ==========
create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  leave_type text not null default 'annual',
  start_date date not null,
  end_date date not null,
  days numeric(6, 2) not null check (days > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reason text,
  decided_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.payroll_runs (
  id uuid primary key default gen_random_uuid(),
  run_code text not null unique,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'posted', 'void')),
  total_gross numeric(14, 2) not null default 0,
  total_net numeric(14, 2) not null default 0,
  journal_entry_id uuid references public.journal_entries (id),
  posted_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

create table if not exists public.payroll_lines (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.payroll_runs (id) on delete cascade,
  employee_id uuid not null references public.employees (id),
  gross numeric(14, 2) not null default 0,
  deductions numeric(14, 2) not null default 0,
  net numeric(14, 2) not null default 0,
  unique (run_id, employee_id)
);

-- ========== Tax ==========
create table if not exists public.tax_deadlines (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  due_date date not null,
  tax_year text,
  category text not null default 'filing',
  status text not null default 'upcoming' check (status in ('upcoming', 'due', 'filed', 'overdue', 'waived')),
  client_id uuid references public.profiles (id),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.tax_filings (
  id uuid primary key default gen_random_uuid(),
  filing_number text not null unique default ('TF-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  tax_profile_id uuid references public.tax_profiles (id),
  client_id uuid references public.profiles (id),
  filing_type text not null default 'income_tax_return',
  tax_year text not null,
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'ready_to_file', 'submitted', 'acknowledged', 'rejected')),
  deadline_id uuid references public.tax_deadlines (id),
  submitted_at timestamptz,
  acknowledgment_ref text,
  notes text,
  -- Never invent FBR success: acknowledgment_ref only set when staff records a real ref
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ========== Documents ==========
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  storage_path text not null,
  bucket text not null default 'client-documents',
  mime_type text,
  size_bytes bigint,
  client_id uuid references public.profiles (id),
  case_id uuid references public.service_cases (id),
  tax_filing_id uuid references public.tax_filings (id),
  uploaded_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ========== Tasks / projects ==========
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  case_id uuid references public.service_cases (id),
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects (id) on delete set null,
  case_id uuid references public.service_cases (id),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority text not null default 'normal',
  assignee_id uuid references public.profiles (id),
  due_date date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks (id) on delete cascade,
  author_id uuid references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ========== Automation / notifications ==========
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id),
  channel text not null default 'in_app',
  title text not null,
  body text,
  entity text,
  entity_id text,
  idempotency_key text unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.automation_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  trigger_event text not null,
  is_active boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Seed fiscal period + extra GL accounts
insert into public.fiscal_periods (name, start_date, end_date, is_locked)
values ('FY 2026-27', '2026-07-01', '2027-06-30', false)
on conflict (name) do nothing;

insert into public.chart_of_accounts (code, name, account_type)
values
  ('1010', 'Petty Cash', 'asset'),
  ('1050', 'Bank Operating', 'asset'),
  ('2100', 'Salaries Payable', 'liability'),
  ('2200', 'Tax Payable', 'liability')
on conflict (code) do nothing;

-- ========== RLS ==========
alter table public.fiscal_periods enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.petty_cash_accounts enable row level security;
alter table public.petty_cash_entries enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.leave_requests enable row level security;
alter table public.payroll_runs enable row level security;
alter table public.payroll_lines enable row level security;
alter table public.tax_deadlines enable row level security;
alter table public.tax_filings enable row level security;
alter table public.documents enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.notifications enable row level security;
alter table public.automation_rules enable row level security;

-- Staff-only finance
do $$ begin
  create policy fiscal_staff on public.fiscal_periods for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy bank_staff on public.bank_accounts for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy petty_acct_staff on public.petty_cash_accounts for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy petty_entry_staff on public.petty_cash_entries for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy payments_staff on public.payments for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy pay_alloc_staff on public.payment_allocations for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;

-- Clients can see own payments
do $$ begin
  create policy payments_client_read on public.payments for select using (client_id = auth.uid() or public.is_staff());
exception when duplicate_object then null; end $$;

-- HR staff
do $$ begin
  create policy leave_staff on public.leave_requests for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy payroll_staff on public.payroll_runs for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy payroll_lines_staff on public.payroll_lines for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;

-- Tax: client own + staff
do $$ begin
  create policy tax_deadline_staff on public.tax_deadlines for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tax_deadline_client on public.tax_deadlines for select using (client_id = auth.uid() or public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tax_filing_staff on public.tax_filings for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tax_filing_client on public.tax_filings for select using (client_id = auth.uid() or public.is_staff());
exception when duplicate_object then null; end $$;

-- Documents: client own + staff
do $$ begin
  create policy documents_select on public.documents for select
    using (client_id = auth.uid() or public.is_staff() or uploaded_by = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy documents_insert on public.documents for insert
    with check (public.is_staff() or uploaded_by = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy documents_update_staff on public.documents for update using (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy documents_delete_staff on public.documents for delete using (public.is_staff());
exception when duplicate_object then null; end $$;

-- Tasks
do $$ begin
  create policy projects_staff on public.projects for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tasks_staff on public.tasks for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tasks_assignee_read on public.tasks for select using (assignee_id = auth.uid() or public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy task_comments_rw on public.task_comments for all using (public.is_staff() or author_id = auth.uid()) with check (public.is_staff() or author_id = auth.uid());
exception when duplicate_object then null; end $$;

-- Notifications: own rows
do $$ begin
  create policy notifications_own on public.notifications for select using (user_id = auth.uid() or public.is_staff());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy notifications_insert_staff on public.notifications for insert with check (public.is_staff() or user_id = auth.uid());
exception when duplicate_object then null; end $$;
do $$ begin
  create policy automation_staff on public.automation_rules for all using (public.is_staff()) with check (public.is_staff());
exception when duplicate_object then null; end $$;

-- Storage update policy for client docs
do $$ begin
  create policy client_docs_update on storage.objects for update to authenticated
    using (
      bucket_id = 'client-documents'
      and (public.is_staff() or (storage.foldername(name))[1] = auth.uid()::text)
    );
exception when duplicate_object then null; end $$;
do $$ begin
  create policy client_docs_delete on storage.objects for delete to authenticated
    using (
      bucket_id = 'client-documents'
      and (public.is_staff() or (storage.foldername(name))[1] = auth.uid()::text)
    );
exception when duplicate_object then null; end $$;

-- Helper: period lock check (callable from app / future RPC)
create or replace function public.assert_period_open(p_date date)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  pid uuid;
  locked boolean;
begin
  select id, is_locked into pid, locked
  from public.fiscal_periods
  where p_date between start_date and end_date
  order by start_date desc
  limit 1;

  if pid is null then
    raise exception 'No fiscal period covers %', p_date using errcode = 'P0001';
  end if;
  if locked then
    raise exception 'Fiscal period is locked for %', p_date using errcode = 'P0001';
  end if;
  return pid;
end;
$$;
