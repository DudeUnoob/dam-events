/**
 * Search Testing Script
 * Tests the improved semantic search with various queries
 *
 * Usage: npx tsx scripts/test-search.ts
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SearchResult {
  data: {
    results: any[];
    count: number;
    totalMatches: number;
    query: string;
    correctedQuery: string | null;
    expandedQuery: string | null;
    extractedParams: any;
    didYouMean: string[] | null;
    relatedSearches: string[] | null;
    searchQuality: any;
  };
  error: null | any;
}

async function testSearch(query: string): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log(`🔍 Testing query: "${query}"`);
  console.log('='.repeat(80));

  try {
    const response = await fetch(`${API_URL}/api/search/smart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: 10,
        threshold: 0.3,
        useExpansion: true,
        useReranking: true,
        includeSuggestions: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SearchResult = await response.json();

    if (result.error) {
      console.error('❌ Search error:', result.error);
      return;
    }

    const data = result.data;

    console.log('\n📊 RESULTS SUMMARY');
    console.log('-'.repeat(80));
    console.log(`✅ Found ${data.count} results (${data.totalMatches} total matches)`);

    if (data.correctedQuery) {
      console.log(`📝 Query corrected to: "${data.correctedQuery}"`);
    }

    if (data.expandedQuery) {
      console.log(`🔍 Expanded query: "${data.expandedQuery}"`);
    }

    console.log('\n🎯 EXTRACTED PARAMETERS');
    console.log('-'.repeat(80));
    console.log('Budget:', data.extractedParams.budget_max || 'N/A');
    console.log('Capacity:', data.extractedParams.capacity_min || 'N/A');
    console.log('Location:', data.extractedParams.location || 'N/A');
    console.log('Food Type:', data.extractedParams.food_type || 'N/A');
    console.log('Venue Type:', data.extractedParams.venue_type || 'N/A');

    if (data.searchQuality) {
      console.log('\n📈 SEARCH QUALITY');
      console.log('-'.repeat(80));
      console.log('Score:', (data.searchQuality.score * 100).toFixed(0) + '%');
      if (data.searchQuality.issues.length > 0) {
        console.log('Issues:', data.searchQuality.issues.join(', '));
      }
      if (data.searchQuality.suggestions.length > 0) {
        console.log('Tips:', data.searchQuality.suggestions.join(', '));
      }
    }

    if (data.didYouMean && data.didYouMean.length > 0) {
      console.log('\n💡 DID YOU MEAN?');
      console.log('-'.repeat(80));
      data.didYouMean.forEach((suggestion, i) => {
        console.log(`  ${i + 1}. ${suggestion}`);
      });
    }

    if (data.relatedSearches && data.relatedSearches.length > 0) {
      console.log('\n🔗 RELATED SEARCHES');
      console.log('-'.repeat(80));
      data.relatedSearches.forEach((search, i) => {
        console.log(`  ${i + 1}. ${search}`);
      });
    }

    console.log('\n📦 TOP RESULTS');
    console.log('-'.repeat(80));

    data.results.slice(0, 5).forEach((pkg, i) => {
      console.log(`\n${i + 1}. ${pkg.name}`);
      console.log(`   Price: $${pkg.price_min} - $${pkg.price_max}`);
      console.log(`   Capacity: ${pkg.capacity} people`);
      console.log(`   Similarity: ${(pkg.similarity * 100).toFixed(1)}%`);

      if (pkg.rerank_score) {
        console.log(`   Rerank Score: ${(pkg.rerank_score * 100).toFixed(1)}%`);
      }

      if (pkg.ranking_explanation && pkg.ranking_explanation.length > 0) {
        console.log(`   Why: ${pkg.ranking_explanation.join(', ')}`);
      }

      if (pkg.catering_details?.menu_options) {
        const menuItems = Array.isArray(pkg.catering_details.menu_options)
          ? pkg.catering_details.menu_options
          : [];
        if (menuItems.length > 0) {
          console.log(`   Menu: ${menuItems.slice(0, 3).join(', ')}`);
        }
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ Test complete');
    console.log('='.repeat(80) + '\n');
  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTests() {
  console.log('\n🚀 STARTING SEARCH TESTS');
  console.log('Testing improved semantic search functionality');
  console.log('API URL:', API_URL);

  const testQueries = [
    'seafood food', // Original problem query
    'outdoor wedding', // General query
    'vegan catering', // Dietary query
    'under $5000 for 100 people', // Budget + capacity
    'rustic barn venue', // Venue style
    'beach party', // Short query
    'seafod', // Intentional typo
    'birthday celebration package', // Event type
  ];

  for (const query of testQueries) {
    await testSearch(query);
    // Wait 1 second between tests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log('\n✅ ALL TESTS COMPLETE!\n');
}

// Run the tests
runTests()
  .then(() => {
    console.log('👋 Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  });
