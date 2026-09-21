-- VOUCHERS: cada usuario sube y ve su propia carpeta; admin ve todo
create policy "vouchers_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'vouchers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "vouchers_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'vouchers' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));
create policy "vouchers_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'vouchers' and (storage.foldername(name))[1] = auth.uid()::text);

-- RECIBOS
create policy "recibos_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'recibos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "recibos_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'recibos' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(),'admin')));

-- FOTOS
create policy "fotos_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "fotos_select_auth" on storage.objects for select to authenticated
  using (bucket_id = 'fotos');
create policy "fotos_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'fotos' and (storage.foldername(name))[1] = auth.uid()::text);