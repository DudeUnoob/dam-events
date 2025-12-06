# Google OAuth Setup for DAM Events

## Overview
This guide walks you through enabling Google OAuth authentication for the DAM Events platform. The code is already implemented - you just need to configure the providers.

---

## Step 1: Set Up Google Cloud Console

### 1.1 Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in app name: "DAM Events"
   - Add your email as support email
   - Add authorized domains (e.g., `localhost` for development)
   - Save and continue through scopes (default is fine)

### 1.2 Create OAuth 2.0 Client ID

1. Application type: **Web application**
2. Name: "DAM Events Web Client"
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-production-domain.com
   ```
4. **Authorized redirect URIs:**
   ```
   https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback
   ```
   > ⚠️ Replace `[YOUR_SUPABASE_PROJECT_ID]` with your actual Supabase project ID

5. Click **Create**
6. **Save** the Client ID and Client Secret - you'll need these for Supabase

---

## Step 2: Configure Supabase Authentication

### 2.1 Enable Google Provider

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Find **Google** and click to enable it
5. Enter:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. Click **Save**

### 2.2 Add Site URL and Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**:
   ```
   http://localhost:3000
   ```
   (or your production URL)
   
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/callback
   https://your-production-domain.com/api/auth/callback
   ```

---

## Step 3: Verify Environment Variables

Make sure your `.env.local` has the correct Supabase configuration:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App URL (must match Site URL in Supabase)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Test the Authentication Flow

### Login Flow
1. Navigate to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Select a Google account
4. You should be redirected to `/signup/complete` (for new users) or your dashboard (for existing users)

### Signup Flow
1. Navigate to `http://localhost:3000/signup`
2. Select a role (Event Planner or Vendor)
3. Agree to terms
4. Click "Sign up" (Continue with Google)
5. Complete your profile on `/signup/complete`
6. You'll be redirected to your role-specific dashboard

---

## Authentication Flow Diagram

```
User clicks "Continue with Google"
        ↓
Google OAuth popup/redirect
        ↓
User authenticates with Google
        ↓
Redirect to: /api/auth/callback
        ↓
Exchange code for session
        ↓
Check if user profile exists in 'users' table
        ↓
    ┌───────┴───────┐
    No              Yes
    ↓               ↓
/signup/complete    Check role
    ↓               ↓
Create profile      Redirect to dashboard
    ↓               - /planner/dashboard (planner)
Redirect to         - /vendor/dashboard (vendor)  
dashboard           - /admin/dashboard (admin)
```

---

## Troubleshooting

### "OAuth error" or blank popup
- Verify Google Cloud Console redirect URI matches Supabase callback URL exactly
- Check that your Supabase project ID in the redirect URI is correct

### Redirects to wrong page
- Verify `redirectTo` in the OAuth call matches your callback route
- Check `NEXT_PUBLIC_APP_URL` environment variable

### User created but not redirected
- Check browser console for errors
- Verify the callback route is properly exchanging the code for a session

### "Unauthorized" after sign-in
- Ensure the user profile is created in the `users` table
- Check RLS policies allow reading user's own profile

### Session not persisting
- Check that cookies are being set correctly
- Verify middleware is not blocking the auth routes

---

## Code References

| File | Purpose |
|------|---------|
| `client/src/app/login/page.tsx` | Login page with Google button |
| `client/src/app/signup/page.tsx` | Signup page with role selection |
| `client/src/app/signup/complete/page.tsx` | Profile completion form |
| `client/src/app/api/auth/callback/route.ts` | OAuth callback handler |
| `client/src/app/api/auth/signup/complete/route.ts` | Profile creation API |
| `client/src/contexts/AuthContext.tsx` | React context for auth state |
| `client/src/middleware.ts` | Route protection middleware |
| `client/src/lib/supabase/client.ts` | Client-side Supabase client |
| `client/src/lib/supabase/route-handler.ts` | API route Supabase client |

---

## Security Notes

1. **Never expose** your Supabase service role key in client-side code
2. The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose - RLS policies protect data
3. Always use HTTPS in production
4. Keep Google OAuth Client Secret secure (server-side only)
