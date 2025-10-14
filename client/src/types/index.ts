// Custom types for DAM Event Platform

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'planner' | 'vendor' | 'admin';
  organization?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  services: string[];
  location_address: string;
  location_lat: number;
  location_lng: number;
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  venue_details?: {
    name: string;
    capacity: number;
    amenities: string[];
  };
  catering_details?: {
    menu_options: string[];
    dietary_accommodations: string[];
  };
  entertainment_details?: {
    type: string;
    equipment: string[];
  };
  price_min: number;
  price_max: number;
  capacity: number;
  photos: string[];
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  vendor?: Vendor;
  distance?: number;
  score?: number;
}

export interface Event {
  id: string;
  planner_id: string;
  event_date: string;
  budget: number;
  guest_count: number;
  location_address: string;
  location_lat: number;
  location_lng: number;
  event_type: string;
  description?: string;
  status: 'draft' | 'active' | 'booked' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  event_id: string;
  vendor_id: string;
  package_id: string;
  planner_id: string;
  status: 'new' | 'viewed' | 'quoted' | 'booked' | 'declined' | 'closed';
  created_at: string;
  viewed_at?: string;
  responded_at?: string;
  updated_at: string;
  event?: Event;
  package?: Package;
  vendor?: Vendor;
}

export interface Message {
  id: string;
  lead_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}
