-- Tornar o bucket "documents" público (necessário para getPublicUrl)
UPDATE storage.buckets SET public = true WHERE id = 'documents';

-- Remover policies antigas que só permitiam anon em pasta "public"
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder flreew_0" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder flreew_1" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder flreew_2" ON storage.objects;
DROP POLICY IF EXISTS "Give anon users access to JPG images in folder flreew_3" ON storage.objects;

-- Policy: usuários autenticados (admin/comercial) podem fazer upload
CREATE POLICY "authenticated_upload_documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
);

-- Policy: qualquer pessoa pode visualizar (bucket público)
CREATE POLICY "public_read_documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Policy: admin/comercial podem excluir seus arquivos
CREATE POLICY "admin_comercial_delete_documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents'
  AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'comercial')
);
