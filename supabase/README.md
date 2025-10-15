# Supabase Database Setup

This folder contains database migrations and configuration for the DAM Event Platform.

## Files

- `migrations/20250101000000_initial_schema.sql` - Main database schema with all tables, indexes, and RLS policies
- `storage_buckets.sql` - Storage bucket configuration for vendor and package photos
- `seed.sql` - Sample seed data for testing (optional)

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard at https://supabase.com
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `migrations/20250101000000_initial_schema.sql`
5. Click **Run** to execute the migration
6. Repeat steps 3-5 for `storage_buckets.sql`

### Option 2: Using Supabase CLI

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Apply the migration:
   ```bash
   supabase db push
   ```

5. Apply storage buckets:
   ```bash
   supabase db execute -f storage_buckets.sql
   ```

## Verify Setup

After running the migrations, you should have:

### Tables
- ✅ `users` - User profiles extending Supabase auth
- ✅ `vendors` - Vendor business profiles
- ✅ `packages` - Event packages offered by vendors
- ✅ `events` - Event requests created by planners
- ✅ `leads` - Quote requests linking events and packages
- ✅ `messages` - In-platform messaging

### Storage Buckets
- ✅ `vendor-photos` - Vendor business profile photos
- ✅ `package-photos` - Package photos

### Security
- ✅ Row-Level Security (RLS) enabled on all tables
- ✅ Policies ensuring users can only access their own data
- ✅ Public read access for published packages and verified vendors

## Next Steps

1. Enable Google OAuth in Supabase Dashboard:
   - Go to **Authentication** > **Providers**
   - Enable Google provider
   - Add your Google OAuth credentials

2. Configure environment variables in your Next.js app:
   - Copy `.env.example` to `.env.local`
   - Add your Supabase URL and anon key

3. (Optional) Run seed data for testing:
   - First create test users via Supabase Auth Dashboard
   - Update `seed.sql` with actual user IDs
   - Execute the seed file in SQL Editor

## Troubleshooting

**Error: Extension "uuid-ossp" already exists**
- This is normal, the migration handles it with `IF NOT EXISTS`

**Error: Policy already exists**
- Drop existing policies first or skip if setup is already complete

**Storage policies not working**
- Ensure you're running `storage_buckets.sql` AFTER the main migration
- Check that RLS is enabled on `storage.objects` table
