# URGENT FIXES NEEDED - Session Timeout Summary

## 🚨 CRITICAL PAYMENT ISSUES (Fix Immediately)

### 1. Profile Price Wrong ✅ READY TO FIX
**File**: `src/app/profile/page.tsx` line 313
**Current**: `£9.99/month • Renews monthly`
**Change to**: `£14.99/month • Renews monthly`

### 2. README Price Wrong
**File**: `README.md` line 14
**Current**: `- **Premium Plan**: £9.99/month after trial`
**Change to**: `- **Premium Plan**: £14.99/month after trial`

### 3. Duplicate Subscription Prevention
**Problem**: Premium users can sign up again, creating duplicate subscriptions in Stripe

**File**: `src/app/pricing/page.tsx`
**Add at line 84** (before the return statement):
```tsx
// Check if user is already premium (prevent duplicate subscriptions)
const { user: authUser } = useAuth()
if (authUser?.plan === 'premium' && !authUser.isLifetimeFree) {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-2xl mx-auto p-8 text-center">
        <CardTitle className="text-3xl mb-4">You're Already Subscribed!</CardTitle>
        <CardDescription className="text-lg mb-6">
          You already have an active Premium subscription. Manage your subscription in your profile.
        </CardDescription>
        <Link href="/profile">
          <Button size="lg">Go to Profile</Button>
        </Link>
      </Card>
    </div>
  )
}
```

### 4. Checkout Button Text Wrong
**Problem**: Button says "Start Free Trial" even when user has already used trial or selecting Enterprise

**File**: `src/app/checkout/page.tsx` around line 315
**Find**:
```tsx
Start 7-Day Free Trial
```

**Replace with**:
```tsx
{selectedPlan === 'enterprise'
  ? 'Join Enterprise Waitlist'
  : canUseTrial
    ? 'Start 7-Day Free Trial'
    : 'Subscribe to Personal Plan'}
```

---

## 📱 MOBILE RESPONSIVENESS (High Priority - App Deployed)

### Header Navigation - Needs Mobile Menu
**File**: `src/components/layout/Header.tsx`

**Problem**: Navigation links don't collapse on mobile, text overflows

**Solution**: Add hamburger menu for mobile (< 768px)
- Hide navigation links on mobile
- Show menu icon
- Implement slide-out drawer with all links

### Landing Page Text Too Large
**File**: `src/app/page.tsx` line 65

**Current**: `className="text-6xl md:text-7xl lg:text-8xl..."`
**Change to**: `className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl..."`

### Pricing Cards Cramped
**File**: `src/app/pricing/page.tsx` line 88

**Current**: `className="grid md:grid-cols-2 gap-8..."`
**Change to**: `className="grid grid-cols-1 lg:grid-cols-2 gap-8..."`
*This makes cards stack on mobile and tablet, only side-by-side on desktop*

### Checkout Plan Selection Cramped
**File**: `src/app/checkout/page.tsx` around line 160-210

**Find the plan selection grid** and change:
**From**: `className="grid grid-cols-2 gap-4"`
**To**: `className="grid grid-cols-1 md:grid-cols-2 gap-4"`

### Profile Stats Cards
**File**: `src/app/profile/page.tsx` line 163

**Current**: `className="grid grid-cols-1 md:grid-cols-3 gap-4"`
**Keep this** - it's already correct

---

## 🔒 GDPR DATA RETENTION (Within 2 Weeks - Legal Requirement)

### Database Migration 1: Add Retention Fields
**Create**: `supabase/migrations/add_data_retention_fields.sql`

```sql
-- Add data retention tracking fields
ALTER TABLE profiles ADD COLUMN deletion_scheduled_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN deletion_warning_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN last_downgrade_date TIMESTAMPTZ;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_scheduled ON profiles(deletion_scheduled_date);
CREATE INDEX IF NOT EXISTS idx_profiles_last_downgrade ON profiles(last_downgrade_date);

-- Add comments
COMMENT ON COLUMN profiles.deletion_scheduled_date IS 'Date when user data will be automatically deleted (GDPR compliance)';
COMMENT ON COLUMN profiles.last_downgrade_date IS 'Date when subscription was cancelled or trial expired';
COMMENT ON COLUMN profiles.deletion_warning_sent IS 'Whether 30-day deletion warning email was sent';
```

