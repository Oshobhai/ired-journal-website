-- IRED Journal Platform: proposed Supabase schema (Phase 1 blueprint)
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'viewer' check (role in ('super_admin','admin','editor','reviewer','viewer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles p where p.id=auth.uid() and p.role in ('super_admin','admin','editor'));
$$;

create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(), volume integer not null, issue_number integer, year integer not null,
  month integer check (month between 1 and 12), title text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(), full_name text not null, affiliation text, email text, orcid text,
  created_at timestamptz not null default now()
);

create table if not exists public.papers (
  id uuid primary key default gen_random_uuid(), article_id text unique not null, slug text unique not null,
  title text not null, abstract text, keywords text[] default '{}', category text,
  issue_id uuid references public.issues(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','under_review','accepted','published','rejected','archived')),
  original_docx_path text, formatted_pdf_path text, page_start integer, page_end integer, doi text,
  published_at timestamptz, created_by uuid references auth.users(id), created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.paper_authors (
  paper_id uuid references public.papers(id) on delete cascade,
  author_id uuid references public.authors(id) on delete cascade,
  author_order integer not null default 1, corresponding boolean not null default false,
  primary key (paper_id, author_id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(), submitter_name text not null, email text not null, mobile text,
  institution text, paper_title text not null, category text, original_docx_path text, supporting_pdf_path text,
  declaration_accepted boolean not null default false,
  status text not null default 'pending' check (status in ('pending','screening','under_review','revision','accepted','rejected','published')),
  submitted_at timestamptz not null default now()
);

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(), book_code text unique not null, slug text unique not null,
  title text not null, description text, volume integer, issue_number integer, year integer not null,
  month integer check (month between 1 and 12), cover_path text, pdf_path text, total_papers integer default 0,
  total_pages integer, status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);

create table if not exists public.reviewers (
  id uuid primary key default gen_random_uuid(), full_name text not null, affiliation text, email text, expertise text[],
  active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.editorial_board (
  id uuid primary key default gen_random_uuid(), full_name text not null, designation text, institution text,
  country text, board_role text, display_order integer default 100, active boolean not null default true
);

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references auth.users(id), action text not null,
  entity_type text, entity_id text, detail jsonb, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.authors enable row level security;
alter table public.papers enable row level security;
alter table public.paper_authors enable row level security;
alter table public.submissions enable row level security;
alter table public.books enable row level security;
alter table public.reviewers enable row level security;
alter table public.editorial_board enable row level security;
alter table public.audit_logs enable row level security;

create policy "public can read published papers" on public.papers for select using (status='published' or public.is_staff());
create policy "staff manage papers" on public.papers for all using (public.is_staff()) with check (public.is_staff());
create policy "public can read published books" on public.books for select using (status='published' or public.is_staff());
create policy "staff manage books" on public.books for all using (public.is_staff()) with check (public.is_staff());
create policy "public can read published issues" on public.issues for select using (status='published' or public.is_staff());
create policy "staff manage issues" on public.issues for all using (public.is_staff()) with check (public.is_staff());
create policy "public can read active editorial board" on public.editorial_board for select using (active=true or public.is_staff());
create policy "staff manage editorial board" on public.editorial_board for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage authors" on public.authors for all using (public.is_staff()) with check (public.is_staff());
create policy "public can read authors" on public.authors for select using (true);
create policy "public can create submissions" on public.submissions for insert with check (declaration_accepted=true);
create policy "staff manage submissions" on public.submissions for all using (public.is_staff()) with check (public.is_staff());
create policy "staff manage reviewers" on public.reviewers for all using (public.is_staff()) with check (public.is_staff());
create policy "staff read audit logs" on public.audit_logs for select using (public.is_staff());
create policy "staff write audit logs" on public.audit_logs for insert with check (public.is_staff());
