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
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  event_types: string[];
  status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

// Day of week availability
export interface DayAvailability {
  isOpen: boolean;
  openTime: string;  // Format: "9:00 AM"
  closeTime: string; // Format: "10:00 PM"
}

// Weekly availability schedule
export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

// Exception date (holidays, special closures)
export interface ExceptionDate {
  date: string; // Format: "YYYY-MM-DD"
  reason: string;
}

// Enhanced venue details structure
export interface VenueDetails {
  name: string;
  min_capacity: number;
  max_capacity: number;
  square_footage?: number;
  short_description?: string;
  amenities: string[];
  availability?: WeeklyAvailability;
  exception_dates?: ExceptionDate[];
}

export interface Package {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  venue_details?: VenueDetails;
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
  hourly_rate_min?: number;
  hourly_rate_max?: number;
  capacity: number;
  photos: string[];
  status: 'draft' | 'published';
  embedding?: number[]; // Vector embedding for AI search
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
  events?: Event; // Alternative property name from API
  package?: Package;
  packages?: Package; // Alternative property name from API
  vendor?: Vendor;
  vendors?: Vendor; // Supabase returns table name (plural)
  users?: User; // For planner info
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

// Client-side message type with status for optimistic updates
export interface MessageWithStatus extends Message {
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  tempId?: string; // Temporary ID for optimistic updates
  error?: string; // Error message if failed
}

// =====================================================
// MULTI-STEP PACKAGE WIZARD TYPES
// =====================================================

// Step 1: Service Selection
export interface ServiceSelectionData {
  services: string[]; // ['catering', 'venue', 'entertainment', 'rentals']
}

// Step 2: Account Creation (skip if already authenticated)
export interface AccountCreationData {
  full_name: string;
  venue_name?: string; // Alternative to full_name for businesses
  email: string;
  phone?: string;
}

// Step 3: Business Location
export interface BusinessLocationData {
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  location_lat?: number;
  location_lng?: number;
}

// Step 4: Event Types
export interface EventTypesData {
  event_types: string[];
}

// Step 5: Venue Information
export interface VenueInformationData {
  min_capacity: number;
  max_capacity: number;
  square_footage?: number;
  short_description: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  amenities: string[];
  availability: WeeklyAvailability;
  exception_dates: ExceptionDate[];
  photos: string[];
}

// Complete wizard form data
export interface PackageWizardData {
  step1: ServiceSelectionData;
  step2: AccountCreationData;
  step3: BusinessLocationData;
  step4: EventTypesData;
  step5: VenueInformationData;
}

// Wizard step numbers
export type WizardStep = 1 | 2 | 3 | 4 | 5;

// =====================================================
// PREDEFINED OPTIONS & CONSTANTS
// =====================================================

export const EVENT_TYPES = [
  'Weddings',
  'Bridal Party',
  'Birthday Party',
  'Quinceanera',
  'Graduation Party',
  'Baby Shower',
  'Corporate Event',
  'Networking Event',
  'Holiday Party',
  'Live Music',
  'Watch Party',
  'Dance Performance',
  'Private Dinner',
  'Fitness Class',
  'Fashion Show',
  'Political Gathering',
  'Reunion',
  'Bar/Bat Mitzvah',
  'Cultural Festival',
  'Other',
] as const;

export const COMMON_AMENITIES = [
  'Wi-Fi',
  'Restrooms',
  'Catering Allowed',
  'Tables & Chairs',
  'Wheelchair Access',
  'Parking',
  'Stage',
  'Dance Floor',
  'Audio System',
  'Projector',
  'Kitchen',
  'Bar Area',
  'Outdoor Space',
  'Air Conditioning',
  'Heating',
  'Security',
  'Loading Dock',
  'Green Room',
  'Photography Allowed',
  'Alcohol Allowed',
] as const;

export const SERVICE_TYPES = [
  { id: 'catering', label: 'Catering', icon: '🍽️' },
  { id: 'venue', label: 'Venue', icon: '🏢' },
  { id: 'entertainment', label: 'Entertainment', icon: '🎵' },
  { id: 'rentals', label: 'Rentals', icon: '🪑' },
] as const;

export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];
