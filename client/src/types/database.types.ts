/**
 * Database types for Supabase
 *
 * IMPORTANT: This file should be auto-generated after running migrations
 * Run: npx supabase gen types typescript --project-id khzxpdfpcocjamlashld > src/types/database.types.ts
 *
 * For now, using manual types based on schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'planner' | 'vendor' | 'admin'
          organization: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role: 'planner' | 'vendor' | 'admin'
          organization?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'planner' | 'vendor' | 'admin'
          organization?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendors: {
        Row: {
          id: string
          user_id: string
          business_name: string
          description: string | null
          services: string[]
          location_address: string
          location_lat: number | null
          location_lng: number | null
          status: 'pending' | 'verified' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          description?: string | null
          services: string[]
          location_address: string
          location_lat?: number | null
          location_lng?: number | null
          status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          description?: string | null
          services?: string[]
          location_address?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: 'pending' | 'verified' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          vendor_id: string
          name: string
          description: string
          venue_details: Json | null
          catering_details: Json | null
          entertainment_details: Json | null
          price_min: number
          price_max: number
          capacity: number
          photos: string[]
          status: 'draft' | 'published'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          name: string
          description: string
          venue_details?: Json | null
          catering_details?: Json | null
          entertainment_details?: Json | null
          price_min: number
          price_max: number
          capacity: number
          photos?: string[]
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          name?: string
          description?: string
          venue_details?: Json | null
          catering_details?: Json | null
          entertainment_details?: Json | null
          price_min?: number
          price_max?: number
          capacity?: number
          photos?: string[]
          status?: 'draft' | 'published'
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          planner_id: string
          event_date: string
          budget: number
          guest_count: number
          location_address: string
          location_lat: number | null
          location_lng: number | null
          event_type: string
          description: string | null
          status: 'draft' | 'active' | 'booked' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          planner_id: string
          event_date: string
          budget: number
          guest_count: number
          location_address: string
          location_lat?: number | null
          location_lng?: number | null
          event_type: string
          description?: string | null
          status?: 'draft' | 'active' | 'booked' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          planner_id?: string
          event_date?: string
          budget?: number
          guest_count?: number
          location_address?: string
          location_lat?: number | null
          location_lng?: number | null
          event_type?: string
          description?: string | null
          status?: 'draft' | 'active' | 'booked' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          event_id: string
          vendor_id: string
          package_id: string
          planner_id: string
          status: 'new' | 'viewed' | 'quoted' | 'booked' | 'declined' | 'closed'
          created_at: string
          viewed_at: string | null
          responded_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          vendor_id: string
          package_id: string
          planner_id: string
          status?: 'new' | 'viewed' | 'quoted' | 'booked' | 'declined' | 'closed'
          created_at?: string
          viewed_at?: string | null
          responded_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          vendor_id?: string
          package_id?: string
          planner_id?: string
          status?: 'new' | 'viewed' | 'quoted' | 'booked' | 'declined' | 'closed'
          created_at?: string
          viewed_at?: string | null
          responded_at?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          lead_id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          lead_id: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          lead_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
