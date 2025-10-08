Product Requirements Document (PRD)
DAM Event Management Platform - P0 MVP

Document Information




Product Name
DAM Event Platform
Version
1.0 - MVP (P0)
Date
January 2025
Author
DAM-Event Mgmt Team
Status
Draft for Development
Target Launch
12 weeks from kickoff


1. Executive Summary
1.1 Product Overview
DAM Event Platform is a two-sided marketplace connecting event planners (primarily student organizations) with pre-vetted vendors offering complete event packages (venue + catering + entertainment). The platform solves the fragmented vendor discovery process by centralizing package browsing, quote requests, and vendor communication in one place.
1.2 Problem Statement
Event planners waste 15+ hours per event piecing together vendors across fragmented platforms, dealing with slow vendor response times, and managing communications via scattered text messages and emails. Vendors struggle to efficiently reach qualified clients and fill their schedules.
1.3 Solution
A lead generation and coordination platform where planners submit event requirements once and receive matched proposals from pre-vetted vendor packages, eliminating the back-and-forth communication bottleneck.
1.4 Business Model
Lead generation fees: $50-200 per qualified lead sent to vendors
Vendor subscriptions: $200-500/month for premium placement (P1 feature)
Coordination fees: $300-800 for white-glove service (P1 feature)
1.5 Success Criteria
20 verified vendors onboarded
50+ planner sign-ups
10 successful event bookings
25% lead-to-booking conversion rate
<24 hour average vendor response time

2. Goals & Objectives
2.1 Business Goals
Validate product-market fit with student organization market
Establish unit economics for lead generation model
Build curated vendor network of 20+ quality providers
Achieve first $5,000 in revenue from lead fees
Gather user feedback for P1 feature prioritization
2.2 User Goals
For Planners:
Reduce event planning time from 15+ hours to <2 hours
Find complete event packages in one centralized platform
Receive multiple vendor quotes within 24-48 hours
Communicate with all vendors in one unified inbox
For Vendors:
Receive qualified leads matching their capacity and pricing
Reduce time spent on unqualified inquiries
Increase booking fill rate by 20-30%
Build reputation through completed events on platform
2.3 Product Goals
Create seamless onboarding for both planners and vendors (<5 minutes)
Deliver accurate package matching (>80% relevance score from users)
Enable real-time messaging between planners and vendors
Provide mobile-responsive experience for on-the-go access
Maintain platform reliability (99%+ uptime)

3. User Personas
3.1 Primary Persona: Student Organization Event Planner
Demographics:
Age: 19-23
Role: Event chair, social chair, or president of student org
Organization type: Greek life, campus clubs, cultural organizations
Technical proficiency: Medium to high (comfortable with web apps)
Behaviors:
Plans 3-10 events per year
Budget range: $500-$5,000 per event
Time-constrained (juggling classes, job, org responsibilities)
Relies on personal network and Google searches for vendors
Pain Points:
Vendors take days to respond to inquiries
Must coordinate multiple vendors separately (venue, catering, DJ)
No central source of truth for vendor quality/reliability
Limited negotiation leverage as student organization
Switching costs high when vendor falls through
Goals:
Book high-quality event within budget
Minimize time spent on logistics
Avoid vendor reliability issues
Get approval from org leadership quickly
Quote: "I wish I could just tell vendors my requirements once and get quotes back without having to politely harass them for days."

3.2 Secondary Persona: Local Event Vendor
Demographics:
Age: 30-50
Role: Venue owner, catering business owner, entertainment provider
Business size: Small to medium (1-20 employees)
Technical proficiency: Low to medium
Behaviors:
Receives inquiries via text, email, Instagram, phone
Books 10-50 events per year
Responds to qualified leads within 24 hours
Prefers repeat customers (less friction)
Pain Points:
Many inquiries are unqualified or window shoppers
Must manually respond to each inquiry with pricing
Miss potential bookings due to slow response time
No efficient way to showcase full service capabilities
Student orgs sometimes cancel or ghost last minute
Goals:
Increase booking fill rate (especially weekdays)
Reduce time spent on unqualified leads
Build long-term relationships with repeat clients
Showcase complete service offering (not just venue)
Quote: "I love working with student groups, but I wish there was a way to filter serious inquiries and respond faster without the constant back-and-forth."

