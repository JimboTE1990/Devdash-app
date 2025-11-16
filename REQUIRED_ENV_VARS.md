# Required Environment Variables for Production

## 🔍 What Your Code Needs

Based on your codebase, these environment variables MUST be set in Vercel for production:

### **Stripe (Payment Processing)**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[Get from Stripe Dashboard → Developers → API keys]
STRIPE_SECRET_KEY=[Get from Stripe Dashboard → Developers → API keys]
STRIPE_WEBHOOK_SECRET=[Get from Stripe Dashboard → Developers → Webhooks]
```

### **Supabase (Database & Auth)**
```
NEXT_PUBLIC_SUPABASE_URL=https://unzikrmweevksqxllpnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuemlrcm13ZWV2a3NxeGxscG52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMjY0NjksImV4cCI6MjA3NjgwMjQ2OX0.V7xAUstKecSWx9QLQC2vZl-80CkpcouCgmK_ZcEbbVc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuemlrcm13ZWV2a3NxeGxscG52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIyNjQ2OSwiZXhwIjoyMDc2ODAyNDY5fQ.CV4jzXGz7YbStrJMlgVLZn4o6r8j2mey_lIZFk4F49Q
```

### **App URL**
```
NEXT_PUBLIC_APP_URL=https://jimbula.co.uk
```

---

## 📋 How to Set in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project
3. Click **Settings** → **Environment Variables**

### Step 2: Add Each Variable
For each variable above:

1. Click **"Add New"**
2. **Name**: Copy from left side (e.g., `STRIPE_SECRET_KEY`)
3. **Value**: Copy from right side (e.g., `sk_test_...`)
4. **Environment**: Check **Production** ✅
5. Click **"Save"**

### Step 3: Important Settings

**Make sure**:
- ✅ **Production** checkbox is CHECKED
- ✅ Preview and Development can be unchecked (optional)
- ✅ Each variable is saved individually

---

## 🔴 Current Error Diagnosis

**Error**: "Stripe is not configured"
**Location**: `/api/create-checkout-session` (line 14)
**Cause**: `process.env.STRIPE_SECRET_KEY` is `undefined`

**This happens when**:
1. Variable not added to Vercel at all
2. Variable added but **Production** not checked
3. Variable added but deployment hasn't rebuilt yet

---

## ✅ After Adding Variables

### Option 1: Trigger Redeploy (Recommended)
1. Go to **Deployments** tab in Vercel
2. Click latest deployment
3. Click **"..."** → **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait 6-10 minutes

### Option 2: Push Empty Commit
```bash
git commit --allow-empty -m "Trigger redeploy for env vars"
git push
```

---

## 🧪 How to Test After Deployment

### Test 1: Check Environment Variable is Available

Open browser console on https://jimbula.co.uk and run:

```javascript
// This will fail because STRIPE_SECRET_KEY is server-side only
// But we can test the client-side one:
console.log('Stripe publishable key exists:', !!window.Stripe)
```

### Test 2: Test Checkout API

```javascript
fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planType: 'personal',
    userId: 'test-user-id',
    userEmail: 'test@example.com',
    hasUsedTrial: false
  })
})
.then(r => r.json())
.then(data => {
  console.log('Response:', data)
  if (data.error) {
    console.error('❌ Error:', data.error)
  } else {
    console.log('✅ Success! Stripe is configured')
    console.log('Session ID:', data.sessionId)
  }
})
```

**Expected Response**:
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**If Still Broken**:
```json
{
  "error": "Stripe is not configured"
}
```

---

## 📸 What Your Vercel Settings Should Look Like

```
Environment Variables

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  Value: pk_test_51SMwx...  [Hidden]
  Environment: Production ✅

STRIPE_SECRET_KEY
  Value: sk_test_51SMwx...  [Hidden]
  Environment: Production ✅

STRIPE_WEBHOOK_SECRET
  Value: whsec_...  [Hidden]
  Environment: Production ✅

NEXT_PUBLIC_SUPABASE_URL
  Value: https://unzikrmweevksqxllpnv.supabase.co  [Visible]
  Environment: Production ✅

NEXT_PUBLIC_SUPABASE_ANON_KEY
  Value: eyJhbGciOiJIUz...  [Hidden]
  Environment: Production ✅

SUPABASE_SERVICE_ROLE_KEY
  Value: eyJhbGciOiJIUz...  [Hidden]
  Environment: Production ✅

NEXT_PUBLIC_APP_URL
  Value: https://jimbula.co.uk  [Visible]
  Environment: Production ✅
```

---

## 🆘 If Still Not Working

1. **Double-check** all 7 variables are present
2. **Verify** Production checkbox is checked for all
3. **Redeploy** without build cache
4. **Wait** full 10 minutes for deployment
5. **Check** Vercel deployment logs for errors
6. **Run** Test 2 (above) in browser console

---

## 🔑 Where to Find Missing Values

### Stripe Webhook Secret
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click your webhook endpoint
3. Click "Reveal" on "Signing secret"
4. Copy the `whsec_...` value

### If You Don't Have Webhook Yet
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. URL: `https://jimbula.co.uk/api/webhooks/stripe`
4. Events to send:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Click "Add endpoint"
6. Copy the signing secret

---

**After setting these up, redeploy, and the "Stripe is not configured" error should be gone!**
