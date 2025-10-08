# DAM Event Management Platform - Development Guide

## Project Overview

**Product Name:** DAM Event Platform  
**Version:** 1.0 - MVP (P0)  
**Tech Stack:** Next.js 14, React, Tailwind CSS, Supabase (PostgreSQL), TypeScript  
**Deployment:** Vercel  

**Purpose:** A two-sided marketplace connecting event planners (primarily student organizations) with pre-vetted vendors offering complete event packages (venue + catering + entertainment). We eliminate the fragmented vendor discovery process by centralizing package browsing, quote requests, and vendor communication.

---

## Core Architecture

```
Client (Next.js/React/Tailwind) 
  ↓ HTTPS
API Routes (Next.js Serverless)
  ↓
Supabase (PostgreSQL + Auth + Storage + Realtime)
  ↓
External APIs (Twilio, SendGrid, Google Maps)
```

### Key Technologies

| Component | Technology | Why |
|-----------|-----------|-----|
| Frontend | Next.js 14 + React 18 | SSR for SEO, unified front/back |
| Styling | Tailwind CSS | Rapid development, consistent design |
| Database | Supabase PostgreSQL | Open-source, RLS, realtime |
| Auth | Supabase Auth (Google OAuth) | Built-in OAuth, JWT, no passwords |
| Storage | Supabase Storage | S3-compatible, integrated auth |
| Realtime | Supabase Realtime | WebSocket messaging |
| SMS | Twilio | Reliable vendor notifications |
| Email | SendGrid | Transactional emails |
| Maps | Google Maps API | Geocoding, distance calc |
| Hosting | Vercel | Zero-config Next.js deployment |
| Language | TypeScript | Type safety, better DX |

---

## Project Structure

