# DAM Event Platform - Backend Implementation (P0 MVP)

## 🎉 Implementation Complete!

All P0 backend functionality has been successfully implemented. This document provides a comprehensive overview of the backend architecture, API routes, and setup instructions.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [What's Been Built](#whats-been-built)
3. [Database Setup](#database-setup)
4. [API Routes](#api-routes)
5. [Next Steps](#next-steps)
6. [Testing the Backend](#testing-the-backend)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The backend has been built using:
- **Next.js 14 API Routes** (serverless functions)
- **Supabase** (PostgreSQL database + Auth + Storage + Realtime)
- **TypeScript** (full type safety)
- **Zod** (input validation)
- **Row-Level Security** (Supabase RLS for data access control)

**Cost: $0** - Everything runs on free tiers!

---

## What's Been Built

### ✅ Database Infrastructure
- **6 tables** with full schema, indexes, and relationships
- **Row-Level Security (RLS) policies** for secure data access
- **Automatic triggers** for timestamp updates and status management
- **Storage buckets** for vendor and package photos

### ✅ Core Business Logic
- **Matching algorithm** - Scores packages based on proximity, budget, and capacity
- **Geocoding helper** - Converts addresses to coordinates (stubbed, ready for Google Maps)
- **Notification system** - SMS and email notifications (stubbed, ready for Twilio/SendGrid)
- **Storage helpers** - Photo upload/delete functionality

### ✅ API Routes (17 endpoints total)

#### Authentication (3 routes)
- `POST /api/auth/signup/complete` - Complete profile after OAuth
- `GET /api/auth/user` - Get current user
- `GET /api/auth/callback` - OAuth callback handler

#### Vendors (3 routes)
- `POST /api/vendors` - Create vendor profile (with geocoding)
- `GET /api/vendors/[id]` - Get vendor by ID
- `PUT /api/vendors/[id]` - Update vendor profile

#### Packages (4 routes)
- `POST /api/packages` - Create package
- `GET /api/packages` - Search packages (with optional event matching)
- `GET /api/packages/[id]` - Get package details
- `PUT /api/packages/[id]` - Update package
- `POST /api/packages/[id]/photos` - Upload package photos

#### Events (3 routes)
- `POST /api/events` - Create event (with geocoding)
- `GET /api/events` - Get user's events
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event

#### Leads (3 routes)
- `POST /api/leads` - Request quote + send notifications
- `GET /api/leads` - Get leads (planner or vendor view)
- `GET /api/leads/[id]` - Get lead details
- `PUT /api/leads/[id]` - Update lead status

#### Messages (3 routes)
- `POST /api/messages` - Send message + notification
- `GET /api/messages?leadId=[id]` - Get messages for lead
- `PUT /api/messages/[id]/read` - Mark message as read

#### Admin (2 routes)
- `GET /api/admin/vendors` - Get vendors (filter by status)
- `PUT /api/admin/vendors/[id]/verify` - Approve/reject vendor

### ✅ Middleware
- Authentication middleware protecting all routes
- Role-based access control (planner, vendor, admin)

---

## Database Setup

### Step 1: Run the Migration

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20250101000000_initial_schema.sql`
4. Paste and click **Run**

This creates:
- All 6 tables (users, vendors, packages, events, leads, messages)
- All indexes for performance
- All RLS policies for security
- Automatic triggers for timestamps

### Step 2: Set Up Storage Buckets

1. In Supabase, navigate to **SQL Editor**
2. Copy the contents of `supabase/storage_buckets.sql`
3. Paste and click **Run**

This creates:
- `vendor-photos` bucket (public read, authenticated write)
- `package-photos` bucket (public read, authenticated write)

### Step 3: Enable Google OAuth

1. In Supabase, go to **Authentication** > **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Add authorized redirect URL: `http://localhost:3000/api/auth/callback`

### Step 4: Verify Setup

Run this query in SQL Editor to verify:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see: users, vendors, packages, events, leads, messages

---

## API Routes

### Authentication Flow

```typescript
// 1. User clicks "Login with Google"
// 2. Redirects to Google OAuth
// 3. Google redirects to /api/auth/callback
// 4. If no profile, redirect to /signup/complete
// 5. POST /api/auth/signup/complete with role
// 6. Redirect to dashboard
```

### Example API Calls

#### Create Vendor Profile
```bash
POST /api/vendors
Content-Type: application/json
Authorization: Bearer <supabase-jwt>

{
  "businessName": "Austin Event Venue",
  "description": "Beautiful venue in downtown Austin",
  "services": ["venue", "catering"],
  "locationAddress": "123 Congress Ave, Austin, TX"
}
```

#### Create Event
```bash
POST /api/events
Content-Type: application/json
Authorization: Bearer <supabase-jwt>

{
  "eventDate": "2025-03-15",
  "budget": 3000,
  "guestCount": 150,
  "locationAddress": "University of Texas, Austin, TX",
  "eventType": "formal",
  "description": "Spring formal event"
}
```

#### Search Packages (with event matching)
```bash
GET /api/packages?eventId=<event-uuid>
Authorization: Bearer <supabase-jwt>

# Returns packages sorted by match score
```

#### Request Quote (Create Lead)
```bash
POST /api/leads
Content-Type: application/json
Authorization: Bearer <supabase-jwt>

{
  "eventId": "<event-uuid>",
  "packageId": "<package-uuid>"
}

# Automatically sends notification to vendor
```

#### Send Message
```bash
POST /api/messages
Content-Type: application/json
Authorization: Bearer <supabase-jwt>

{
  "leadId": "<lead-uuid>",
  "content": "Hi, I'm interested in your package!"
}

# Automatically sends notification to receiver
```

---

## Next Steps

### 1. Test the Database
```bash
cd client
npm run dev
```

Visit http://localhost:3000 and test:
1. Google OAuth login
2. Complete signup as planner or vendor
3. Create vendor profile (if vendor)
4. Create event (if planner)

### 2. Enable Real Notifications (Optional)

**For Twilio SMS:**
```bash
# Add to client/.env.local
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

**For SendGrid Email:**
```bash
# Add to client/.env.local
SENDGRID_API_KEY=your_api_key
```

Then uncomment the real implementations in:
- `client/src/lib/notifications/index.ts`

### 3. Enable Real Geocoding (Optional)

```bash
# Add to client/.env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
```

Then uncomment the real implementation in:
- `client/src/lib/maps/geocoding.ts`

### 4. Generate Actual Database Types

```bash
npx supabase gen types typescript --project-id khzxpdfpcocjamlashld > client/src/types/database.types.ts
```

### 5. Create Test Data

Use `supabase/seed.sql` as a template to create test data:
1. First create test users via Supabase Auth Dashboard
2. Copy their user IDs into seed.sql
3. Run the seed file in SQL Editor

---

## Testing the Backend

### Manual Testing Checklist

- [ ] User can sign up via Google OAuth
- [ ] User can complete profile (planner or vendor)
- [ ] Vendor can create vendor profile
- [ ] Vendor can create packages
- [ ] Vendor can upload package photos
- [ ] Planner can create events
- [ ] Planner can browse packages
- [ ] Planner can request quotes (create leads)
- [ ] Vendor receives lead notification (check console logs)
- [ ] Planner and vendor can exchange messages
- [ ] Message notifications logged to console
- [ ] Admin can view pending vendors
- [ ] Admin can approve/reject vendors

### Using Postman/Thunder Client

1. Get JWT token:
   - Login via browser
   - Open DevTools > Application > Local Storage
   - Copy `supabase.auth.token`

2. Add to request headers:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

3. Test all endpoints listed above

---

## Troubleshooting

### Database Issues

**Error: "relation does not exist"**
- Run the migration SQL file in Supabase SQL Editor

**Error: "permission denied for table"**
- RLS policies not set up correctly
- Re-run the migration SQL file

**Error: "duplicate key value violates unique constraint"**
- You're trying to create a duplicate record
- Check if vendor/event already exists

### Auth Issues

**Error: "Unauthorized"**
- JWT token expired or invalid
- Login again to get fresh token

**Error: "User profile not found"**
- User hasn't completed signup
- POST to `/api/auth/signup/complete`

### API Issues

**Error: "VALIDATION_ERROR"**
- Check the error.details for specific field errors
- Ensure all required fields are provided

**Error: "FORBIDDEN"**
- User doesn't have permission
- Check user role matches the route requirement

### Storage Issues

**Error: "Storage bucket not found"**
- Run `storage_buckets.sql` in Supabase
- Create buckets manually in Supabase Dashboard

**Error: "File size exceeds limit"**
- Max file size is 5MB
- Compress images before uploading

---

## File Structure

```
dam-events/
├── supabase/
│   ├── migrations/
│   │   └── 20250101000000_initial_schema.sql  # Main migration
│   ├── storage_buckets.sql                    # Storage setup
│   └── seed.sql                               # Test data template
├── client/
│   ├── src/
│   │   ├── app/
│   │   │   └── api/                          # All API routes
│   │   │       ├── auth/                     # Auth endpoints
│   │   │       ├── vendors/                  # Vendor CRUD
│   │   │       ├── packages/                 # Package CRUD
│   │   │       ├── events/                   # Event CRUD
│   │   │       ├── leads/                    # Lead management
│   │   │       ├── messages/                 # Messaging
│   │   │       └── admin/                    # Admin functions
│   │   ├── lib/
│   │   │   ├── supabase/                     # Supabase clients
│   │   │   ├── matching/                     # Matching algorithm
│   │   │   ├── maps/                         # Geocoding
│   │   │   └── notifications/                # Notifications
│   │   ├── types/
│   │   │   └── database.types.ts             # Database types
│   │   └── middleware.ts                     # Auth middleware
│   └── .env.local                            # Environment variables
└── BACKEND_README.md                         # This file
```

---

## Architecture Decisions

### Why Supabase?
- Free tier includes: PostgreSQL, Auth, Storage, Realtime
- Built-in Row-Level Security
- No backend server needed (serverless)
- Easy to scale

### Why Next.js API Routes?
- Serverless functions (auto-scaling)
- Same codebase as frontend
- TypeScript support
- Free on Vercel

### Why Stub Notifications?
- Twilio costs $0.0079/SMS
- SendGrid free tier is 100 emails/day
- Can enable later without code changes
- Console logs are good for testing

### Why Stub Geocoding?
- Google Maps has $200/month free credit
- Mock data works for testing
- Can enable later without code changes

---

## Security Features

### Authentication
- Google OAuth via Supabase Auth
- JWT tokens with automatic refresh
- Session management via middleware

### Authorization
- Row-Level Security (RLS) on all tables
- Users can only access their own data
- Role-based access control (planner/vendor/admin)
- Middleware protects routes

### Data Privacy
- Email addresses not publicly visible
- Phone numbers only visible after lead creation
- Vendor info only visible after verification
- Messages only visible to participants

### Input Validation
- All inputs validated with Zod schemas
- SQL injection prevented via parameterized queries
- XSS prevented via input sanitization

---

## Performance Optimizations

- Database indexes on frequently queried columns
- Efficient matching algorithm (filters before scoring)
- Lazy loading for images
- Realtime subscriptions for messaging
- Connection pooling via Supabase

---

## Support

For issues or questions:
1. Check this README
2. Check Supabase logs: https://supabase.com/dashboard/project/khzxpdfpcocjamlashld/logs
3. Check browser console for client errors
4. Check Next.js terminal for server errors

---

## License

Internal project - DAM Event Management Team
