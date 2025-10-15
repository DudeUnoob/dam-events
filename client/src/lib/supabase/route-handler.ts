/**
 * Supabase Client for API Route Handlers
 * Use this in Next.js API Routes (app/api/*)
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

export function createClient() {
  return createRouteHandlerClient<Database>({ cookies });
}
