/**
 * Supabase Client for Client Components
 * Use this in 'use client' components
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

export function createClient() {
  return createClientComponentClient<Database>();
}
