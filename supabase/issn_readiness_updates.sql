-- IRED Journal Platform: ISSN-readiness schema and permission updates
-- Production migrations represented here for reproducibility.

alter table public.green_papers
  add column if not exists english_title text,
  add column if not exists english_abstract text;

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
