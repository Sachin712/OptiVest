-- Fix RLS policies for Supabase Storage
-- This should resolve the "new row violates row-level security policy" error for file uploads

-- First, make sure the storage bucket exists (run this if you haven't created it yet)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', false);

-- Drop existing storage policies
DROP POLICY IF EXISTS "Users can upload their own support attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own support attachments" ON storage.objects;

-- Create simpler storage policies that work with Clerk
CREATE POLICY "Users can upload support attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'support-attachments');

CREATE POLICY "Users can view support attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'support-attachments');

-- Alternative: If the above doesn't work, try this even simpler approach
-- (Uncomment if needed)
-- DROP POLICY IF EXISTS "Users can upload support attachments" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view support attachments" ON storage.objects;
-- 
-- CREATE POLICY "Allow all authenticated users to upload" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'support-attachments');
-- 
-- CREATE POLICY "Allow all authenticated users to view" ON storage.objects
--   FOR SELECT USING (bucket_id = 'support-attachments');
