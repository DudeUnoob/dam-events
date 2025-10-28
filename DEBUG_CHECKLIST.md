# Debug Checklist: Why Packages Endpoint Returns Empty

## Step 1: Check if packages table has data

In Supabase, click on the **`public.packages`** tab (not events) and check:

**Expected:** Should see rows with package data
**If empty:** You need to create packages first!

### How to check via SQL:
```sql
SELECT COUNT(*) FROM packages;
```

**If this returns 0:** You have no packages - that's why the endpoint returns empty!

---

## Step 2: Check if vendors table has data

Click on **`public.vendors`** tab and check:

**Expected:** Should see vendor rows
**If empty:** You need to create vendor profiles first!

### How to check via SQL:
```sql
SELECT COUNT(*) FROM vendors;
```

---

## Step 3: Check the relationship

Run this query to see if packages are properly linked to vendors:

```sql
SELECT
  p.id,
  p.name,
  p.status as package_status,
  p.vendor_id,
  v.id as vendor_id_check,
  v.business_name,
  v.status as vendor_status
FROM packages p
LEFT JOIN vendors v ON p.vendor_id = v.id
ORDER BY p.created_at DESC;
```

**Expected:**
- package_status: 'draft' or 'published'
- vendor_status: 'pending', 'verified', or 'rejected'
- vendor_id should match vendor_id_check

**If vendor columns are NULL:** The vendor_id foreign key is broken!

---

## Step 4: Test the API endpoint with curl

In terminal, run:

```bash
curl -s http://localhost:3000/api/packages?includeAll=true | jq
```

Or without jq:
```bash
curl http://localhost:3000/api/packages?includeAll=true
```

**Expected response format:**
```json
{
  "data": [
    {
      "id": "...",
      "name": "Package Name",
      "status": "draft",
      "vendor": {
        "id": "...",
        "business_name": "Vendor Name",
        "status": "pending"
      }
    }
  ],
  "error": null
}
```

**If you get:** `{"data": [], "error": null}`
- This means the query ran successfully but found no packages
- Check Step 1 - do you have packages?

**If you get:** `{"data": null, "error": {...}}`
- There's an API error
- Check the error message
- Check server logs in terminal where you ran `npm run dev`

---

## Step 5: Check server logs

In the terminal where you're running `npm run dev`, look for:

**Errors like:**
- `Error fetching packages: ...`
- `Supabase error: ...`
- Any red text

**Success looks like:**
- GET /api/packages?includeAll=true 200 (no errors)

---

## Step 6: Common Issues & Solutions

### Issue: "I have events but no packages"
**Solution:** You need to create packages! Events and packages are different tables.

**How to create packages:**
1. Sign in as a vendor
2. Go to `/vendor/packages`
3. Click "Create Package"
4. Fill out the form and save

**Or via SQL (for testing):**
```sql
-- First, get a vendor ID
SELECT id, user_id FROM vendors LIMIT 1;

-- Then create a test package (replace 'YOUR_VENDOR_ID')
INSERT INTO packages (
  vendor_id,
  name,
  description,
  price_min,
  price_max,
  capacity,
  status
) VALUES (
  'YOUR_VENDOR_ID',
  'Test Package',
  'This is a test package for development',
  1000,
  2000,
  100,
  'draft'
);
```

### Issue: "I have packages but no vendors"
**Solution:** You need to create vendor profiles!

**How to create vendors:**
1. Sign up as vendor
2. Complete vendor onboarding
3. Admin needs to verify (or use SQL)

**Or via SQL (for testing):**
```sql
-- First, get a user ID who has role='vendor'
SELECT id, email FROM users WHERE role = 'vendor' LIMIT 1;

-- Then create a vendor profile (replace 'YOUR_USER_ID')
INSERT INTO vendors (
  user_id,
  business_name,
  description,
  services,
  location_address,
  status
) VALUES (
  'YOUR_USER_ID',
  'Test Venue',
  'A test venue for development',
  ARRAY['venue', 'catering'],
  '123 Test St, Austin, TX',
  'pending'
);
```

### Issue: "Packages exist but vendor_id is NULL"
**Solution:** The package isn't linked to a vendor!

**Fix via SQL:**
```sql
-- Get a valid vendor ID
SELECT id FROM vendors LIMIT 1;

-- Update packages to link to that vendor (replace 'YOUR_VENDOR_ID')
UPDATE packages
SET vendor_id = 'YOUR_VENDOR_ID'
WHERE vendor_id IS NULL;
```

### Issue: "API returns error about permissions"
**Solution:** RLS policies might be blocking

**Check RLS policies:**
```sql
-- See all packages (as postgres role)
SELECT * FROM packages;
```

If this works but the API doesn't, check your RLS policies in Supabase Dashboard.

### Issue: "Vendor table exists but packages.vendors is NULL in API response"
**Solution:** The join might be failing

**This happens when:**
- Package.vendor_id doesn't match any vendor.id
- Vendor was deleted but package still references it

**Fix:**
```sql
-- Find orphaned packages
SELECT p.*
FROM packages p
LEFT JOIN vendors v ON p.vendor_id = v.id
WHERE v.id IS NULL;

-- Option 1: Delete orphaned packages
DELETE FROM packages WHERE vendor_id NOT IN (SELECT id FROM vendors);

-- Option 2: Link to a valid vendor
UPDATE packages
SET vendor_id = (SELECT id FROM vendors LIMIT 1)
WHERE vendor_id NOT IN (SELECT id FROM vendors);
```

---

## Quick Test Script

Run all these in SQL Editor to get a full picture:

```sql
-- 1. Count everything
SELECT 'packages' as table_name, COUNT(*) as count FROM packages
UNION ALL
SELECT 'vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'users', COUNT(*) FROM users;

-- 2. Check package statuses
SELECT status, COUNT(*) as count
FROM packages
GROUP BY status;

-- 3. Check vendor statuses
SELECT status, COUNT(*) as count
FROM vendors
GROUP BY status;

-- 4. Check packages with vendor info
SELECT
  p.id,
  p.name,
  p.status,
  v.business_name,
  v.status as vendor_status,
  CASE
    WHEN p.vendor_id IS NULL THEN 'NO VENDOR ID'
    WHEN v.id IS NULL THEN 'VENDOR NOT FOUND'
    ELSE 'OK'
  END as relationship_status
FROM packages p
LEFT JOIN vendors v ON p.vendor_id = v.id;
```

---

## What to do next:

1. **Check packages table** - Do you have any rows?
2. **Check vendors table** - Do you have any rows?
3. **Run the API test** - Does it return data or an error?
4. **Check server logs** - Are there any errors?
5. **Report back** with the results of these checks

Most likely issue: **You have events but no packages!**

Events ≠ Packages. They are separate tables:
- **Events** = Created by planners (what they're planning)
- **Packages** = Created by vendors (what they're offering)
- **Packages endpoint** = Returns vendor packages, not planner events!