4. User Stories
4.1 Planner User Stories
Epic: Account Creation & Onboarding
As a planner, I want to sign up using my Google account so that I can quickly create an account without remembering another password
As a planner, I want to specify my organization name and role so that vendors know who I represent
As a planner, I want a guided onboarding so that I understand how to use the platform
Epic: Event Creation & Discovery
As a planner, I want to create an event request with date, budget, location, and guest count so that I can find suitable packages
As a planner, I want to browse pre-built event packages so that I can see complete offerings in one place
As a planner, I want to filter packages by budget, location, capacity, and event type so that I only see relevant options
As a planner, I want to see photos and details of each package component (venue, catering, entertainment) so that I can evaluate quality
As a planner, I want to see vendor ratings and past events (P1) so that I can assess reliability
Epic: Quote Requests & Communication
As a planner, I want to request quotes from multiple packages with one click so that I can save time
As a planner, I want to receive notifications when vendors respond so that I don't miss proposals
As a planner, I want to message vendors directly in the platform so that I can ask questions and negotiate
As a planner, I want to see all my quote requests and their statuses in one dashboard so that I can track progress
As a planner, I want to compare vendor proposals side-by-side so that I can make informed decisions
Epic: Booking & Confirmation
As a planner, I want to mark a lead as "booked" once I've confirmed offline so that the platform knows the event is closed
As a planner, I want to provide feedback on vendors after the event (P1) so that future planners can benefit

4.2 Vendor User Stories
Epic: Account Creation & Onboarding
As a vendor, I want to sign up using my Google account so that onboarding is quick
As a vendor, I want to create a business profile with photos, services, and contact info so that planners can learn about my business
As a vendor, I want platform admin to verify my business (manual process) so that planners trust the quality
Epic: Package Creation
As a vendor, I want to create event packages bundling venue, catering, and entertainment so that I can showcase complete offerings
As a vendor, I want to upload multiple photos for each package so that planners can see my space/services
As a vendor, I want to specify pricing ranges, capacity, and availability so that I receive qualified leads
As a vendor, I want to mark my services (e.g., "venue only" or "full package") so that planners understand what I offer
Epic: Lead Management
As a vendor, I want to receive SMS and email notifications when a new lead comes in so that I can respond quickly
As a vendor, I want to see full event details (date, budget, guest count, planner info) so that I can evaluate if it's a good fit
As a vendor, I want to respond to leads via in-platform messaging so that communication is centralized
As a vendor, I want to see a dashboard of all my leads and their statuses so that I can track my pipeline
As a vendor, I want to mark leads as "quoted," "declined," or "booked" so that I can manage my workflow
Epic: Analytics & Performance (P1)
As a vendor, I want to see how many leads I've received and my conversion rate so that I can assess platform ROI
As a vendor, I want to see my average response time so that I can improve customer service

5. Functional Requirements
5.1 Authentication & User Management
FR-001: Google OAuth Sign-Up
Users (planners and vendors) must be able to sign up using Google OAuth via Supabase Auth
System must capture email, name, and profile picture from Google
Users must select their role (planner or vendor) during first-time registration
System must create corresponding user record in users table
FR-002: Role Selection
After OAuth, user must choose "I'm planning an event" or "I'm a vendor"
Planner role requires: organization name
Vendor role requires: business name, phone number for lead notifications
Role determines which dashboard user sees after login
FR-003: Session Management
System must maintain user session via Supabase JWT tokens
Session must persist across browser refreshes
Users must be able to log out, invalidating their session
FR-004: Profile Management
Planners must be able to edit: name, organization, email
Vendors must be able to edit: business name, phone, email, profile description

