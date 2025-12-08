### DAM Event Platform

A full-stack event planning marketplace where planners can describe their event ("seafood food for 150 people in Austin under $5k"), discover matching vendor packages, request quotes, and collaborate via in-app messaging.

This repo contains:
- **Next.js 14 + TypeScript** app in `client` (frontend + API routes)
- **Supabase** project in `supabase` (PostgreSQL, Auth, Storage, Realtime, RLS)
- **Semantic/RAG search** and hybrid search improvements for smarter package discovery

---

### Tech Stack

- **Frontend & API**: Next.js 14 (App Router), React, TypeScript
- **Database & Auth**: Supabase (Postgres, Auth, Storage, Realtime, RLS)
- **Validation**: Zod
- **Search & RAG**:
  - Supabase Postgres + pgvector for embeddings
  - Hybrid full‑text + vector search
  - Optional OpenAI / Hugging Face for embeddings and query expansion
- **Notifications** (stubbed, pluggable): Twilio (SMS), SendGrid (email)

---

### Core Features

- **User roles**: planner, vendor, admin (plus Google OAuth via Supabase)
- **Vendors**: create profiles, define event packages, upload photos
- **Planners**: create events, search and filter packages, request quotes
- **Leads & messaging**: quote requests, threaded messaging between planner and vendor
- **Admin tools**: verify vendors, manage visibility
- **Smart search**:
  - Handles natural language like "rustic barn wedding under $10k for 200 people in Austin"
  - Extracts budget, capacity, location, cuisine, and intent
  - Uses embeddings + ranking explanations + related searches

---

### Repository Layout

- `client/`
  - `src/app/api/` – Next.js API routes (auth, vendors, packages, events, leads, messages, admin, search)
  - `src/lib/` – Supabase client, matching logic, maps/geocoding, notifications, search helpers
  - `src/types/` – Generated Supabase types
  - `middleware.ts` – Auth/session middleware
- `supabase/`
  - `migrations/` – Database schema, pgvector, search/ranking helpers, RLS
  - `storage_buckets.sql` – Storage buckets + policies
  - `seed.sql` and other `seed_*.sql` – Sample data (optional)
- Top‑level docs: `BACKEND_README.md`, `QUICKSTART.md`, `QUICK_START_SEARCH.md`, `ENV_VARIABLES_RAG.md`, `SUPABASE_SETUP.md`, feature specs in `instructions/`

---

### Prerequisites

- **Node.js** 18+
- **Supabase** account (free tier)
- **Google Cloud** project for OAuth and Maps

Optional (for full RAG + production‑grade search):
- OpenAI API key and/or Hugging Face Inference API key

---

### 1. Install & Run the App

From the project root:

```bash
cd client
npm install
npm run dev
```

Then open `http://localhost:3000`.

For more CLI commands (build, lint, type‑check, Supabase CLI), see `QUICKSTART.md`.

---

### 2. Supabase Setup

You can either follow the Supabase CLI flow or use the dashboard.

**Basic steps:**
- Create a Supabase project.
- Apply migrations and storage setup from the `supabase` folder:
  - Run `migrations/20250101000000_initial_schema.sql` in the SQL Editor.
  - Run `storage_buckets.sql` to create `vendor-photos` and `package-photos` buckets.
- Enable **Google** provider in Supabase Auth and configure OAuth.

See **`supabase/README.md`** and **`BACKEND_README.md`** for a full, step‑by‑step guide and troubleshooting.

---

### 3. Environment Variables

Create `client/.env.local` and set at least:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For **search/RAG & background jobs** (from `ENV_VARIABLES_RAG.md`):

```env
WEBHOOK_SECRET=your-webhook-secret-here
CRON_SECRET=your-cron-secret-here
# Optional providers
# OPENAI_API_KEY=sk-...
# HUGGINGFACE_API_KEY=hf_...
```

For **notifications** (optional, can stay commented while developing):

```env
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...
# SENDGRID_API_KEY=...
# SENDGRID_FROM_EMAIL=...
```

See `QUICKSTART.md` and `BACKEND_README.md` for more detail.

---

### 4. Search & RAG Overview

- **Smart search endpoint**: `POST /api/search/smart`
  - Accepts a natural‑language `query` and optional feature flags (e.g. `useExpansion`, `useReranking`, `includeSuggestions`).
  - Performs hybrid search using full‑text and vector similarity.
  - Optionally calls OpenAI/HF to expand queries, extract entities (budget, capacity, city, cuisine), and rerank results.
- **Embeddings**:
  - Default: local Xenova/Transformers.js (no external API required)
  - Optional: OpenAI or Hugging Face via environment variables
- **Testing search**: see `QUICK_START_SEARCH.md` for concrete curl commands, expected results (e.g. "seafood food"), and performance notes.

---

### 5. Roles & Flows to Test

- **Admin**: promote a user in Supabase to `admin`, then verify vendors so their packages appear in search.
- **Vendor**: sign up → complete vendor profile → create packages → upload photos.
- **Planner**: sign up → create event → search packages → request quotes → chat with vendors.

Detailed checklists and example API calls are in `BACKEND_README.md` and `QUICKSTART.md`.

---

### 6. Development & Troubleshooting

- **Common commands** (run in `client`):
  - `npm run dev` – Start dev server
  - `npm run build` / `npm run start` – Production build & run
  - `npm run lint` / `npm run type-check` – Code quality
- **Supabase CLI** (optional): `npx supabase db push`, `npx supabase db reset`, `npx supabase gen types typescript`.
- Check:
  - Browser console for frontend/Next.js errors
  - Terminal logs for API route errors
  - Supabase **Logs** tab for database/Auth/storage issues

For deeper backend internals (schema, API routes, policies, architecture decisions), read **`BACKEND_README.md`** and the product/feature docs in `instructions/`.