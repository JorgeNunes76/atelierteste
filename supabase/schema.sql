-- Ana Alexandre Atelier — Supabase Schema (idempotente — pode correr múltiplas vezes)
-- Run this in the Supabase SQL Editor

-- ── Extensions ────────────────────────────────────────────────────────────────
/*
  DEPRECATED / NAO AUTORITATIVO
  --------------------------------------------------------------------------
  Este ficheiro encontra-se legado e NAO representa o estado real atual.
  Fonte de verdade do schema:
    1) supabase/migrations/*.sql
    2) src/lib/database.types.ts (gerado do projeto Supabase atual)

  Risco operacional:
  Executar este ficheiro em ambiente novo pode recriar policies/colunas antigas
  e quebrar fluxos críticos de checkout, reservas e webhooks.
*/

DO $$
BEGIN
  RAISE EXCEPTION
    'supabase/schema.sql esta legado e bloqueado. Usa apenas migrations em supabase/migrations e regenera src/lib/database.types.ts.';
END;
$$;

create extension if not exists "uuid-ossp";

-- ── Segurança: Admins ─────────────────────────────────────────────────────────
create table if not exists admins (
  email text primary key,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;
drop policy if exists "admins_read" on admins;
create policy "admins_read" on admins for select using (true); -- Permite listar admins se necessário no frontend, mas só o backend/painel edita.

-- Helper function segura para checar privilégio admin via JWT
create or replace function is_admin()
returns boolean
language sql
security definer
as $$
  select coalesce(
    (select true from public.admins where email = auth.jwt() ->> 'email'),
    false
  );
$$;

-- Seed admin original
insert into admins (email) values ('atelier.anaalexandre@gmail.com') on conflict do nothing;

-- ── Obras ─────────────────────────────────────────────────────────────────────
create table if not exists obras (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  titulo       text not null,
  tecnica      text not null,
  dimensoes    text,
  ano          integer,
  preco        numeric(10, 2),
  estado       text not null default 'disponivel'
               check (estado in ('disponivel', 'reservado', 'vendido')),
  descricao    text,
  imagem_url   text,
  slug         text unique,
  destaque     boolean not null default false,
  ordem        integer not null default 0
);

alter table obras enable row level security;
drop policy if exists "obras_public_read" on obras;
drop policy if exists "obras_auth_write" on obras;
drop policy if exists "obras_admin_all" on obras;
create policy "obras_public_read" on obras for select using (true);
create policy "obras_admin_all" on obras for all using (is_admin());

-- ── Contactos ─────────────────────────────────────────────────────────────────
create table if not exists contactos (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  nome         text not null,
  email        text not null,
  telefone     text,
  assunto      text,
  mensagem     text not null,
  lido         boolean not null default false
);

alter table contactos enable row level security;
drop policy if exists "contactos_public_insert" on contactos;
drop policy if exists "contactos_auth_read" on contactos;
drop policy if exists "contactos_auth_update" on contactos;
drop policy if exists "contactos_admin_all" on contactos;
create policy "contactos_public_insert" on contactos for insert with check (true);
create policy "contactos_admin_all" on contactos for all using (is_admin());

-- ── Newsletter ────────────────────────────────────────────────────────────────
create table if not exists newsletter (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  email        text not null unique,
  ativo        boolean not null default true
);

alter table newsletter enable row level security;
drop policy if exists "newsletter_public_insert" on newsletter;
drop policy if exists "newsletter_public_update" on newsletter;
drop policy if exists "newsletter_auth_read" on newsletter;
drop policy if exists "newsletter_admin_all" on newsletter;
create policy "newsletter_public_insert" on newsletter for insert with check (true);
create policy "newsletter_admin_all" on newsletter for all using (is_admin());

-- ── Config Site ───────────────────────────────────────────────────────────────
create table if not exists config_site (
  id           uuid primary key default uuid_generate_v4(),
  chave        text not null unique,
  valor        text not null,
  updated_at   timestamptz not null default now()
);

alter table config_site enable row level security;
drop policy if exists "config_public_read" on config_site;
drop policy if exists "config_auth_write" on config_site;
drop policy if exists "config_admin_write" on config_site;
create policy "config_public_read" on config_site for select using (true);
create policy "config_admin_write" on config_site for all using (is_admin());

-- ── Seed config defaults ──────────────────────────────────────────────────────
insert into config_site (chave, valor) values
  ('mentoria_preco_individual', '120'),
  ('mentoria_preco_grupo', '60'),
  ('mentoria_preco_online', '80'),
  ('email_contacto', 'atelier.anaalexandre@gmail.com'),
  ('galeria_titulo', 'Galeria de Obras Originais'),
  ('hero_titulo', 'Onde a Natureza e a Arte se Encontram'),
  ('hero_subtitulo', 'Peças únicas que contam histórias através da terra e da luz.'),
  ('sobre_titulo', 'Ana Alexandre'),
  ('sobre_texto', 'Artista plástica, investigadora e docente na área das Belas Artes.'),
  ('mentoria_titulo', 'Mentoria Artística'),
  ('mentoria_desc', 'Programas de mentoria artística com Ana Alexandre.')
on conflict (chave) do nothing;

-- ── Storage: bucket "obras" ───────────────────────────────────────────────────
-- (Criar bucket manualmente no Supabase Dashboard se não existir)

drop policy if exists "obras_images_public_read" on storage.objects;
create policy "obras_images_public_read" on storage.objects
  for select using (bucket_id = 'obras');

drop policy if exists "obras_images_auth_insert" on storage.objects;
drop policy if exists "obras_images_auth_update" on storage.objects;
drop policy if exists "obras_images_auth_delete" on storage.objects;
drop policy if exists "obras_images_admin_insert" on storage.objects;
drop policy if exists "obras_images_admin_update" on storage.objects;
drop policy if exists "obras_images_admin_delete" on storage.objects;

create policy "obras_images_admin_insert" on storage.objects for insert with check (bucket_id = 'obras' and public.is_admin());
create policy "obras_images_admin_update" on storage.objects for update using (bucket_id = 'obras' and public.is_admin());
create policy "obras_images_admin_delete" on storage.objects for delete using (bucket_id = 'obras' and public.is_admin());

-- ── Vendas (Encomendas) ───────────────────────────────────────────────────────
create table if not exists vendas (
  id           uuid primary key default uuid_generate_v4(),
  created_at   timestamptz not null default now(),
  cliente_nome text not null,
  cliente_email text not null,
  cliente_tel  text,
  total        numeric(10, 2) not null,
  items        jsonb not null, -- Array de obras compradas {id, titulo, preco}
  morada       text,
  estado       text not null default 'pendente'
               check (estado in ('pendente', 'pago', 'enviado', 'cancelado')),
  stripe_id    text
);

alter table vendas enable row level security;
drop policy if exists "vendas_insert_public" on vendas;
drop policy if exists "vendas_read_auth" on vendas;
drop policy if exists "vendas_admin_all" on vendas;
drop policy if exists "vendas_client_read" on vendas;

create policy "vendas_insert_public" on vendas for insert with check (true);
create policy "vendas_admin_all" on vendas for all using (is_admin());
-- Permite check individual caso precisemos de exibir faturas no futuro.
create policy "vendas_client_read" on vendas for select using (cliente_email = auth.jwt() ->> 'email');

