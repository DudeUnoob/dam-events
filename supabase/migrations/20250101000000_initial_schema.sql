-- DAM Event Platform - Initial Database Schema
-- P0 MVP - All tables, indexes, and RLS policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('planner', 'vendor', 'admin')),
  organization TEXT, -- For planners
  phone TEXT, -- For vendors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendors table
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
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
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  planner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
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
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  package_id UUID REFERENCES public.packages(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'viewed', 'quoted', 'booked', 'declined', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.users(id),
  receiver_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Vendors indexes
CREATE INDEX idx_vendors_status ON public.vendors(status);
CREATE INDEX idx_vendors_user_id ON public.vendors(user_id);
CREATE INDEX idx_vendors_location ON public.vendors(location_lat, location_lng);

-- Packages indexes
CREATE INDEX idx_packages_vendor ON public.packages(vendor_id);
CREATE INDEX idx_packages_capacity ON public.packages(capacity);
CREATE INDEX idx_packages_price ON public.packages(price_min, price_max);
CREATE INDEX idx_packages_status ON public.packages(status);

-- Events indexes
CREATE INDEX idx_events_planner ON public.events(planner_id);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);

-- Leads indexes
CREATE INDEX idx_leads_vendor ON public.leads(vendor_id, status);
CREATE INDEX idx_leads_event ON public.leads(event_id);
CREATE INDEX idx_leads_planner ON public.leads(planner_id);
CREATE INDEX idx_leads_package ON public.leads(package_id);

-- Messages indexes
CREATE INDEX idx_messages_lead ON public.messages(lead_id, created_at);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver ON public.messages(receiver_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update own profile
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Vendors: Public read for verified, vendors can create/update own
CREATE POLICY "Anyone can view verified vendors" ON public.vendors
  FOR SELECT USING (status = 'verified' OR auth.uid() = user_id);

CREATE POLICY "Vendors can create own profile" ON public.vendors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Vendors can update own profile" ON public.vendors
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin can view all vendors
CREATE POLICY "Admins can view all vendors" ON public.vendors
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update any vendor
CREATE POLICY "Admins can update vendors" ON public.vendors
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Packages: Public read (published only), vendors can CRUD own
CREATE POLICY "Anyone can view published packages" ON public.packages
  FOR SELECT USING (
    status = 'published' OR
    EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Vendors can create packages" ON public.packages
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Vendors can update own packages" ON public.packages
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Vendors can delete own packages" ON public.packages
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.vendors WHERE id = vendor_id AND user_id = auth.uid())
  );

-- Events: Planners can CRUD own events
CREATE POLICY "Planners can view own events" ON public.events
  FOR SELECT USING (auth.uid() = planner_id);

CREATE POLICY "Planners can create events" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = planner_id);

CREATE POLICY "Planners can update own events" ON public.events
  FOR UPDATE USING (auth.uid() = planner_id);

CREATE POLICY "Planners can delete own events" ON public.events
  FOR DELETE USING (auth.uid() = planner_id);

-- Leads: Both planner and vendor can view, limited updates
CREATE POLICY "Participants can view leads" ON public.leads
  FOR SELECT USING (
    auth.uid() = planner_id OR
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  );

CREATE POLICY "Planners can create leads" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = planner_id);

CREATE POLICY "Participants can update leads" ON public.leads
  FOR UPDATE USING (
    auth.uid() = planner_id OR
    auth.uid() IN (SELECT user_id FROM public.vendors WHERE id = vendor_id)
  );

-- Messages: Participants can read/write
CREATE POLICY "Participants can view messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages read" ON public.messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update lead viewed_at
CREATE OR REPLACE FUNCTION update_lead_viewed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'viewed' AND OLD.status = 'new' AND NEW.viewed_at IS NULL THEN
    NEW.viewed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_lead_viewed_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_lead_viewed_at();

-- Function to auto-update lead responded_at
CREATE OR REPLACE FUNCTION update_lead_responded_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'quoted' AND OLD.status IN ('new', 'viewed') AND NEW.responded_at IS NULL THEN
    NEW.responded_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_update_lead_responded_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION update_lead_responded_at();
