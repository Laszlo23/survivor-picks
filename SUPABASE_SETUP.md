# Supabase Setup (Auth + Database)

## 1. Create / Open Your Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project (e.g. `wfobsunzcrgverpgtcdp`)
3. Wait for the database to finish provisioning

## 2. Get Database Connection Strings

1. In the Supabase Dashboard, click **Connect** (top of project page)
2. Select **URI** tab
3. Copy both connection strings (replace `[YOUR-PASSWORD]` with your **database password** from Settings → Database):
   - **Transaction pooler** (port 6543) → `DATABASE_URL`
   - **Session pooler** (port 5432) or **Direct** → `DIRECT_URL`
4. If you forgot the database password: Settings → Database → **Reset database password**

## 3. Environment Variables

Add to `.env.local`:

```env
# Supabase Auth (from Settings → API)
NEXT_PUBLIC_SUPABASE_URL="https://wfobsunzcrgverpgtcdp.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_CXs6z6GtI54jkDbFiB4Tuw_md3iQ6oj"

# Supabase Postgres
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

Replace `[PROJECT_REF]`, `[REGION]`, and `[PASSWORD]` with your values from the Connect dialog.

**Note:** If using a non-pooled Postgres (e.g. Neon, Railway), set `DIRECT_URL` to the same value as `DATABASE_URL`.

## 4. Point Prisma to Supabase

Add to `.env` (Prisma CLI reads this):

```env
DATABASE_URL="<paste Transaction pooler URI from Connect>"
DIRECT_URL="<paste Session pooler or Direct URI from Connect>"
```

**Important:** If your password contains special characters (`/`, `@`, `#`, etc.), URL-encode them (e.g. `/` → `%2F`).

## 5. Push Schema & Seed

**Option A: Supabase CLI** (recommended):

```bash
supabase login                    # Opens browser to authenticate
supabase link --project-ref wfobsunzcrgverpgtcdp
supabase db push                 # Runs migrations in supabase/migrations/
npx prisma db seed               # Seed data
```

**Option B: Prisma only**:

```bash
npx prisma db push
npx prisma db seed
```

Then add the same `DATABASE_URL` and `DIRECT_URL` to `.env.local` so the Next.js app uses Supabase.

## 6. Auth URL Configuration

In **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod)
- **Redirect URLs**: Add
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`

## 7. Enable Email Auth

In **Authentication → Providers → Email**:
- Enable Email provider
- Configure "Confirm email" as desired (off = instant sign-in with password)

## 8. Vercel Production

Add `DATABASE_URL` and `DIRECT_URL` to Vercel → Settings → Environment Variables (Production).

## Optional: Custom Prisma DB User

For better security and monitoring, create a dedicated Prisma user in **SQL Editor**:

```sql
create user "prisma" with password 'your_secure_password' bypassrls createdb;
grant "prisma" to "postgres";
grant usage on schema public to prisma;
grant create on schema public to prisma;
grant all on all tables in schema public to prisma;
grant all on all routines in schema public to prisma;
grant all on all sequences in schema public to prisma;
alter default privileges for role postgres in schema public grant all on tables to prisma;
alter default privileges for role postgres in schema public grant all on routines to prisma;
alter default privileges for role postgres in schema public grant all on sequences to prisma;
```

Then use `prisma.[PROJECT_REF]` instead of `postgres.[PROJECT_REF]` in `DATABASE_URL` and `prisma` as the user in `DIRECT_URL`.