5.2 Vendor Profile & Package Management
FR-005: Vendor Profile Creation
Vendors must be able to create a business profile with:
Business name (required)
Phone number for notifications (required)
Business description (required, max 500 characters)
Services offered: checkboxes for "Venue," "Catering," "Entertainment"
Location (address, converted to lat/lng via Google Maps Geocoding)
Business photos (up to 10 images, stored in Supabase Storage)
FR-006: Package Creation
Vendors must be able to create packages bundling their services
Package fields:
Package name (required)
Package description (required, max 1000 characters)
Venue details (if applicable): venue name, capacity, amenities
Catering details (if applicable): menu options, dietary accommodations
Entertainment details (if applicable): type, equipment provided
Price range: minimum and maximum (required)
Maximum capacity (required)
Package photos (up to 15 images)
Status: draft or published
FR-007: Package Photo Upload
System must allow vendors to upload images (JPEG, PNG) up to 5MB each
Images must be stored in Supabase Storage bucket: package-photos
System must generate unique file names to prevent collisions
System must return public URLs for uploaded images
FR-008: Package Editing
Vendors must be able to edit existing packages
Changes must save immediately to PostgreSQL database
System must display "Last updated" timestamp
FR-009: Vendor Verification (Manual Admin Process)
Admin must be able to review vendor profiles before they appear in search
Admin must be able to mark vendor as "verified" via admin dashboard
Only verified vendors' packages appear in planner search results

5.3 Planner Event Creation & Package Discovery
FR-010: Event Request Form
Planners must be able to create an event request with:
Event date (required, date picker)
Budget (required, number input with min/max validation)
Guest count (required, number input)
Location (required, address autocomplete via Google Maps API)
Event type (required, dropdown: social, mixer, formal, fundraiser, conference, other)
Event description (optional, max 500 characters)
Status: draft or active
FR-011: Package Search & Filtering
System must display packages that match event criteria:
Capacity filter: package.capacity >= event.guestCount
Budget filter: package.priceRange.min <= event.budget AND package.priceRange.max >= event.budget
Location filter: packages within 20 miles of event location
System must sort results by:
Proximity to event location (closest first)
Budget match (packages closest to budget range)
FR-012: Package Display
Each package card must show:
Vendor business name
Package name
Price range
Capacity
Primary photo
Distance from event location
Services included (icons for venue, catering, entertainment)
Click on package card opens detailed view
FR-013: Package Detail View
Detail view must show:
Full package description
Photo gallery (carousel or grid)
Venue, catering, and entertainment details
Vendor contact info (business name, phone after quote request)
"Request Quote" button (primary CTA)
Map showing venue location
FR-014: Multi-Package Quote Request
Planners must be able to select multiple packages (checkboxes)
"Request Quotes" button sends quote requests to all selected vendors
System creates a lead record for each package-event pair

5.4 Lead Generation & Management
FR-015: Lead Creation
When planner clicks "Request Quote," system must:
Create a lead record linking event + package + vendor
Set lead status to "new"
Capture timestamp as created_at
Generate unique lead_id
FR-016: Lead Notification (Vendor)
System must trigger notifications when lead is created:
SMS via Twilio: Send to vendor phone number with message: "New event lead! [guest count] guests, $[budget], [date]. View details: [link]"
Email via SendGrid: Send templated email with event details and link to lead
Link must direct vendor to /vendor/leads/[leadId]
FR-017: Planner Lead Dashboard
Planners must see a dashboard listing all leads with:
Vendor name
Package name
Event name
Lead status (new, viewed, quoted, booked, declined)
Date requested
Last activity timestamp
Clicking a lead opens the messaging interface
FR-018: Vendor Lead Dashboard
Vendors must see a dashboard listing all leads with:
Event details (date, budget, guest count)
Planner organization name
Lead status
Date received
Actions: "View Details," "Send Proposal"
Dashboard must show count of "new" leads prominently
FR-019: Lead Status Updates
Vendors must be able to update lead status to:
"viewed" (automatically when vendor opens lead)
"quoted" (when vendor sends first message)
"declined" (vendor not interested)
Planners must be able to update lead status to:
"booked" (event confirmed with this vendor)
"closed" (no longer considering this vendor)
FR-020: Lead Detail View
Lead detail page must show:
Full event information
Package information
Planner information (for vendors)
Vendor information (for planners)
Messaging interface
Status history timeline

