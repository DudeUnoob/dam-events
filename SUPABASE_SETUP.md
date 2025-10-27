# Supabase Setup Instructions

## Storage Buckets Setup

The application requires two storage buckets for photo uploads. These must be created manually in the Supabase Dashboard:

### 1. Create `vendor-photos` Bucket

1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: `vendor-photos`
4. Public bucket: **YES** (checked)
5. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
6. Max file size: `5MB` (5242880 bytes)
7. Click "Create bucket"

### 2. Create `package-photos` Bucket

1. Go to Supabase Dashboard > Storage
2. Click "New bucket"
3. Name: `package-photos`
4. Public bucket: **YES** (checked)
5. Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`
6. Max file size: `5MB` (5242880 bytes)
7. Click "Create bucket"

### 3. Set Storage Policies

Both buckets need the following RLS policies:

#### For `vendor-photos`:

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Anyone can view vendor photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-photos');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload vendor photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-photos'
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Owner Delete**
```sql
CREATE POLICY "Users can delete own vendor photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### For `package-photos`:

**Policy 1: Public Read Access**
```sql
CREATE POLICY "Anyone can view package photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'package-photos');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload package photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'package-photos'
  AND auth.role() = 'authenticated'
);
```

**Policy 3: Owner Delete**
```sql
CREATE POLICY "Users can delete own package photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'package-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Environment Variables

Ensure the following environment variables are set in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Twilio (for SMS notifications)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15125551234

# SendGrid (for email notifications)
SENDGRID_API_KEY=SG.xxxxx

# Google Maps (for geocoding)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

All database tables and RLS policies are defined in the migration files. Run migrations with:

```bash
npx supabase db push
```

## Testing Storage Upload

After setting up the buckets, test the upload functionality:

1. Sign in as a vendor
2. Go to Profile page (`/vendor/profile`)
3. Try uploading a photo
4. Verify the photo appears in the Supabase Storage bucket

## Troubleshooting

### Photos not uploading?
- Check that buckets are created with exact names: `vendor-photos` and `package-photos`
- Verify buckets are set to **Public**
- Confirm RLS policies are applied correctly
- Check browser console for errors

### Photos uploading but not displaying?
- Verify the `getPublicUrl()` function is returning correct URLs
- Check that files are actually in the bucket via Supabase Dashboard
- Confirm CORS settings allow your domain

### Permission errors?
- Double-check RLS policies are created
- Ensure user is authenticated
- Verify JWT token is valid
