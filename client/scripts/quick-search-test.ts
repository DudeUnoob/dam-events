/**
 * Quick Search Test
 * Tests the search API to verify it's working
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testSearch(query: string) {
  console.log(`\n🔍 Testing: "${query}"`);
  console.log('='.repeat(60));

  try {
    const response = await fetch(`${API_URL}/api/search/smart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 5,
        threshold: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.error) {
      console.error('❌ Error:', result.error.message);
      return;
    }

    const data = result.data;
    console.log(`✅ Found ${data.count} results (${data.totalMatches} total matches)`);

    if (data.correctedQuery) {
      console.log(`📝 Corrected: "${data.correctedQuery}"`);
    }

    if (data.results.length > 0) {
      console.log('\n📦 Top Results:');
      data.results.forEach((pkg: any, i: number) => {
        console.log(`  ${i + 1}. ${pkg.name}`);
        console.log(`     Price: $${pkg.price_min}-${pkg.price_max} | Capacity: ${pkg.capacity}`);
        if (pkg.similarity) {
          console.log(`     Similarity: ${(pkg.similarity * 100).toFixed(1)}%`);
        }
      });
    }
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

async function main() {
  console.log('\n🚀 QUICK SEARCH TEST');
  console.log(`API: ${API_URL}`);
  console.log('NOTE: Make sure dev server is running (npm run dev)\n');

  await testSearch('seafood food');
  await new Promise(r => setTimeout(r, 500));

  await testSearch('outdoor wedding');
  await new Promise(r => setTimeout(r, 500));

  await testSearch('vegan');

  console.log('\n✅ Tests complete!\n');
}

main().catch(console.error);