5.5 Messaging System
FR-021: In-Platform Messaging
Planners and vendors must be able to send text messages within a lead context
Messages must be associated with a specific lead_id
System must support:
Text messages (up to 2000 characters)
Real-time delivery (messages appear immediately via Supabase Realtime)
Read receipts (mark message as "read" when opened)
FR-022: Message Thread Display
Messages must display in chronological order (oldest to newest)
Each message must show:
Sender name and role
Message content
Timestamp
Read status (for sender)
Interface must auto-scroll to newest message
FR-023: Message Notifications
System must send email notification when user receives a new message:
Subject: "New message from [sender name]"
Body: Excerpt of message + link to lead
Notification must NOT be sent if recipient is currently viewing the conversation
FR-024: Unread Message Indicators
Dashboards must show unread message count badges
Lead list items must show unread indicator if new messages exist

5.6 Admin Dashboard (Manual Vendor Vetting)
FR-025: Admin Authentication
Admin users must authenticate via Google OAuth
Admin role assigned manually in database (users.role = 'admin')
Admin must have access to admin dashboard at /admin
FR-026: Vendor Approval Interface
Admin must see list of pending vendors (status = "pending")
Each vendor entry must show:
Business name
Contact email
Phone number
Registration date
Profile description
Uploaded photos
Admin must be able to:
Approve (set status = "verified")
Reject (set status = "rejected" with reason)
FR-027: Vendor Management
Admin must be able to search/filter all vendors
Admin must be able to view vendor analytics:
Number of packages created
Number of leads received
Conversion rate (leads to bookings)
Average response time

6. Non-Functional Requirements
6.1 Performance
NFR-001: Page Load Time
All pages must load within 2 seconds on 4G connection
Database queries must complete within 500ms for 95th percentile
NFR-002: API Response Time
API endpoints must respond within 1 second for 95th percentile
Package search must return results within 1.5 seconds
NFR-003: Image Loading
Images must use lazy loading (load only when in viewport)
Images must be optimized for web (compress to <500KB)
NFR-004: Concurrent Users
System must support 100 concurrent users without degradation
Database connection pooling must handle 50 concurrent queries

6.2 Scalability
NFR-005: Database Scalability
PostgreSQL schema must support 10,000+ vendors
Database must handle 100,000+ leads without performance issues
Indexes must be created on frequently queried columns
NFR-006: Storage Scalability
Supabase Storage must handle 100GB+ of images
File uploads must not block other operations

6.3 Security
NFR-007: Authentication Security
All API endpoints must require valid JWT token (except public package browsing)
JWT tokens must expire after 24 hours
Refresh tokens must be used for session extension
NFR-008: Authorization
Row-level security (RLS) must be enabled on all Supabase tables
Users must only access their own data (leads, events, messages)
Vendors must only edit their own profiles and packages
NFR-009: Data Privacy
User email addresses must not be publicly visible
Planner phone numbers must not be shared with vendors until booking
Vendor phone numbers must only be visible after lead creation
NFR-010: Input Validation
All user inputs must be validated on client and server
SQL injection must be prevented via parameterized queries
XSS attacks must be prevented via input sanitization

6.4 Usability
NFR-011: Mobile Responsiveness
All pages must be fully functional on mobile devices (375px width minimum)
Touch targets must be at least 44x44 pixels
Forms must use appropriate mobile keyboards (number pad for numbers, email keyboard for email)
NFR-012: Accessibility
All images must have alt text
Forms must have proper labels
Color contrast must meet WCAG AA standards (4.5:1 for text)
Keyboard navigation must work for all interactive elements
NFR-013: Error Handling
User-facing error messages must be clear and actionable
System errors must be logged for debugging
Failed operations must allow retry without data loss

