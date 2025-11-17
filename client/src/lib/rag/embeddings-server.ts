import { createClient } from '@/lib/supabase/server';
import { getEmbedding } from '@/lib/embeddings';

/**
 * Generate and store embedding for a package
 */
export async function generatePackageEmbedding(packageId: string) {
  const supabase = createClient();
  
  // Fetch package with searchable text
  const { data: pkg, error } = await supabase
    .from('packages')
    .select('id, searchable_text')
    .eq('id', packageId)
    .single();
    
  if (error || !pkg?.searchable_text) {
    throw new Error('Failed to fetch package');
  }
  
  // Generate embedding
  const embedding = await getEmbedding(pkg.searchable_text);
  
  // Store embedding
  const { error: updateError } = await supabase
    .from('packages')
    .update({ embedding })
    .eq('id', packageId);
    
  if (updateError) {
    throw new Error('Failed to store embedding');
  }
  
  return { success: true, packageId };
}

/**
 * Generate and store embedding for a vendor
 */
export async function generateVendorEmbedding(vendorId: string) {
  const supabase = createClient();
  
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('id, searchable_text')
    .eq('id', vendorId)
    .single();
    
  if (error || !vendor?.searchable_text) {
    throw new Error('Failed to fetch vendor');
  }
  
  const embedding = await getEmbedding(vendor.searchable_text);
  
  const { error: updateError } = await supabase
    .from('vendors')
    .update({ embedding })
    .eq('id', vendorId);
    
  if (updateError) {
    throw new Error('Failed to store embedding');
  }
  
  return { success: true, vendorId };
}

/**
 * Generate and store embedding for an event
 */
export async function generateEventEmbedding(eventId: string) {
  const supabase = createClient();
  
  const { data: event, error } = await supabase
    .from('events')
    .select('id, searchable_text')
    .eq('id', eventId)
    .single();
    
  if (error || !event?.searchable_text) {
    throw new Error('Failed to fetch event');
  }
  
  const embedding = await getEmbedding(event.searchable_text);
  
  const { error: updateError } = await supabase
    .from('events')
    .update({ embedding })
    .eq('id', eventId);
    
  if (updateError) {
    throw new Error('Failed to store embedding');
  }
  
  return { success: true, eventId };
}

/**
 * Batch process all packages to generate embeddings
 */
export async function regenerateAllPackageEmbeddings() {
  const supabase = createClient();
  
  const { data: packages } = await supabase
    .from('packages')
    .select('id, searchable_text')
    .not('searchable_text', 'is', null);
    
  if (!packages) return { processed: 0, failed: 0, total: 0 };
  
  let processed = 0;
  let failed = 0;
  
  for (const pkg of packages) {
    try {
      await generatePackageEmbedding(pkg.id);
      processed++;
    } catch (error) {
      console.error(`Failed to process package ${pkg.id}:`, error);
      failed++;
    }
  }
  
  return { processed, failed, total: packages.length };
}

/**
 * Batch process all vendors to generate embeddings
 */
export async function regenerateAllVendorEmbeddings() {
  const supabase = createClient();
  
  const { data: vendors } = await supabase
    .from('vendors')
    .select('id, searchable_text')
    .not('searchable_text', 'is', null);
    
  if (!vendors) return { processed: 0, failed: 0, total: 0 };
  
  let processed = 0;
  let failed = 0;
  
  for (const vendor of vendors) {
    try {
      await generateVendorEmbedding(vendor.id);
      processed++;
    } catch (error) {
      console.error(`Failed to process vendor ${vendor.id}:`, error);
      failed++;
    }
  }
  
  return { processed, failed, total: vendors.length };
}

