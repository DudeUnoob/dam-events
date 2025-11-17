/**
 * Backfill Embeddings Script
 * Generates vector embeddings for all existing packages in the database
 *
 * Usage:
 *   npx tsx scripts/backfill-embeddings.ts
 *
 * Requirements:
 *   - OPENAI_API_KEY must be set in environment
 *   - SUPABASE_SERVICE_ROLE_KEY must be set (for admin operations)
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before importing anything that uses them
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

import { createClient } from '@supabase/supabase-js';
import {
  generateEmbedding,
  generateEmbeddingsBatch,
  generateSearchDescription,
  validateEmbedding,
} from '../src/lib/ai/embeddings';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set (required for admin operations)');
}

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
  embedding: number[] | null;
  search_description: string | null;
}

async function backfillEmbeddings() {
  console.log('🚀 Starting embedding backfill process...\n');

  try {
    // Fetch all packages without embeddings
    console.log('📦 Fetching packages from database...');
    const { data: packages, error: fetchError } = await supabase
      .from('packages')
      .select('*')
      .is('embedding', null);

    if (fetchError) {
      throw new Error(`Failed to fetch packages: ${fetchError.message}`);
    }

    if (!packages || packages.length === 0) {
      console.log('✅ No packages need embeddings. All packages are already embedded!');
      return;
    }

    console.log(`📊 Found ${packages.length} packages needing embeddings\n`);

    // Process packages in batches of 10 (OpenAI allows up to 2048 inputs per request)
    const BATCH_SIZE = 10;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < packages.length; i += BATCH_SIZE) {
      const batch = packages.slice(i, i + BATCH_SIZE);
      console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(packages.length / BATCH_SIZE)}...`);

      // Generate search descriptions for batch
      const searchDescriptions = batch.map((pkg) =>
        generateSearchDescription({
          name: pkg.name,
          description: pkg.description || '',
          venue_details: pkg.venue_details || {},
          catering_details: pkg.catering_details || {},
          entertainment_details: pkg.entertainment_details || {},
          price_min: pkg.price_min,
          price_max: pkg.price_max,
          capacity: pkg.capacity,
        })
      );

      try {
        // Generate embeddings in batch (more efficient than one-by-one)
        console.log('🤖 Generating embeddings with OpenAI...');
        const embeddings = await generateEmbeddingsBatch(searchDescriptions);

        // Validate embeddings
        for (const embedding of embeddings) {
          if (!validateEmbedding(embedding)) {
            throw new Error('Invalid embedding dimensions');
          }
        }

        // Update database for each package in batch
        for (let j = 0; j < batch.length; j++) {
          const pkg = batch[j];
          const embedding = embeddings[j];
          const searchDescription = searchDescriptions[j];

          const { error: updateError } = await supabase
            .from('packages')
            .update({
              embedding: embedding,
              search_description: searchDescription,
            })
            .eq('id', pkg.id);

          if (updateError) {
            console.error(`❌ Error updating package ${pkg.id}:`, updateError.message);
            errorCount++;
          } else {
            console.log(`✅ Updated package: ${pkg.name} (${pkg.id})`);
            successCount++;
          }
        }

        // Rate limiting: wait 200ms between batches to avoid hitting API limits
        if (i + BATCH_SIZE < packages.length) {
          console.log('⏳ Waiting 200ms before next batch...');
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error: any) {
        console.error(`❌ Error processing batch:`, error.message);
        // Continue with next batch even if this one fails
        errorCount += batch.length;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKFILL SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully embedded: ${successCount} packages`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} packages`);
    }
    console.log(`📈 Total processed: ${packages.length} packages`);
    console.log('='.repeat(60));

    // Verify embeddings were created
    const { count } = await supabase
      .from('packages')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null);

    console.log(`\n🔍 Total packages with embeddings in database: ${count}`);
    console.log('\n✨ Backfill complete!\n');
  } catch (error: any) {
    console.error('\n❌ Backfill failed:', error.message);
    process.exit(1);
  }
}

// Run the backfill
backfillEmbeddings()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