6.5 Reliability
NFR-014: Uptime
Target 99%+ uptime (excludes planned maintenance)
Database backups must run daily
Critical bugs must be patched within 24 hours
NFR-015: Data Integrity
All database transactions must be atomic
Soft deletes must be used (no hard deletes of user data)
Audit logs must track key actions (lead creation, status changes)

7. Technical Specifications
7.1 Technology Stack
Component
Technology
Version
Rationale
Frontend Framework
Next.js
14+
SSR for SEO, excellent DX, TypeScript support
UI Framework
React
18+
Component reusability, large ecosystem
Styling
Tailwind CSS
3+
Rapid development, utility-first
Backend
Next.js API Routes
14+
Serverless, unified codebase
Database
Supabase (PostgreSQL)
Latest
Open-source, realtime, RLS built-in
Authentication
Supabase Auth
Latest
OAuth providers, JWT, session mgmt
File Storage
Supabase Storage
Latest
S3-compatible, integrated with auth
Messaging
Supabase Realtime
Latest
WebSocket-based real-time
SMS
Twilio
Latest
Reliable, pay-per-use
Email
SendGrid
Latest
Transactional emails, templates
Maps
Google Maps API
Latest
Geocoding, distance calculations
Hosting
Vercel
Latest
Zero-config Next.js, edge functions
Version Control
GitHub
N/A
Code collaboration, CI/CD


7.2 Architecture Diagram
┌─────────────────────────────────────────────────────┐
│                   Client Layer                      │
│  (Next.js Frontend - React + Tailwind)              │
└─────────────────┬───────────────────────────────────┘
                  │ HTTPS
┌─────────────────▼───────────────────────────────────┐
│            Application Layer (Vercel)               │
│  ┌────────────────────────────────────────────┐     │
│  │    Next.js API Routes (Serverless)         │     │
│  └────────────────────────────────────────────┘     │
└─────────────────┬───────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬─────────────┐
    │             │             │             │
┌───▼───┐   ┌────▼────┐   ┌────▼────┐   ┌───▼────┐
│Supabase│   │ Twilio  │   │SendGrid │   │ Google │
│  Auth  │   │   SMS   │   │  Email  │   │  Maps  │
└───┬────┘   └─────────┘   └─────────┘   └────────┘
    │
┌───▼────────────────────────────────────────────────┐
│              Supabase Backend                      │
│  ┌──────────────────┐  ┌─────────────────────┐    │
│  │   PostgreSQL     │  │  Supabase Storage   │    │
│  │   Database       │  │  (Images/Files)     │    │
│  └──────────────────┘  └─────────────────────┘    │
│  ┌──────────────────────────────────────────┐     │
│  │     Supabase Realtime (WebSockets)       │     │
│  └──────────────────────────────────────────┘     │
└────────────────────────────────────────────────────┘


7.3 Database Schema (PostgreSQL)
-- Users table (managed by Supabase Auth + extended profile)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('planner', 'vendor', 'admin')),
  organization TEXT, -- For planners
  phone TEXT, -- For vendors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  services TEXT[] NOT NULL, -- ['venue', 'catering', 'entertainment']
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  venue_details JSONB, -- {name, capacity, amenities[]}
  catering_details JSONB, -- {menu_options[], dietary_accommodations[]}
  entertainment_details JSONB, -- {type, equipment[]}
  price_min DECIMAL(10, 2) NOT NULL,
  price_max DECIMAL(10, 2) NOT NULL,
  capacity INTEGER NOT NULL,
  photos TEXT[], -- Array of Supabase Storage URLs
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  guest_count INTEGER NOT NULL,
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  event_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'booked', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'quoted', 'booked', 'declined', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_location ON vendors USING GIST (ll_to_earth(location_lat, location_lng));
CREATE INDEX idx_packages_vendor ON packages(vendor_id);
CREATE INDEX idx_packages_capacity ON packages(capacity);
CREATE INDEX idx_packages_price ON packages(price_min, price_max);
CREATE INDEX idx_events_planner ON events(planner_id);
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_leads_vendor ON leads(vendor_id, status);
CREATE INDEX idx_leads_event ON leads(event_id);
CREATE INDEX idx_messages_lead ON messages(lead_id, created_at);


