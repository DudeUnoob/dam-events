# Quick Start Guide

Get the DAM Event Platform running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free tier is fine)
- Google Cloud account (for OAuth and Maps API)

## Step 1: Install Dependencies

```bash
cd /Users/dam_kamani/Downloads/dam-events/client
npm install
```

## Step 2: Set Up Supabase

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Wait for database to initialize (~2 minutes)

### 2.2 Push Database Schema
```bash
# Initialize Supabase (if not already done)
npx supabase init

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push schema
npx supabase db push
```

### 2.3 Create Storage Buckets
1. Go to Supabase Dashboard > Storage
2. Create bucket named `vendor-photos` (Public: Yes)
3. Create bucket named `package-photos` (Public: Yes)
4. Apply RLS policies from `SUPABASE_SETUP.md`

## Step 3: Set Up Google Services

### 3.1 Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - Your Supabase project's callback URL
6. Copy Client ID and Client Secret
7. Add to Supabase Dashboard > Authentication > Providers > Google

### 3.2 Google Maps API
1. In same Google Cloud project
2. Enable Maps JavaScript API & Geocoding API
3. Create API key
4. Restrict key to your domain (optional but recommended)

## Step 4: Configure Environment Variables

Create `.env.local` in the `client` directory:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Google Maps (REQUIRED)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: SMS & Email (skip for initial testing)
# TWILIO_ACCOUNT_SID=ACxxxxx
# TWILIO_AUTH_TOKEN=xxxxx
# TWILIO_PHONE_NUMBER=+15125551234
# SENDGRID_API_KEY=SG.xxxxx
# SENDGRID_FROM_EMAIL=noreply@dameventplatform.com
```

**Get your Supabase keys:**
- Go to Project Settings > API
- Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Step 6: Create Test Accounts

### Create Admin Account (for vendor verification)
1. Sign up as any role via the UI
2. Find your user ID in Supabase Dashboard > Authentication > Users
3. Go to SQL Editor and run:
```sql
UPDATE users SET role = 'admin' WHERE id = 'YOUR_USER_ID';
```

### Create Vendor Account
1. Sign up → Choose "I'm a vendor"
2. Complete vendor onboarding
3. Create a package
4. **Important:** Admin must verify vendor before packages appear in search

### Create Planner Account
1. Sign up → Choose "I'm planning an event"
2. Complete onboarding
3. Create an event
4. Browse packages

## Troubleshooting

### "Unauthorized" errors?
- Check your Supabase URL and anon key are correct
- Verify you're signed in
- Check browser console for JWT errors

### Photos not uploading?
- Verify storage buckets are created
- Check buckets are set to Public
- Apply RLS policies from SUPABASE_SETUP.md
- Check browser console for errors

### Packages not showing up?
- Verify vendor is verified by admin
- Check package status is 'published'
- Verify geocoding worked (location_lat/lng are set)

### Address autocomplete not working?
- Verify Google Maps API key is correct
- Enable Geocoding API in Google Cloud Console
- Check browser console for API errors

## Next Steps

1. ✅ Sign up and test all three roles (planner, vendor, admin)
2. ✅ Create test packages and events
3. ✅ Test the complete lead workflow
4. ✅ Test messaging system
5. ✅ Upload photos
6. ✅ Review `P0_COMPLETION_SUMMARY.md` for full testing checklist

## Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Run production build
npm run lint                   # Run linter
npm run type-check             # Check TypeScript types

# Supabase
npx supabase start             # Start local Supabase (optional)
npx supabase db push           # Push schema changes
npx supabase db reset          # Reset database (careful!)
npx supabase gen types typescript # Generate types
```

## Resources

- **PRD:** `instructions/Product_Requirements_Document_P0.md`
- **Completion Summary:** `P0_COMPLETION_SUMMARY.md`
- **Supabase Setup:** `SUPABASE_SETUP.md`
- **Development Guidelines:** `claude.md`
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs

## Need Help?

1. Check browser console for errors
2. Check Supabase Dashboard > Logs for API errors
3. Review the documentation files listed above
4. Verify all environment variables are set correctly

**Happy coding! 🚀**
