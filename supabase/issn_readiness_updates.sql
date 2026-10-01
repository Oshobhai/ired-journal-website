-- IRED Journal Platform: ISSN-readiness schema and permission updates
-- Production migrations represented here for reproducibility.

alter table public.green_papers
  add column if not exists english_title text,
  add column if not exists english_abstract text,
  add column if not exists pdf_compliance_verified_at timestamptz,
  add column if not exists pdf_compliance_verified_by uuid references auth.users(id) on delete set null,
  add column if not exists pdf_compliance_note text;

create or replace function public.reset_green_pdf_compliance_on_change()
returns trigger
language plpgsql
as $$
begin
  if new.pdf_path is distinct from old.pdf_path
     and new.pdf_compliance_verified_at is not distinct from old.pdf_compliance_verified_at then
    new.pdf_compliance_verified_at := null;
    new.pdf_compliance_verified_by := null;
    new.pdf_compliance_note := null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reset_green_pdf_compliance on public.green_papers;
create trigger trg_reset_green_pdf_compliance
before update of pdf_path on public.green_papers
for each row
execute function public.reset_green_pdf_compliance_on_change();

-- Publication management is restricted to full admins.
alter policy admins_can_delete_green_papers on public.green_papers
  using (public.is_admin());
alter policy admins_can_insert_green_papers on public.green_papers
  with check ((created_by = auth.uid()) and public.is_admin());
alter policy admins_can_read_all_green_papers on public.green_papers
  using (public.is_admin());
alter policy admins_can_update_green_papers on public.green_papers
  using (public.is_admin()) with check (public.is_admin());

alter policy admins_can_delete_red_books on public.red_books
  using (public.is_admin());
alter policy admins_can_insert_red_books on public.red_books
  with check ((created_by = auth.uid()) and public.is_admin());
alter policy admins_can_read_all_red_books on public.red_books
  using (public.is_admin());
alter policy admins_can_update_red_books on public.red_books
  using (public.is_admin()) with check (public.is_admin());

alter policy admins_can_delete_green_pdfs on storage.objects
  using ((bucket_id = 'green-papers') and public.is_admin());
alter policy admins_can_read_all_green_pdfs on storage.objects
  using ((bucket_id = 'green-papers') and public.is_admin());
alter policy admins_can_update_green_pdfs on storage.objects
  using ((bucket_id = 'green-papers') and public.is_admin())
  with check ((bucket_id = 'green-papers') and public.is_admin());
alter policy admins_can_upload_green_pdfs on storage.objects
  with check ((bucket_id = 'green-papers') and public.is_admin());

alter policy admins_can_delete_red_pdfs on storage.objects
  using ((bucket_id = 'red-books') and public.is_admin());
alter policy admins_can_read_all_red_pdfs on storage.objects
  using ((bucket_id = 'red-books') and public.is_admin());
alter policy admins_can_update_red_pdfs on storage.objects
  using ((bucket_id = 'red-books') and public.is_admin())
  with check ((bucket_id = 'red-books') and public.is_admin());
alter policy admins_can_upload_red_pdfs on storage.objects
  with check ((bucket_id = 'red-books') and public.is_admin());