7.4 Supabase Row-Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Vendors: Public read, vendors can create/update own
CREATE POLICY "Anyone can view verified vendors" ON vendors
  FOR SELECT USING (status = 'verified');

CREATE POLICY "Vendors can create own profile" ON vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update own profile" ON vendors
  FOR UPDATE USING (auth.uid() = user_id);

-- Packages: Public read (published only), vendors can CRUD own
CREATE POLICY "Anyone can view published packages" ON packages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Vendors can create packages" ON packages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Vendors can update own packages" ON packages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

-- Events: Planners can CRUD own events
CREATE POLICY "Planners can view own events" ON events
  FOR SELECT USING (auth.uid() = planner_id);

CREATE POLICY "Planners can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = planner_id);

CREATE POLICY "Planners can update own events" ON events
  FOR UPDATE USING (auth.uid() = planner_id);

-- Leads: Both planner and vendor can view, limited updates
CREATE POLICY "Participants can view leads" ON leads
  FOR SELECT USING (
    auth.uid() = planner_id OR 
    auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id)
  );

CREATE POLICY "Planners can create leads" ON leads
  FOR INSERT WITH CHECK (auth.uid() = planner_id);

CREATE POLICY "Vendors can update lead status" ON leads
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM vendors WHERE id = vendor_id)
  );

-- Messages: Participants can read/write
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);


7.5 API Endpoints
Authentication
POST /api/auth/callback/google
  - Handled by Supabase Auth
  - Returns JWT token

POST /api/auth/signup/complete
  - Body: { role, organization?, phone? }
  - Creates user profile after OAuth
  - Returns: user object

GET /api/auth/user
  - Returns: current user profile

Vendors
POST /api/vendors
  - Body: { businessName, description, services[], locationAddress, phone }
  - Creates vendor profile
  - Returns: vendor object

PUT /api/vendors/[id]
  - Body: { businessName?, description?, services[]?, locationAddress? }
  - Updates vendor profile
  - Returns: updated vendor

GET /api/vendors/[id]
  - Returns: vendor public profile

Packages
POST /api/packages
  - Body: { vendorId, name, description, venueDetails?, cateringDetails?, 
           entertainmentDetails?, priceMin, priceMax, capacity }
  - Creates package
  - Returns: package object

PUT /api/packages/[id]
  - Body: { name?, description?, priceMin?, priceMax?, capacity?, status? }
  - Updates package
  - Returns: updated package

GET /api/packages
  - Query params: ?eventId=X (filters by event criteria)
  - Returns: array of matching packages

GET /api/packages/[id]
  - Returns: package details with vendor info

POST /api/packages/[id]/photos
  - Body: FormData with image files
  - Uploads photos to Supabase Storage
  - Returns: array of photo URLs

Events
POST /api/events
  - Body: { eventDate, budget, guestCount, locationAddress, eventType, description? }
  - Creates event
  - Returns: event object

GET /api/events
  - Returns: array of user's events

GET /api/events/[id]
  - Returns: event details

PUT /api/events/[id]
  - Body: { eventDate?, budget?, guestCount?, status? }
  - Updates event
  - Returns: updated event

Leads
POST /api/leads
  - Body: { eventId, packageId }
  - Creates lead, triggers notifications
  - Returns: lead object

GET /api/leads
  - Query params: ?role=planner|vendor
  - Returns: array of leads for user

GET /api/leads/[id]
  - Returns: lead details with event, package, and participant info