```
dam-event-platform/
├── src/
│   ├── app/                    # Next.js 14 app router
│   │   ├── (auth)/            # Auth-related pages
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── planner/           # Planner dashboard & pages
│   │   │   ├── dashboard/
│   │   │   ├── browse/
│   │   │   └── events/[id]/
│   │   ├── vendor/            # Vendor dashboard & pages
│   │   │   ├── dashboard/
│   │   │   ├── profile/
│   │   │   ├── packages/
│   │   │   └── leads/[id]/
│   │   ├── admin/             # Admin dashboard
│   │   ├── messages/          # Unified messaging
│   │   ├── api/               # API routes
│   │   │   ├── auth/
│   │   │   ├── vendors/
│   │   │   ├── packages/
│   │   │   ├── events/
│   │   │   ├── leads/
│   │   │   └── messages/
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── planner/          # Planner-specific components
│   │   ├── vendor/           # Vendor-specific components
│   │   └── shared/           # Shared components
│   ├── lib/                   # Utility functions
│   │   ├── supabase/         # Supabase client & helpers
│   │   ├── matching/         # Matching algorithm
│   │   ├── notifications/    # Twilio & SendGrid
│   │   ├── maps/             # Google Maps helpers
│   │   └── utils.ts          # General utilities
│   ├── types/                 # TypeScript types
│   │   ├── database.types.ts  # Supabase generated types
│   │   └── index.ts           # Custom types
│   └── middleware.ts          # Auth middleware
├── supabase/
│   ├── migrations/            # Database migrations
│   └── seed.sql               # Seed data for testing
├── public/                    # Static assets
├── .env.local                 # Environment variables (not committed)
├── .env.example               # Example env file
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Database Schema

### Tables

**users** (extends Supabase auth.users)
```typescript
{
  id: UUID (PK, references auth.users)
  email: TEXT
  full_name: TEXT
  role: 'planner' | 'vendor' | 'admin'
  organization: TEXT (nullable, for planners)
  phone: TEXT (nullable, for vendors)
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**vendors**
```typescript
{
  id: UUID (PK)
  user_id: UUID (FK to users)
  business_name: TEXT
  description: TEXT
  services: TEXT[] // ['venue', 'catering', 'entertainment']
  location_address: TEXT
  location_lat: DECIMAL
  location_lng: DECIMAL
  status: 'pending' | 'verified' | 'rejected'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**packages**
```typescript
{
  id: UUID (PK)
  vendor_id: UUID (FK to vendors)
  name: TEXT
  description: TEXT
  venue_details: JSONB // {name, capacity, amenities[]}
  catering_details: JSONB // {menu_options[], dietary_accommodations[]}
  entertainment_details: JSONB // {type, equipment[]}
  price_min: DECIMAL
  price_max: DECIMAL
  capacity: INTEGER
  photos: TEXT[] // Supabase Storage URLs
  status: 'draft' | 'published'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**events**
```typescript
{
  id: UUID (PK)
  planner_id: UUID (FK to users)
  event_date: DATE
  budget: DECIMAL
  guest_count: INTEGER
  location_address: TEXT
  location_lat: DECIMAL
  location_lng: DECIMAL
  event_type: TEXT
  description: TEXT
  status: 'draft' | 'active' | 'booked' | 'closed'
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**leads**
```typescript
{
  id: UUID (PK)
  event_id: UUID (FK to events)
  vendor_id: UUID (FK to vendors)
  package_id: UUID (FK to packages)
  planner_id: UUID (FK to users)
  status: 'new' | 'viewed' | 'quoted' | 'booked' | 'declined' | 'closed'
  created_at: TIMESTAMP
  viewed_at: TIMESTAMP
  responded_at: TIMESTAMP
  updated_at: TIMESTAMP
}
```

**messages**
```typescript
{
  id: UUID (PK)
  lead_id: UUID (FK to leads)
  sender_id: UUID (FK to users)
  receiver_id: UUID (FK to users)
  content: TEXT
  read: BOOLEAN
  created_at: TIMESTAMP
}
```

---

## Coding Standards & Best Practices

### TypeScript
- **Always use TypeScript** for type safety
- **Generate Supabase types:** `npx supabase gen types typescript --project-id [PROJECT_ID] > src/types/database.types.ts`
- **Define custom types** in `src/types/index.ts`
- **Use strict mode** in tsconfig.json
- **Avoid `any` type** - use `unknown` if truly needed

### React Components
- **Use functional components** with hooks
- **Keep components small** (<200 lines, ideally <100)
- **Use TypeScript interfaces** for props
- **Follow naming conventions:**
  - Components: PascalCase (e.g., `EventCard.tsx`)
  - Utilities: camelCase (e.g., `calculateDistance.ts`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)

### Example Component Structure
```typescript
// src/components/planner/EventCard.tsx
import { Event } from '@/types';

interface EventCardProps {
  event: Event;
  onView: (id: string) => void;
}

export function EventCard({ event, onView }: EventCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{event.event_type}</h3>
      <p className="text-sm text-slate-600">
        {new Date(event.event_date).toLocaleDateString()}
      </p>
      <button 
        onClick={() => onView(event.id)}
        className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        View Details
      </button>
    </div>
  );
}
```

### API Routes
- **Use Next.js 14 Route Handlers** (app router)
- **Always validate input** with Zod schemas
- **Handle errors gracefully** with try-catch
- **Return consistent response structure:**
  - Success: `{ data: any, error: null }`
  - Error: `{ data: null, error: { message: string, code: string } }`
- **Use HTTP status codes correctly:**
  - 200: Success
  - 201: Created
  - 400: Bad Request (client error)
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Server Error

### Example API Route
```typescript
// src/app/api/events/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const eventSchema = z.object({
  event_date: z.string().datetime(),
  budget: z.number().positive(),
  guest_count: z.number().int().positive(),
  location_address: z.string().min(1),
  event_type: z.string().min(1),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { data: null, error: { message: 'Unauthorized', code: 'AUTH_ERROR' } },
        { status: 401 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validatedData = eventSchema.parse(body);

    // Create event
    const { data: event, error: dbError } = await supabase
      .from('events')
      .insert({
        ...validatedData,
        planner_id: user.id,
        status: 'active',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json(
        { data: null, error: { message: dbError.message, code: 'DB_ERROR' } },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: event, error: null }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { data: null, error: { message: 'Invalid input', code: 'VALIDATION_ERROR', details: error.errors } },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { data: null, error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

### Supabase Client Usage
- **Use different clients** for different contexts:
  - **Server Components:** `createServerComponentClient` from `@supabase/auth-helpers-nextjs`
  - **Client Components:** `createClientComponentClient` from `@supabase/auth-helpers-nextjs`
  - **API Routes:** `createRouteHandlerClient` from `@supabase/auth-helpers-nextjs`
- **Always handle errors** from Supabase operations
- **Use Row-Level Security (RLS)** - never bypass with service role key in client code

### Example Supabase Query
```typescript
// src/lib/supabase/queries.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export async function getVendorPackages(vendorId: string) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('vendor_id', vendorId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }

  return data;
}
```

---

## Key Features Implementation Guide

### 1. Google OAuth Authentication

**Setup:**
1. Enable Google OAuth in Supabase Dashboard (Authentication > Providers)
2. Add redirect URLs in Google Cloud Console

**Implementation:**
```typescript
// src/app/(auth)/login/page.tsx
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Error logging in:', error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button
        onClick={handleGoogleLogin}
        className="rounded-lg bg-white px-6 py-3 shadow-lg hover:shadow-xl"
      >
        <span className="flex items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24">{/* Google icon SVG */}</svg>
          Continue with Google
        </span>
      </button>
    </div>
  );
}
```

**Callback Handler:**
```typescript
// src/app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Check if user has completed profile
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user?.id)
    .single();

  if (!profile?.role) {
    return NextResponse.redirect(`${requestUrl.origin}/signup/complete`);
  }

  // Redirect based on role
  const redirectPath = profile.role === 'vendor' ? '/vendor/dashboard' : '/planner/dashboard';
  return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`);
}
```

---

### 2. Matching Algorithm

**Location:** `src/lib/matching/algorithm.ts`

**Logic:**
```typescript
import { Database } from '@/types/database.types';

type Package = Database['public']['Tables']['packages']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

interface MatchedPackage extends Package {
  score: number;
  distance: number;
}

export function matchPackages(packages: Package[], event: Event): MatchedPackage[] {
  return packages
    .filter(pkg => 
      // Hard filters
      pkg.capacity >= event.guest_count &&
      pkg.price_min <= event.budget &&
      pkg.price_max >= event.budget
    )
    .map(pkg => ({
      ...pkg,
      distance: calculateDistance(
        pkg.location_lat,
        pkg.location_lng,
        event.location_lat,
        event.location_lng
      ),
      score: 0,
    }))
    .filter(pkg => pkg.distance <= 20) // Within 20 miles
    .map(pkg => ({
      ...pkg,
      score: calculateScore(pkg, event),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20); // Return top 20
}

function calculateScore(pkg: MatchedPackage, event: Event): number {
  let score = 0;

  // Distance proximity (0-40 points)
  score += Math.max(0, 40 - pkg.distance * 2);

  // Budget match (0-30 points)
  const budgetMid = (pkg.price_min + pkg.price_max) / 2;
  const budgetDiff = Math.abs(budgetMid - event.budget);
  score += Math.max(0, 30 - (budgetDiff / event.budget) * 30);

  // Capacity match (0-20 points)
  const capacityRatio = pkg.capacity / event.guest_count;
  if (capacityRatio >= 1 && capacityRatio <= 1.5) {
    score += 20; // Perfect fit
  } else if (capacityRatio > 1.5) {
    score += Math.max(0, 20 - (capacityRatio - 1.5) * 10);
  }

  // Future: Vendor rating (0-10 points)
  // score += pkg.rating * 2;

  return score;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

---

### 3. Notifications (Twilio + SendGrid)

**Setup:**
```bash
npm install twilio @sendgrid/mail
```

**Twilio SMS:**
```typescript
// src/lib/notifications/sms.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendLeadNotificationSMS(
  vendorPhone: string,
  leadDetails: {
    guestCount: number;
    budget: number;
    date: string;
    leadUrl: string;
  }
) {
  try {
    await client.messages.create({
      to: vendorPhone,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body: `New event lead! ${leadDetails.guestCount} guests, $${leadDetails.budget}, ${leadDetails.date}. View: ${leadDetails.leadUrl}`,
    });
    console.log('SMS sent successfully to', vendorPhone);
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}
```

**SendGrid Email:**
```typescript
// src/lib/notifications/email.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendLeadNotificationEmail(
  vendorEmail: string,
  leadDetails: {
    vendorName: string;
    eventDate: string;
    guestCount: number;
    budget: number;
    leadUrl: string;
  }
) {
  const msg = {
    to: vendorEmail,
    from: 'leads@dameventplatform.com', // Must be verified in SendGrid
    subject: 'New Event Lead - DAM Event Platform',
    html: `
      <h2>Hi ${leadDetails.vendorName},</h2>
      <p>You have a new event lead!</p>
      <ul>
        <li><strong>Date:</strong> ${leadDetails.eventDate}</li>
        <li><strong>Guests:</strong> ${leadDetails.guestCount}</li>
        <li><strong>Budget:</strong> $${leadDetails.budget}</li>
      </ul>
      <p><a href="${leadDetails.leadUrl}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Lead Details</a></p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully to', vendorEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
```

**Trigger on Lead Creation:**
```typescript
// src/app/api/leads/route.ts (POST handler)
import { sendLeadNotificationSMS, sendLeadNotificationEmail } from '@/lib/notifications';

// ... after creating lead in database ...

// Fetch vendor details
const { data: vendor } = await supabase
  .from('vendors')
  .select('*, users!inner(*)')
  .eq('id', validatedData.vendorId)
  .single();

// Send notifications
const leadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/vendor/leads/${lead.id}`;
await Promise.all([
  sendLeadNotificationSMS(vendor.users.phone, {
    guestCount: event.guest_count,
    budget: event.budget,
    date: event.event_date,
    leadUrl,
  }),
  sendLeadNotificationEmail(vendor.users.email, {
    vendorName: vendor.business_name,
    eventDate: event.event_date,
    guestCount: event.guest_count,
    budget: event.budget,
    leadUrl,
  }),
]);
```

---

### 4. Real-time Messaging with Supabase Realtime

**Client Component:**
```typescript
// src/components/messaging/MessageThread.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';

type Message = Database['public']['Tables']['messages']['Row'];

interface MessageThreadProps {
  leadId: string;
  currentUserId: string;
}

export function MessageThread({ leadId, currentUserId }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const supabase = createClientComponentClient<Database>();

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });
      
      if (data) setMessages(data);
    }
    fetchMessages();
  }, [leadId]);

  // Subscribe to new messages (Realtime)
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        lead_id: leadId,
        sender_id: currentUserId,
        receiver_id: '', // Fetch from lead details
        content: newMessage,
      });

    if (!error) {
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`mb-4 ${msg.sender_id === currentUserId ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block rounded-lg px-4 py-2 ${
                msg.sender_id === currentUserId
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-900'
              }`}
            >
              {msg.content}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {new Date(msg.created_at).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border px-4 py-2"
          />
          <button
            onClick={sendMessage}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### 5. File Upload to Supabase Storage

**Client Component:**
```typescript
// src/components/vendor/PhotoUpload.tsx
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface PhotoUploadProps {
  bucketName: 'vendor-photos' | 'package-photos';
  folderId: string;
  onUploadComplete: (urls: string[]) => void;
}

export function PhotoUpload({ bucketName, folderId, onUploadComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const supabase = createClientComponentClient();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const files = Array.from(e.target.files);
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folderId}/${Math.random()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return publicUrl;
    });

    try {
      const urls = await Promise.all(uploadPromises);
      onUploadComplete(urls);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/jpeg,image/png"
        multiple
        onChange={handleFileUpload}
        disabled={uploading}
        className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
      />
      {uploading && <p className="mt-2 text-sm text-slate-600">Uploading...</p>}
    </div>
  );
}
```

---

## Environment Variables

**`.env.local` (never commit this):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_PHONE_NUMBER=+15125551234

# SendGrid
SENDGRID_API_KEY=SG.xxxxx

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyxxxxx

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**`.env.example` (commit this):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# SendGrid
SENDGRID_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# App Config
NEXT_PUBLIC_APP_URL=
```

---

## Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint
npm run type-check             # Run TypeScript compiler check

# Supabase
npx supabase login