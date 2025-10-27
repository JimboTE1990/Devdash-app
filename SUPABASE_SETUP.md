# Supabase Setup Guide

This guide will walk you through setting up Supabase for DevDash.

## Step 1: Get Your Supabase Project Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJh...`)
   - **service_role key** (starts with `eyJh...` - keep this SECRET!)

## Step 2: Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the Supabase placeholders with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **Important**: NEVER commit the service_role key to version control!

## Step 3: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `/supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- ✅ All tables (profiles, boards, tasks, finance_transactions, etc.)
- ✅ All indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Triggers for auto-updating timestamps
- ✅ Function to auto-create profile on user signup

## Step 4: Verify Schema Creation

1. Go to **Table Editor** in Supabase dashboard
2. You should see all these tables:
   - profiles
   - boards
   - columns
   - swimlanes
   - tasks
   - subtasks
   - comments
   - finance_transactions
   - user_preferences
   - idea_boards
   - idea_sections
   - idea_notes
   - idea_collaborators
   - idea_comments
   - calendar_events

## Step 5: Enable Email Authentication (Optional but Recommended)

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize signup, password reset emails

## Step 6: Test the Connection

After setting up the environment variables and running the schema:

1. Restart your dev server:
   ```bash
   npm run dev
   ```

2. Try registering a new account at `/auth`
3. Check Supabase dashboard → **Authentication** → **Users** to see your new user
4. Check **Table Editor** → **profiles** to see the auto-created profile

## What's Next?

Now that Supabase is configured, the app will:

✅ Use Supabase Auth instead of localStorage for authentication
✅ Store all data in PostgreSQL instead of browser storage
✅ Sync data across devices
✅ Enable real-time updates (coming soon)
✅ Properly track Stripe subscriptions

## Troubleshooting

### "Failed to fetch" errors
- Check that NEXT_PUBLIC_SUPABASE_URL is correct
- Make sure your Supabase project is not paused (free tier pauses after 7 days of inactivity)

### RLS Policy errors ("new row violates row-level security policy")
- Make sure you're logged in
- Check that the RLS policies were created (they should be if you ran the schema.sql)
- Try running the schema.sql again

### Authentication not working
- Clear browser cache and localStorage
- Check that Email authentication is enabled in Supabase dashboard
- Check browser console for errors

### Data not saving
- Check browser console for errors
- Verify RLS policies are correct
- Make sure you're using the correct user_id

## Migration from localStorage

If you have existing data in localStorage that you want to keep:

1. A migration tool will be provided soon
2. For now, you can manually re-enter important data after setting up Supabase
3. Or wait for the automated migration feature

## Security Notes

- ✅ Row Level Security (RLS) is enabled on all tables
- ✅ Users can only access their own data
- ✅ Service role key is only used in server-side API routes
- ✅ All passwords are hashed by Supabase Auth
- ⚠️ Never expose service_role key in client-side code
- ⚠️ Always use `supabase` client (not `supabaseAdmin`) in client components

## Database Backups

Supabase automatically backs up your database daily on paid plans. On the free tier:
- Download manual backups: **Database** → **Backups** → **Download**
- Set up automated backups with database migrations

## Support

If you encounter issues:
1. Check Supabase logs: **Logs** → **Postgres Logs**
2. Check Next.js console for errors
3. Refer to Supabase docs: https://supabase.com/docs
4. Check DevDash GitHub issues
