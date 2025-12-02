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

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  popular?: boolean;
  dietary_tags?: string[]; // 'vegan', 'gluten-free', etc.
}

export interface MenuCategory {
  id: string;
  name: string; // e.g., "Appetizers", "Main Course"
  description?: string;
  items: MenuItem[];
}

export interface Package {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  venue_details?: VenueDetails;
  catering_details?: {
    menu_options: string[]; // Legacy support
    dietary_accommodations: string[];
    menu_categories?: MenuCategory[]; // New structured menu
  };
  entertainment_details?: {
    type: string;
    equipment: string[];
  };
  rental_details?: {
    rental_type?: string;
    items?: string[];
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

// =====================================================
// VENDOR ONBOARDING WIZARD TYPES
// =====================================================

export type ServiceType = 'venue' | 'catering' | 'entertainment' | 'rentals';

// Step 1: Service Selection (can select multiple)
export interface OnboardingStep1Data {
  services: ServiceType[];
}

// Step 2: Account/Business Info
export interface OnboardingStep2Data {
  businessName: string;
  phone: string;
}

// Step 3: Business Location
export interface OnboardingStep3Data {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Step 4: Service-specific questions (varies by service type)
export interface OnboardingStep4VenueData {
  eventTypes: string[];
}

export interface OnboardingStep4CateringData {
  foodTypes: string[];
}

export interface OnboardingStep4EntertainmentData {
  entertainmentTypes: string[];
}

export interface OnboardingStep4RentalsData {
  rentalTypes: string[];
  deliveryOptions: string[];
}

// Step 5: Service-specific details (varies by service type)
export interface OnboardingStep5VenueData {
  minCapacity: number;
  maxCapacity: number;
  squareFootage?: number;
  shortDescription: string;
  hourlyRateMin: number;
  hourlyRateMax: number;
  amenities: string[];
  availability: WeeklyAvailability;
  exceptionDates: ExceptionDate[];
  photos: string[];
}

export interface OnboardingStep5CateringData {
  minGuestCount: number;
  maxGuestCount: number;
  shortDescription: string;
  pricePerPersonMin: number;
  pricePerPersonMax: number;
  servicesOffered: string[];
  availability: WeeklyAvailability;
  exceptionDates: ExceptionDate[];
  photos: string[];
}

export interface OnboardingStep5EntertainmentData {
  minPerformanceDuration: number; // in minutes
  maxPerformanceDuration: number;
  shortDescription: string;
  hourlyRateMin: number;
  hourlyRateMax: number;
  equipmentProvided: string[];
  availability: WeeklyAvailability;
  exceptionDates: ExceptionDate[];
  photos: string[];
}

export interface ItemizedPricing {
  itemType: string;
  pricePerItem: number;
  maxQuantity: number;
}

export interface OnboardingStep5RentalsData {
  minOrderSize: number;
  maxOrderSize: number;
  shortDescription: string;
  itemizedPricing: ItemizedPricing[];
  servicesOffered: string[];
  availability: WeeklyAvailability;
  exceptionDates: ExceptionDate[];
  photos: string[];
}

// Complete onboarding form data
export interface OnboardingFormData {
  // Steps 1-3 (common for all)
  step1: OnboardingStep1Data;
  step2: OnboardingStep2Data;
  step3: OnboardingStep3Data;

  // Steps 4-5 (service-specific, keyed by service type)
  venueStep4?: OnboardingStep4VenueData;
  venueStep5?: OnboardingStep5VenueData;
  cateringStep4?: OnboardingStep4CateringData;
  cateringStep5?: OnboardingStep5CateringData;
  entertainmentStep4?: OnboardingStep4EntertainmentData;
  entertainmentStep5?: OnboardingStep5EntertainmentData;
  rentalsStep4?: OnboardingStep4RentalsData;
  rentalsStep5?: OnboardingStep5RentalsData;
}

// =====================================================
// PREDEFINED OPTIONS FOR SERVICE-SPECIFIC FORMS
// =====================================================

export const FOOD_TYPES = [
  'BBQ & Grill',
  'Seafood Specialty',
  'Buffet Style',
  'Vegetarian',
  'Vegan',
  'Multi-Course Dinner',
  'Italian Cuisine',
  'Mexican Cuisine',
  'Mediterranean Cuisine',
  'Asian Fusion',
  'Kosher',
  'Gluten-Free',
  'Custom Menus',
  'Desserts & Pastries',
  'Other',
] as const;

export const ENTERTAINMENT_TYPES = [
  'Live Band',
  'DJ Services',
  'Solo Performer',
  'Acoustic Set',
  'Dance Troupe',
  'Comedy / MC',
  'Instrumentalist',
  'Wedding Ceremony Music',
  'Corporate Event Entertainment',
  'Custom Performances',
  'Lighting & Audio Packages',
  'Other',
] as const;

export const RENTAL_TYPES = [
  'Tables',
  'Chairs',
  'Linens & Napkins',
  'Tents & Canopies',
  'Centerpieces & Florals',
  'Tableware (Plates, Glassware, Cutlery)',
  'Staging / Flooring',
  'Lighting & Decor',
  'Lounge Furniture',
  'Bar Equipment',
  'Arches & Backdrops',
  'Other',
] as const;

export const DELIVERY_OPTIONS = [
  'Delivery Only',
  'Delivery + Setup',
  'Pickup by Client',
] as const;

export const CATERING_SERVICES = [
  'Buffet Service',
  'Plated Service',
  'Bartending',
  'Dessert Station',
  'Food Truck Option',
] as const;

export const RENTALS_SERVICES = [
  'Setup',
  'Tear Down',
  'Cleaning Service',
  'Custom Orders Available',
] as const;

export const ENTERTAINMENT_EQUIPMENT = [
  'Stage Lighting',
  'Microphones',
  'Fog Machine',
  'DJ Booth Setup',
  'Sound System',
  'Speakers',
  'Mixing Board',
  'Instruments',
] as const;
