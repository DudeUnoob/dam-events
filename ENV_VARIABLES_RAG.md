# Environment Variables for RAG System

Add these to your `.env.local` file:

```env
# RAG/Semantic Search Configuration
# ===================================

# Webhook secret for automatic embedding generation
# Generate a random string: openssl rand -base64 32
WEBHOOK_SECRET=your-webhook-secret-here

# Optional: Use OpenAI embeddings instead of Xenova (faster, more accurate)
# Get key from: https://platform.openai.com/api-keys
# OPENAI_API_KEY=sk-...

# Optional: Use Hugging Face Inference API
# Get key from: https://huggingface.co/settings/tokens
# HUGGINGFACE_API_KEY=hf_...

# Optional: Cron job authentication
CRON_SECRET=your-cron-secret-here
```

## When to use different embedding providers:

### Xenova/Transformers.js (Default - FREE)
- ✅ Completely free
- ✅ Runs in browser/Node.js
- ✅ No API keys needed
- ⚠️ Slower embedding generation (~100-200ms per text)
- ⚠️ 384-dimensional embeddings

### OpenAI Embeddings (Production - PAID)
- ✅ Very fast (~10-20ms per text)
- ✅ Higher quality embeddings
- ✅ 1536 dimensions (more precise)
- ⚠️ Costs money ($0.02 per 1M tokens)
- ⚠️ Requires API key

### Hugging Face Inference API (Middle Ground)
- ✅ Fast (~30-50ms per text)
- ✅ Free tier available
- ✅ Many models to choose from
- ⚠️ Rate limits on free tier
- ⚠️ Requires API key



