# Supabase Setup Guide

## The Problem
Your app is experiencing long loading times and authentication errors because the Supabase configuration is invalid.

## Quick Fix for Development
The app now includes a development mode that bypasses authentication when Supabase isn't properly configured. This allows you to test the app immediately.

## To Set Up Supabase Properly:

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Sign in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `AnimaBom` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose closest to your users
6. Click "Create new project"

### 2. Get Your Project Credentials
1. Once your project is created, go to Settings → API
2. Copy your:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 3. Update Your Environment Variables
Replace the placeholder values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-actual-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-actual-anon-key-here"
```

### 4. Set Up Authentication (Optional)
If you want to use authentication:
1. Go to Authentication → Settings in your Supabase dashboard
2. Configure your authentication providers
3. Set up redirect URLs for your app

### 5. Restart Your Development Server
After updating the environment variables:
```bash
npm run dev
```

## Current Status
- ✅ Development mode enabled (app works without auth)
- ✅ Better error handling added
- ✅ Loading timeout implemented (5 seconds max)
- ❌ Supabase not configured (replace placeholder values)

## Testing
You can now test your app immediately. It will show a development mode indicator and bypass authentication until you configure Supabase properly.