-- Storage Buckets Configuration for DAM Event Platform
-- To be run in Supabase SQL Editor or via Supabase CLI

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create vendor-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vendor-photos', 'vendor-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create package-photos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-photos', 'package-photos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Vendor Photos Policies
-- Anyone can view vendor photos
CREATE POLICY "Public can view vendor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-photos');

-- Authenticated vendors can upload to their own folder
CREATE POLICY "Vendors can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-photos' AND
  auth.role() = 'authenticated' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Vendors can update their own photos
CREATE POLICY "Vendors can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Vendors can delete their own photos
CREATE POLICY "Vendors can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Package Photos Policies
-- Anyone can view package photos
CREATE POLICY "Public can view package photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'package-photos');

-- Vendors can upload package photos for packages they own
CREATE POLICY "Vendors can upload package photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'package-photos' AND
  auth.role() = 'authenticated'
);

-- Vendors can update package photos
CREATE POLICY "Vendors can update package photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'package-photos' AND
  auth.role() = 'authenticated'
);

-- Vendors can delete package photos
CREATE POLICY "Vendors can delete package photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'package-photos' AND
  auth.role() = 'authenticated'
);
