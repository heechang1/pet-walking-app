# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to https://supabase.com
2. Create a new project
3. Wait for the project to be fully provisioned

## 2. Get Environment Variables

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 3. Set Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL script
4. Verify the tables are created: `pets`, `walks`, `calendar_stamp`

## 5. Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure email templates if needed

## 6. Test the Application

1. Start the development server: `npm run dev`
2. Go to `/login`
3. Enter your email and click "로그인 링크 보내기"
4. Check your email and click the magic link
5. You should be redirected to `/start`

## Troubleshooting

- **Authentication errors**: Make sure email provider is enabled in Supabase
- **Database errors**: Verify migrations ran successfully
- **RLS errors**: Check that Row Level Security policies are created correctly
- **CORS errors**: Ensure Supabase project URL is correct in `.env.local`