PUT /api/leads/[id]
  - Body: { status }
  - Updates lead status
  - Returns: updated lead

Messages
POST /api/messages
  - Body: { leadId, content }
  - Sends message
  - Triggers email notification to receiver
  - Returns: message object

GET /api/messages?leadId=[id]
  - Returns: array of messages for lead (chronological)

PUT /api/messages/[id]/read
  - Marks message as read
  - Returns: updated message

Admin
GET /api/admin/vendors?status=pending
  - Returns: vendors awaiting approval

PUT /api/admin/vendors/[id]/verify
  - Body: { status: 'verified' | 'rejected', reason? }
  - Updates vendor status
  - Returns: updated vendor


7.6 Supabase Storage Buckets
// Bucket: vendor-photos
// Purpose: Store vendor business profile photos
// Access: Public read, authenticated vendors can upload to their own folders
// Path structure: /{vendorId}/{photoId}.jpg

// Bucket: package-photos
// Purpose: Store package photos
// Access: Public read, authenticated vendors can upload to their own folders
// Path structure: /{packageId}/{photoId}.jpg

// Storage policies
CREATE POLICY "Public can view vendor photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-photos');

CREATE POLICY "Vendors can upload own photos" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'vendor-photos' AND
    auth.uid() IN (
      SELECT user_id FROM vendors WHERE id::text = (storage.foldername(name))[1]
    )
  );

CREATE POLICY "Public can view package photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'package-photos');

CREATE POLICY "Vendors can upload package photos" ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'package-photos' AND
    auth.uid() IN (
      SELECT v.user_id FROM vendors v
      JOIN packages p ON p.vendor_id = v.id
      WHERE p.id::text = (storage.foldername(name))[1]
    )
  );


