/**
 * Generate Embeddings Script
 * Generates vector embeddings for all existing packages
 *
 * Usage: npx tsx scripts/generate-embeddings.ts
 */

import { createClient } from '@supabase/supabase-js';
import { generateEmbeddings, createPackageSearchText } from '../src/lib/openai/embeddings';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface Package {
  id: string;
  name: string;
  description: string;
  venue_details: any;
  catering_details: any;
  entertainment_details: any;
  price_min: number;
  price_max: number;
  capacity: number;
  embedding: any;
}

async function generatePackageEmbeddings() {
  console.log('🚀 Starting embedding generation...\n');

  // Fetch all published packages without embeddings
  const { data: packages, error: fetchError } = await supabase
    .from('packages')
    .select('*')
    .eq('status', 'published')
    .is('embedding', null);

  if (fetchError) {
    console.error('❌ Error fetching packages:', fetchError);
    process.exit(1);
  }

  if (!packages || packages.length === 0) {
    console.log('✅ No packages need embeddings. All done!');
    return;
  }

  console.log(`📦 Found ${packages.length} packages without embeddings\n`);

  // Process in batches to avoid rate limits
  const BATCH_SIZE = 100; // OpenAI allows up to 2048 inputs per request
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < packages.length; i += BATCH_SIZE) {
    const batch = packages.slice(i, i + BATCH_SIZE);
    console.log(`\n🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} packages)...`);

    try {
      // Create searchable text for each package
      const searchTexts = batch.map((pkg: Package) =>
        createPackageSearchText({
          name: pkg.name,
          description: pkg.description,
          venue_details: pkg.venue_details,
          catering_details: pkg.catering_details,
          entertainment_details: pkg.entertainment_details,
          price_min: pkg.price_min,
          price_max: pkg.price_max,
          capacity: pkg.capacity,
        })
      );

      // Generate embeddings for the batch
      console.log('   Generating embeddings...');
      const embeddings = await generateEmbeddings(searchTexts);

      // Update packages with embeddings
      console.log('   Saving embeddings to database...');
      const updates = batch.map((pkg: Package, index: number) =>
        supabase
          .from('packages')
          .update({ embedding: embeddings[index] })
          .eq('id', pkg.id)
      );

      const results = await Promise.allSettled(updates);

      // Count successes and failures
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successCount++;
          console.log(`   ✓ ${batch[index].name}`);
        } else {
          errorCount++;
          console.error(`   ✗ ${batch[index].name}: ${result.reason}`);
        }
      });

    } catch (error: any) {
      console.error(`   ❌ Batch error: ${error.message}`);
      errorCount += batch.length;
    }

    // Rate limit protection: wait 1 second between batches
    if (i + BATCH_SIZE < packages.length) {
      console.log('   ⏳ Waiting 1 second before next batch...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📦 Total: ${packages.length}`);
  console.log('='.repeat(50) + '\n');

  if (successCount > 0) {
    console.log('🎉 Embedding generation complete!');
    console.log('You can now use semantic search in the browse page.\n');
  }
}

// Run the script
generatePackageEmbeddings()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
