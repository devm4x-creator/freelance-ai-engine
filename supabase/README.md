# Supabase Setup Guide for Freelance AI Engine

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Enter project details:
   - **Name**: `freelance-ai-engine`
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest to your users
4. Click "Create new project" and wait for setup

## 2. Get Your API Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon/public key**: `eyJhbGci...`

## 3. Run the Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy and paste the contents of `migrations/001_initial_schema.sql`
4. Click "Run" to execute

## 4. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Optional: Disable "Confirm email" for easier testing:
   - Go to **Authentication** → **Settings**
   - Toggle off "Enable email confirmations"

## 5. Add Environment Variables to Netlify

In your Netlify dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add these variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (your anon key) |
| `OPENAI_API_KEY` | `sk-...` (your OpenAI key) |

3. Trigger a new deploy

## 6. Test Authentication

1. Visit your site: https://www.aifreelancer.app
2. Click "Sign Up" and create an account
3. Check your Supabase dashboard → **Authentication** → **Users** to see the new user

## Database Tables

### `profiles`
Stores extended user information:
- `id` - User ID (from auth.users)
- `email` - User email
- `full_name` - Display name
- `avatar_url` - Profile picture URL
- `plan` - Subscription plan (free/pro)
- `generations_today` - Daily usage counter

### `saved_outputs`
Stores user-generated content:
- `id` - Unique output ID
- `user_id` - Owner user ID
- `type` - Output type (branding, social, etc.)
- `title` - Output title
- `content` - Generated content
- `metadata` - Additional data (JSON)
- `created_at` - Creation timestamp
