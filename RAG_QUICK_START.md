# RAG System - Quick Start Checklist

## ⚡ Get Your RAG System Running in 5 Steps

### ✅ Step 1: Apply Database Migration (2 minutes)

```bash
cd supabase
supabase db push
```

**Verify it worked:**
```sql
-- In Supabase SQL Editor
SELECT * FROM pg_extension WHERE extname = 'vector';
-- Should return 1 row

\d packages
-- Should show 'embedding' and 'searchable_text' columns
```

---

### ✅ Step 2: Set Environment Variables (1 minute)

Add to `client/.env.local`:

```env
# Optional: Only needed if you want webhook support
WEBHOOK_SECRET=your_random_secret_here
```

Generate a secret:
```bash
openssl rand -base64 32
```

---

### ✅ Step 3: Generate Initial Embeddings (5-10 minutes)

**Option A - Using Admin API (Recommended)**

1. Start your dev server:
```bash
cd client
npm run dev
```

2. Login as an admin user in your browser

3. Run this command (replace with your admin token):
```bash
curl -X POST http://localhost:3000/api/admin/embeddings/regenerate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type": "all"}'
```

**Option B - Manual SQL (If no data yet)**

If you don't have packages in your database yet, embeddings will be generated automatically when you create packages. Just make sure the migration is applied.

---

### ✅ Step 4: Test the Search API (1 minute)

```bash
# Test semantic search
curl -X POST http://localhost:3000/api/search/packages \
  -H "Content-Type: application/json" \
  -d '{
    "query": "wedding venue for 100 guests"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "results": [...],
  "count": 5
}
```

---

### ✅ Step 5: Test in the UI (1 minute)

1. Navigate to: `http://localhost:3000/planner/browse`
2. Click the **"AI Search"** button
3. Type: "elegant wedding venue with outdoor space"
4. See the results with similarity scores!

---

## 🎉 You're Done!

Your RAG system is now live! Users can search using natural language.

---

## 🧪 Test Queries to Try

### Wedding Packages
- "wedding venue for 200 guests under $50,000"
- "elegant ballroom with catering for 150 people"
- "outdoor garden wedding venue with gazebo"

### Corporate Events
- "conference room for 50 people with AV equipment"
- "corporate catering with vegetarian options"
- "team building venue with outdoor activities"

### Special Requirements
- "venue with wheelchair accessibility"
- "kosher catering for 100 guests"
- "live music entertainment for wedding"

---

## 🐛 Troubleshooting

### Issue: No results returned
**Check:**
1. Do you have packages in your database?
   ```sql
   SELECT COUNT(*) FROM packages WHERE status = 'published';
   ```
2. Are embeddings generated?
   ```sql
   SELECT COUNT(*) FROM packages WHERE embedding IS NOT NULL;
   ```

**Solution:** Run Step 3 again to generate embeddings.

---

### Issue: API returns 500 error
**Check:**
1. Is the migration applied?
2. Are there any errors in the server logs?
3. Is the pgvector extension installed?

**Solution:** Check server logs with `npm run dev` and look for detailed error messages.

---

### Issue: Search is slow
**Check:**
1. Are HNSW indexes created?
   ```sql
   SELECT indexname FROM pg_indexes WHERE tablename = 'packages';
   -- Should show 'packages_embedding_idx'
   ```

**Solution:** Indexes are created in the migration. If missing, run:
```sql
CREATE INDEX packages_embedding_idx ON packages 
USING hnsw (embedding vector_cosine_ops);
```

---

## 📋 Post-Setup Tasks

### Recommended: Set Up Auto-Embedding Generation

When vendors create/update packages, embeddings should be generated automatically.

**Option 1 - Webhook (Real-time)**
1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhook pointing to `/api/webhooks/generate-embeddings`
3. Trigger on: INSERT, UPDATE on `packages` table

**Option 2 - Cron Job (Batch)**
Set up a nightly cron to regenerate embeddings for new packages.

---

## 🎨 Customize the UI

### Change Search Placeholder
`client/src/components/shared/SemanticSearch.tsx`:
```typescript
placeholder="Find your perfect event package..."
```

### Adjust Similarity Threshold
`client/src/lib/rag/search-service.ts`:
```typescript
matchThreshold: 0.6, // Default is 0.5
```

### Add More Example Queries
`client/src/components/shared/SemanticSearch.tsx`:
```typescript
const exampleQueries = [
  "Your custom query here",
  // ...
];
```

---

## 📚 Next Steps

1. ✅ **Read**: `RAG_SETUP_GUIDE.md` for detailed documentation
2. ✅ **Configure**: Set up webhooks for automatic embedding generation
3. ✅ **Monitor**: Add analytics to track search quality
4. ✅ **Optimize**: Adjust thresholds based on user feedback
5. ✅ **Scale**: Consider OpenAI embeddings for production

---

## 💬 Need Help?

- Check `RAG_SETUP_GUIDE.md` for detailed setup instructions
- Review `RAG_IMPLEMENTATION_SUMMARY.md` for technical details
- See example queries in the UI's SemanticSearch component

---

## 🚀 Production Checklist

Before going to production:

- [ ] Test with real data
- [ ] Set up embedding generation automation (webhook/cron)
- [ ] Add monitoring and error tracking
- [ ] Consider upgrading to OpenAI embeddings
- [ ] Test search quality with users
- [ ] Set up rate limiting on search APIs
- [ ] Add search analytics
- [ ] Optimize similarity threshold
- [ ] Test at scale (1000+ packages)
- [ ] Set up backup for embeddings

---

## 📊 Expected Performance

- **Search Latency**: 50-200ms
- **Embedding Generation**: 100-200ms per package
- **First Load**: 2-3 seconds (model download)
- **Accuracy**: 70-90% relevance

---

## ✨ Features You Now Have

✅ Natural language search  
✅ Semantic understanding of queries  
✅ Similarity scores on results  
✅ Filter combination (semantic + traditional)  
✅ Auto-updating searchable text  
✅ Fast vector search with HNSW indexes  
✅ Beautiful, modern UI  
✅ Mobile-responsive search interface  
✅ Loading states and error handling  
✅ Example queries for user guidance  

**Enjoy your new RAG-powered search! 🎉**



