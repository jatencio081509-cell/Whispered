-- Simple fix for storage bucket RLS policies
-- Drop existing policies first
DROP POLICY IF EXISTS "Allow authenticated users to upload to memories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read from memories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to memories bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files from memories bucket" ON storage.objects;

-- Create simple permissive policy for uploads
CREATE POLICY "Allow all uploads to memories bucket"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'memories');

-- Create simple permissive policy for reads
CREATE POLICY "Allow all reads from memories bucket"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'memories');
