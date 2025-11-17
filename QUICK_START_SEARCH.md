# Quick Start - Testing Improved Search

## 🚀 Immediate Testing

### Test the "seafood food" Query

**Option 1: Start dev server and test manually**
```bash
cd client
npm run dev
```
Then navigate to your search page and enter "seafood food"

**Option 2: Test via API directly**
```bash
# Make sure dev server is running first (npm run dev)
curl -X POST http://localhost:3000/api/search/smart \
  -H "Content-Type: application/json" \
  -d '{
    "query": "seafood food"
  }' | json_pp
```

**Option 3: Run automated test suite**
```bash
cd client
npx tsx scripts/test-search.ts
```

---

## ✅ What to Expect

### "seafood food" Query Results

**Before:** 0 results ❌

**After:** 10+ results including:
1. **Beachside Celebration Package** 🎯
   - Why: Contains "Seafood Buffet" in menu
   - Price: $6,000-$10,000
   - Capacity: 200 people
   - Ranking: "Highly relevant to your search, Contains your search keywords"

2. **Waterfront Estate Experience**
   - Why: Has pescatarian options
   - Menu includes ocean-themed items

**Additional Features:**
- **Expanded Query:** "seafood food ocean marine fish shellfish lobster crab shrimp cuisine dishes menu buffet coastal"
- **Extracted Params:** `food_type: "seafood"`
- **Related Searches:**
  - "seafood catering packages"
  - "ocean-themed event venue"
  - "coastal wedding reception"

---

## 🧪 More Test Cases

Try these queries to see different features:

```bash
# Short query (now works!)
"vegan"

# Query with typo (auto-corrects!)
"seafod buffet"

# Budget + capacity extraction
"under $5000 for 100 people"

# Location extraction
"outdoor venue in Austin"

# Specific cuisine
"italian catering"

# Venue style
"rustic barn wedding"
```

---

## 📊 Understanding the Response

Example API response structure:
```json
{
  "data": {
    "results": [
      {
        "id": "0416b862...",
        "name": "Beachside Celebration Package",
        "similarity": 0.78,               // Vector similarity
        "rerank_score": 0.85,             // Final score (higher = better)
        "ranking_explanation": [          // Why this result?
          "Highly relevant to your search",
          "Contains your search keywords"
        ],
        "catering_details": {
          "menu_options": ["Seafood Buffet", ...]
        }
      }
    ],
    "count": 12,                          // Results returned
    "totalMatches": 15,                   // Total matches before limit
    "expandedQuery": "seafood ocean...",  // How we expanded your query
    "relatedSearches": [...]              // Suggested related queries
  }
}
```

---

## 🔍 Debugging

If you get **0 results**, check:

1. **Is the dev server running?**
   ```bash
   npm run dev
   ```

2. **Are embeddings populated?**
   ```bash
   npx tsx scripts/backfill-embeddings.ts
   ```
   Should say: "No packages need embeddings"

3. **Is OpenAI API key set?**
   Check `client/.env.local` has:
   ```
   OPENAI_API_KEY=sk-...
   ```

4. **Check the logs:**
   Dev server console will show:
   ```
   🧠 Smart search query: seafood food
   🔧 Preprocessing query...
   🔍 Expanding query...
   📝 Expanded query: seafood ocean marine...
   🗄️ Performing smart hybrid search...
   ✅ Found 12 matching packages
   🎯 Reranking results...
   ```

---

## 💪 Performance

Expected response times:
- **Without expansion:** ~200-400ms
- **With expansion:** ~800-1200ms (GPT-4 calls)
- **With all features:** ~1500-2000ms

Features can be disabled for faster responses:
```json
{
  "query": "seafood food",
  "useExpansion": false,    // Skip GPT expansion
  "useReranking": false,    // Skip reranking
  "includeSuggestions": false  // Skip suggestions
}
```

---

## 📝 Quick Reference

| Query Type | Example | What It Tests |
|------------|---------|---------------|
| Short | "vegan" | Min length reduction |
| Typo | "seafod" | Typo correction |
| Budget | "under $5000" | Entity extraction |
| Capacity | "for 150 people" | Capacity extraction |
| Location | "in Austin" | Location extraction |
| Cuisine | "seafood food" | Food type matching |
| Venue | "outdoor wedding" | Venue type matching |
| Complex | "rustic barn venue for 200 people under $10k" | All features |

---

## 🎯 Success Criteria

✅ Search is successful if:
1. "seafood food" returns 10+ results
2. Top result is "Beachside Celebration Package"
3. Results include ranking explanations
4. Related searches are shown
5. No errors in console

---

## 🆘 Common Issues

**Issue:** `OpenAIError: Missing credentials`
**Fix:** Set `OPENAI_API_KEY` in `client/.env.local`

**Issue:** `No packages need embeddings` but still 0 results
**Fix:** Check database connection in Supabase dashboard

**Issue:** Slow responses (> 3 seconds)
**Fix:** Disable suggestions: `includeSuggestions: false`

**Issue:** Type errors
**Fix:** The code may have some TypeScript warnings but should still run. These can be fixed by adding proper type annotations.

---

Ready to test! 🚀
