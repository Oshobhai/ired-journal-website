-- IRED staff access: Full Administrator + Editorial Board Manager
-- Run once in Supabase SQL Editor before deploying the matching UI changes.

alter table public.staff_invites drop constraint if exists staff_invites_role_check;
alter table public.staff_invites add constraint staff_invites_role_check
  check (role = any (array['admin'::text,'editorial_board_manager'::text]));

create or replace function public.is_editorial_manager_invited(target_email text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1 from public.staff_invites
    where email = lower(trim(target_email))
      and status = 'pending'
      and role in ('admin','editorial_board_manager')
  );
$$;

create or replace function public.handle_editorial_manager_signup()
returns trigger
language plpgsql
security definer
set search_path to 'public','auth'
as $$
declare
  invited_role text;
begin
  if new.email is not null then
    select i.role into invited_role
    from public.staff_invites i
    where i.email = lower(new.email)
      and i.status = 'pending'
      and i.role in ('admin','editorial_board_manager')
    limit 1;

    if invited_role is not null then
      insert into public.admin_users(user_id,email,role)
      values(new.id,lower(new.email),invited_role)
      on conflict (user_id) do update set
        email = excluded.email,
        role = case when public.admin_users.role='admin' then 'admin' else excluded.role end;

      update public.staff_invites
      set status='accepted', accepted_at=now()
      where email=lower(new.email);
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.list_staff_access()
returns table(email text, role text, access_status text, created_at timestamptz)
language sql
stable
security definer
set search_path to 'public','auth'
as $$
  select x.email, x.role, x.access_status, x.created_at
  from (
    select lower(a.email) as email, a.role, 'active'::text as access_status, a.created_at
    from public.admin_users a
    union all
    select i.email, i.role, 'pending'::text as access_status, i.created_at
    from public.staff_invites i
    where i.status='pending'
      and not exists (select 1 from public.admin_users a where lower(a.email)=i.email)
  ) x
  where public.is_admin()
  order by x.created_at desc;
$$;

create or replace function public.grant_staff_access(target_email text, target_role text)
returns text
language plpgsql
security definer
set search_path to 'public','auth'
as $$
declare
  normalized text := lower(trim(target_email));
  target_user_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;
  if normalized = '' or position('@' in normalized) = 0 then
    raise exception 'Enter a valid email address';
  end if;
  if target_role not in ('admin','editorial_board_manager') then
    raise exception 'Invalid staff role';
  end if;

  select id into target_user_id from auth.users where lower(email)=normalized limit 1;

  if target_user_id is not null then
    insert into public.admin_users(user_id,email,role)
    values(target_user_id,normalized,target_role)
    on conflict (user_id) do update set email=excluded.email, role=excluded.role;

    insert into public.staff_invites(email,role,status,accepted_at)
    values(normalized,target_role,'accepted',now())
    on conflict (email) do update set role=excluded.role,status='accepted',accepted_at=now();
    return 'active';
  end if;

  insert into public.staff_invites(email,role,status)
  values(normalized,target_role,'pending')
  on conflict (email) do update set role=excluded.role,status='pending',accepted_at=null;
  return 'invited';
end;
$$;

create or replace function public.revoke_staff_access(target_email text)
returns boolean
language plpgsql
security definer
set search_path to 'public','auth'
as $$
declare
  normalized text := lower(trim(target_email));
  target_user_id uuid;
  target_role text;
  admin_count integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select user_id, role into target_user_id, target_role
  from public.admin_users where lower(email)=normalized limit 1;

  if target_user_id = auth.uid() then
    raise exception 'You cannot remove your own administrator access';
  end if;

  if target_role='admin' then
    select count(*) into admin_count from public.admin_users where role='admin';
    if admin_count <= 1 then
      raise exception 'At least one full administrator must remain';
    end if;
  end if;

  delete from public.admin_users where lower(email)=normalized;
  delete from public.staff_invites where email=normalized;
  return true;
end;
$$;
