# Supabase Auth & Database Setup

## 1. Environment Variables

Add to `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://wfobsunzcrgverpgtcdp.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_CXs6z6GtI54jkDbFiB4Tuw_md3iQ6oj"

# Database (Supabase Postgres)
# Get from: Supabase Dashboard → Settings → Database → Connection string
# Use "Transaction" pooler, URI format, port 6543
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
```

## 2. Supabase Auth URL Configuration

In [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration:

- **Site URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs** (add both for dev):
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

## 3. Enable Email Auth

Supabase enables magic link by default. In Authentication → Providers → Email:
- Enable "Confirm email" if you want double opt-in (or disable for instant magic link)

## 4. Database Migration

If using Supabase Postgres for the first time:

```bash
# Point DATABASE_URL to Supabase, then:
npx prisma db push
npx prisma db seed
```

## 5. Remove Old Auth (Optional)

You can remove these from `.env.local` if no longer needed:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `EMAIL_SERVER_*` (Supabase sends magic link emails)
