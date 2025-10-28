# Development Tips for DAM Event Platform

## 🔧 Viewing All Packages During Development

### The Problem
By default, the `/api/packages` endpoint only returns packages that meet **production criteria**:
- Package `status = 'published'`
- Vendor `status = 'verified'`

During development and testing, your packages are likely:
- Package `status = 'draft'` (default when created)
- Vendor `status = 'pending'` (default until admin approves)

This means `/api/packages` returns an **empty array** even though you have data in the database.

---

## ✅ Solution: Use the `includeAll` Parameter

We've added an optional query parameter `?includeAll=true` that bypasses status filters for development and testing.

### API Usage

#### Production Mode (Default - Strict Filters)
```
GET http://localhost:3000/api/packages
```
**Returns:** Only `published` packages from `verified` vendors

#### Development Mode (Show All)
```
GET http://localhost:3000/api/packages?includeAll=true
```
**Returns:** ALL packages regardless of status

#### With Event Matching
```
GET http://localhost:3000/api/packages?eventId=abc-123&includeAll=true
```
**Returns:** ALL packages matched to the event, regardless of status

---

## 🛠️ How to Use During Development

### Option 1: Test via Browser/Postman
Simply add `?includeAll=true` to the URL:
```
http://localhost:3000/api/packages?includeAll=true
```

### Option 2: Update Browse Page Temporarily
Edit `/client/src/app/planner/browse/page.tsx` (line 48):

**Change from:**
```typescript
const url = eventId ? `/api/packages?eventId=${eventId}` : '/api/packages';
```

**Change to:**
```typescript
const url = eventId ? `/api/packages?eventId=${eventId}&includeAll=true` : '/api/packages?includeAll=true';
```

**Remember to revert before deploying to production!**

### Option 3: Use Environment Variable (Recommended)
Add to `.env.local`:
```bash
NEXT_PUBLIC_DEV_MODE=true
```

Then update browse page:
```typescript
const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
const includeAllParam = isDev ? '&includeAll=true' : '';
const url = eventId
  ? `/api/packages?eventId=${eventId}${includeAllParam}`
  : `/api/packages${isDev ? '?includeAll=true' : ''}`;
```

---

## 🗄️ Preparing Data for Production Testing

If you want to test the **production behavior** (strict filters), you need to manually update your test data:

### Step 1: Verify Vendors
```sql
-- Check vendor statuses
SELECT id, business_name, status FROM vendors;

-- Approve all vendors
UPDATE vendors SET status = 'verified' WHERE status = 'pending';

-- Or approve specific vendor
UPDATE vendors SET status = 'verified' WHERE id = 'your-vendor-id';
```

### Step 2: Publish Packages
```sql
-- Check package statuses
SELECT id, name, status FROM packages;

-- Publish all packages
UPDATE packages SET status = 'published' WHERE status = 'draft';

-- Or publish specific package
UPDATE packages SET status = 'published' WHERE id = 'your-package-id';
```

### Step 3: Test the Endpoint
```
GET http://localhost:3000/api/packages
```
Should now return packages without needing `includeAll=true`

---

## 🧪 Debugging Empty Results

If `/api/packages` returns empty results, check these in order:

### 1. Check if you have data
```sql
SELECT COUNT(*) FROM packages;
SELECT COUNT(*) FROM vendors;
```

### 2. Check package statuses
```sql
SELECT status, COUNT(*) as count
FROM packages
GROUP BY status;
```

Expected for production: `published > 0`
During development: May show `draft` packages

### 3. Check vendor statuses
```sql
SELECT status, COUNT(*) as count
FROM vendors
GROUP BY status;
```

Expected for production: `verified > 0`
During development: May show `pending` vendors

### 4. Check if ANY packages meet production criteria
```sql
SELECT
  p.id,
  p.name,
  p.status as package_status,
  v.business_name,
  v.status as vendor_status
FROM packages p
LEFT JOIN vendors v ON p.vendor_id = v.id
WHERE p.status = 'published'
  AND v.status = 'verified';
```

If this returns 0 rows, that's why the API returns empty (without `includeAll=true`)

### 5. Test with includeAll parameter
```
GET http://localhost:3000/api/packages?includeAll=true
```

If this works but the default doesn't, you need to either:
- Use `includeAll=true` during development
- Update your test data to published/verified status

---

## 📊 Understanding Package Visibility

| Endpoint | Package Status | Vendor Status | Result |
|----------|----------------|---------------|---------|
| `/api/packages` | `draft` | `pending` | ❌ Not returned |
| `/api/packages` | `published` | `pending` | ❌ Not returned |
| `/api/packages` | `draft` | `verified` | ❌ Not returned |
| `/api/packages` | `published` | `verified` | ✅ Returned |
| `/api/packages?includeAll=true` | ANY | ANY | ✅ Returned |

---

## 🎯 Recommended Development Workflow

### For Local Development:
1. Create vendors and packages as usual
2. Use `?includeAll=true` to see all your test data
3. Test functionality without worrying about status

### Before Deploying:
1. Remove any `includeAll=true` from frontend code
2. Ensure production data has proper statuses:
   - Vendors should be verified via admin dashboard
   - Packages should be published by vendors

### For Testing Production Behavior Locally:
1. Use admin dashboard to approve vendors
2. Use vendor UI to publish packages
3. Test without `includeAll=true` parameter

---

## ⚠️ Important Notes

### Security
- The `includeAll` parameter works in both development and production
- It's fine to leave this in production - it's just a convenience flag
- RLS (Row Level Security) policies still apply regardless of this parameter
- Users can only see packages they're allowed to see based on RLS

### Performance
- Using `includeAll=true` may return more results
- Not a concern for small datasets during development
- In production with many packages, this could be slower

### When to Use
- ✅ Local development and testing
- ✅ Debugging empty results
- ✅ Viewing draft packages as a vendor
- ❌ Production frontend (unless specifically needed)
- ❌ Public-facing browse pages

---

## 🔗 Related Files

- **API Implementation:** `client/src/app/api/packages/route.ts` (lines 140, 186-190, 219-223)
- **Browse Page:** `client/src/app/planner/browse/page.tsx` (line 48)
- **Database Schema:** Check package and vendor status constraints

---

## 🆘 Common Issues

### "I'm using includeAll=true but still seeing nothing"
- Check if you have any packages in the database
- Run: `SELECT COUNT(*) FROM packages;`
- If 0, create some test packages first

### "Packages appear with includeAll but not without"
- This is expected behavior
- Your packages are in `draft` status or vendors are `pending`
- Either use `includeAll=true` for testing or update statuses

### "I updated package status but still see nothing"
- Check vendor status too - BOTH must meet criteria
- Run the debug query from Step 4 above

### "How do I make packages appear in production?"
- Use admin dashboard to verify vendors
- Use vendor UI to publish packages
- Or run SQL updates shown in "Preparing Data" section

---

## 💡 Pro Tips

1. **Quick Toggle:** Create a environment variable to easily toggle between dev/prod mode
2. **Admin First:** Always verify at least one vendor using admin dashboard to test the real workflow
3. **Use SQL:** For bulk testing, use SQL to quickly publish many packages
4. **Check Logs:** Watch the browser console and server logs for helpful error messages
5. **Test Both:** Test with and without `includeAll=true` to ensure production behavior works

---

**Last Updated:** Based on package search bug fixes
**Related Doc:** See `PACKAGE_SEARCH_FIXES.md` for detailed fix explanation