### Database Migration 2: Deletion Audit Log
**Create**: `supabase/migrations/create_deletion_audit_log.sql`

```sql
-- Audit log for GDPR compliance
CREATE TABLE deletion_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  deletion_reason TEXT NOT NULL, -- 'trial_expiry_90d', 'subscription_lapsed_12m', 'user_requested'
  scheduled_date TIMESTAMPTZ NOT NULL,
  warning_sent_date TIMESTAMPTZ,
  actual_deletion_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_summary JSONB, -- count of tasks, boards, transactions deleted
  deleted_by TEXT NOT NULL DEFAULT 'automated_cron',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deletion_audit_user_id ON deletion_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_audit_deletion_date ON deletion_audit_log(actual_deletion_date);

-- RLS: Only admins can view (no user access)
ALTER TABLE deletion_audit_log ENABLE ROW LEVEL SECURITY;
```

### Update Stripe Webhook
**File**: `src/app/api/webhooks/stripe/route.ts`

**In the `customer.subscription.deleted` case** (around line 114-134):

**Current**:
```typescript
await supabaseAdmin
  .from('profiles')
  .update({
    plan: 'free',
    stripe_subscription_id: null,
  })
  .eq('id', profile.id)
```

**Change to**:
```typescript
const now = new Date()
const deletionDate = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000) // 12 months

await supabaseAdmin
  .from('profiles')
  .update({
    plan: 'free',
    stripe_subscription_id: null,
    last_downgrade_date: now.toISOString(),
    deletion_scheduled_date: deletionDate.toISOString(),
    deletion_warning_sent: false,
  })
  .eq('id', profile.id)
```

### Retention Policy Summary
- **90 days** after trial expires (no upgrade)
- **12 months** after subscription cancels
- **30-day warning email** before deletion
- **Reactivation** (upgrade) cancels deletion
- **User can request immediate deletion** in profile

---

## ✅ Quick Test Checklist

After fixes:

**Payment**:
- [ ] Profile shows £14.99 (not £9.99)
- [ ] Premium user sees "Already Subscribed" on pricing page
- [ ] Checkout button text changes based on plan/trial status

**Mobile**:
- [ ] Header collapses to hamburger on mobile
- [ ] Hero text readable on phone (not too large)
- [ ] Pricing cards stack vertically on mobile/tablet
- [ ] Checkout form usable on phone
- [ ] No horizontal scroll anywhere

**GDPR** (after implementation):
- [ ] Database fields added
- [ ] Audit table created
- [ ] Stripe webhook sets deletion dates
- [ ] Profile shows deletion status

---

## 📝 Files to Modify Summary

### Immediate (Today):
1. `src/app/profile/page.tsx:313` - Fix price
2. `README.md:14` - Fix price
3. `src/app/pricing/page.tsx:84` - Add duplicate check
4. `src/app/checkout/page.tsx:315` - Fix button text

### This Week:
5. `src/components/layout/Header.tsx` - Add mobile menu
6. `src/app/page.tsx:65` - Fix hero text sizes
7. `src/app/pricing/page.tsx:88` - Fix card grid
8. `src/app/checkout/page.tsx:~170` - Stack plan cards mobile

### Within 2 Weeks:
9. Create `supabase/migrations/add_data_retention_fields.sql`
10. Create `supabase/migrations/create_deletion_audit_log.sql`
11. Update `src/app/api/webhooks/stripe/route.ts`
12. Create `supabase/functions/data-retention-cleanup/index.ts` (cron job)
13. Add retention section to `src/app/profile/page.tsx`

---

**Last Updated**: 2025-10-28 (Session timeout, continue in next session)
**Priority**: Payment fixes > Mobile > GDPR
