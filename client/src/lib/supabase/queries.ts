/**
 * Common Supabase queries
 * Reusable database query helpers
 */

import type { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

type Client = SupabaseClient<Database>;

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(supabase: Client) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return { data, error };
}

/**
 * Get vendor by user ID
 */
export async function getVendorByUserId(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', userId)
    .single();

  return { data, error };
}

/**
 * Get vendor packages
 */
export async function getVendorPackages(supabase: Client, vendorId: string) {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get planner events
 */
export async function getPlannerEvents(supabase: Client, plannerId: string) {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('planner_id', plannerId)
    .order('event_date', { ascending: true });

  return { data, error };
}

/**
 * Get leads for vendor
 */
export async function getVendorLeads(supabase: Client, vendorId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      events (*),
      packages (*),
      users!leads_planner_id_fkey (
        full_name,
        email,
        organization
      )
    `)
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get leads for planner
 */
export async function getPlannerLeads(supabase: Client, plannerId: string) {
  const { data, error } = await supabase
    .from('leads')
    .select(`
      *,
      events (*),
      packages (*),
      vendors (
        business_name,
        location_address
      )
    `)
    .eq('planner_id', plannerId)
    .order('created_at', { ascending: false });

  return { data, error };
}

/**
 * Get messages for a lead
 */
export async function getLeadMessages(supabase: Client, leadId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true });

  return { data, error };
}

/**
 * Get unread message count for user
 */
export async function getUnreadMessageCount(supabase: Client, userId: string) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('read', false);

  return { count, error };
}
