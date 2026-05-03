create table if not exists public.public_form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_key text not null,
  fingerprint text not null,
  created_at timestamptz not null default now()
);

create index if not exists public_form_submissions_lookup_idx
  on public.public_form_submissions (form_key, fingerprint, created_at desc);

alter table public.public_form_submissions enable row level security;

drop policy if exists "public_form_submissions_admin_all" on public.public_form_submissions;
create policy "public_form_submissions_admin_all"
  on public.public_form_submissions
  for all
  using (is_admin())
  with check (is_admin());