8. User Interface Requirements
8.1 Design Principles
Mobile-first: Design for 375px width, scale up to desktop
Clean & minimal: Reduce cognitive load, prioritize key actions
Fast feedback: Loading states, success/error messages
Consistent: Reusable components, consistent spacing/colors
8.2 Color Palette
Primary: Blue (#3B82F6)
Secondary: Green (#10B981)
Accent: Purple (#8B5CF6)
Error: Red (#EF4444)
Warning: Yellow (#F59E0B)
Neutral: Slate (#64748B, #94A3B8, #CBD5E1, #F1F5F9)

8.3 Typography
Font: Inter (Google Fonts)
Heading: 24-32px, bold
Body: 14-16px, regular
Caption: 12px, medium
8.4 Key Pages
Landing Page (/)
Hero section with value proposition
Call-to-action: "Plan Your Event" (planner) or "List Your Venue" (vendor)
Feature highlights (3 columns)
Testimonials (P1)
Footer with links
Planner Dashboard (/planner/dashboard)
Header: "My Events"
Event list (cards):
Event name, date, budget
Status badge
Number of quotes received
CTA: "View Details"
Button: "+ Create New Event"
Secondary navigation: "Browse Packages," "Messages"
Package Browse (/planner/browse)
Left sidebar: Filters
Budget range (slider)
Location (map view or radius selector)
Capacity (number input)
Event type (checkboxes)
Services (venue, catering, entertainment)
Main area: Package grid (3 columns desktop, 1 column mobile)
Package card:
Primary photo
Vendor name
Package name
Price range
Capacity
Distance
Service icons
CTA: "Request Quote"
Sticky header: Selected event info (if creating from event)
Package Detail (/packages/[id])
Hero image (carousel if multiple photos)
Package name + vendor name
Description
Price range, capacity
Sections: Venue Details, Catering Details, Entertainment Details
Vendor info card (business name, phone after quote)
Location map
Primary CTA: "Request Quote" (opens modal if no active event)
Secondary CTA: "Message Vendor" (after quote request)
Vendor Dashboard (/vendor/dashboard)
Header: "My Leads"
Lead count badges: New (red), Quoted (yellow), Booked (green)
Lead list (table view):
Event date
Guest count
Budget
Planner org
Status
Last activity
CTA: "View" or "Respond"
Secondary navigation: "My Profile," "Packages," "Messages"
Lead Detail (/vendor/leads/[id] or /planner/leads/[id])
Left panel: Event details
Event date, time
Guest count
Budget
Location
Event type
Description
Center: Messaging interface
Message thread (scrollable)
Message input box
Send button
Right panel: Package details (vendor's package)
Status selector (vendor can update status)
Messaging (/messages)
Left sidebar: Conversation list
Lead summary (planner org, event date)
Last message preview
Timestamp
Unread indicator
Main area: Selected conversation
Message thread
Input box

9. Success Metrics & Analytics
9.1 Key Performance Indicators (KPIs)
Acquisition Metrics:
New planner sign-ups per week
New vendor applications per week
Traffic sources (organic, referral, paid)
Activation Metrics:
% of planners who create first event within 24 hours
% of vendors who complete profile within 48 hours
% of vendors who create first package within 1 week
Engagement Metrics:
Average leads requested per event
Average vendor response time to leads
Message send rate (messages per lead)
Conversion Metrics:
Lead-to-booking conversion rate (target: 25%)
% of leads responded to within 24 hours
% of planners who book 2nd event
Revenue Metrics:
Total leads generated
Revenue from lead fees
Average revenue per event
Retention Metrics:
Vendor churn rate (% leaving platform)
Planner return rate (% planning 2nd event)

9.2 Analytics Implementation
Tools:
Mixpanel: User behavior tracking (events, funnels)
Google Analytics 4: Traffic, demographics, conversions
Supabase Logs: API performance, errors
Events to Track:
// Planner events
mixpanel.track('Planner Signup', { source: 'google_oauth' });
mixpanel.track('Event Created', { budget, guestCount, eventType });
mixpanel.track('Package Viewed', { packageId, vendorId });
mixpanel.track('Quote Requested', { packageId, vendorId });
mixpanel.track('Message Sent', { leadId, recipient: 'vendor' });
mixpanel.track('Lead Booked', { leadId, packageId });

// Vendor events
mixpanel.track('Vendor Signup', { services: [] });
mixpanel.track('Package Created', { priceRange, capacity });
mixpanel.track('Lead Received', { leadId });
mixpanel.track('Lead Viewed', { leadId, responseTime });
mixpanel.track('Lead Quoted', { leadId });
mixpanel.track('Message Sent', { leadId, recipient: 'planner' });

// Admin events
mixpanel.track('Vendor Verified', { vendorId });



13. Testing Strategy
13.1 Unit Testing
Test utility functions (matching algorithm, distance calculation)
Test API route logic (isolated from database)
Target: 70% code coverage
13.2 Integration Testing
Test API endpoints with test database
Test authentication flows end-to-end
Test file upload to Supabase Storage
13.3 End-to-End Testing
Use Playwright or Cypress
Test critical user flows:
Planner creates event and requests quote
Vendor receives notification and responds
Messages are sent and received
13.4 User Acceptance Testing (UAT)
Recruit 5 planners and 5 vendors
Have them complete realistic scenarios
Gather feedback via survey
Fix critical usability issues before launch

15. Appendix
15.1 Glossary
Term
Definition
Lead
A quote request from a planner to a vendor for a specific event
Package
A bundled offering of venue, catering, and/or entertainment
P0/P1/P2
Priority levels for features (P0 = must-have MVP, P1 = next iteration)
RLS
Row-Level Security (Supabase database access control)
JWT
JSON Web Token (authentication token)
OAuth
Open Authorization (third-party login)

15.2 Reference Links
Supabase Documentation: https://supabase.com/docs
Next.js Documentation: https://nextjs.org/docs
Tailwind CSS: https://tailwindcss.com/docs
Google Maps API: https://developers.google.com/maps
Twilio SMS API: https://www.twilio.com/docs/sms
SendGrid Email API: https://docs.sendgrid.com


