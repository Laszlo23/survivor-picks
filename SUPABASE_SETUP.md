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

# App URL (for magic link redirect; prod: https://www.realitypicks.xyz)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

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

### "Can't reach database server" — use the pooler

The **direct** connection (`db.xxx.supabase.co:5432`) uses **IPv6 only**. Many networks (home, office) don't support IPv6, so the connection fails.

**Fix:** Use the **pooler** connection strings from Supabase Dashboard → Connect:

| Variable | Use | Format |
|----------|-----|--------|
| `DATABASE_URL` | App queries (serverless) | **Transaction pooler** — `aws-0-[REGION].pooler.supabase.com:6543`, user `postgres.[PROJECT_REF]` |
| `DIRECT_URL` | Migrations | **Session pooler** — `aws-0-[REGION].pooler.supabase.com:5432`, user `postgres.[PROJECT_REF]` |

Example (replace `[REGION]` with your region, e.g. `eu-central-1`):
```
DATABASE_URL="postgresql://postgres.wfobsunzcrgverpgtcdp:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.wfobsunzcrgverpgtcdp:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

Note: Pooler uses `postgres.[PROJECT_REF]` as the user, not `postgres`. Get the exact URIs from Connect → URI.

**Other checks:** Project not paused? IP not banned (Settings → Database → Connection pooling)?

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

- **Site URL**: `http://localhost:3000` (dev) or `https://yourdomain.com` (prod) — **no trailing slash**
- **Redirect URLs**: Add (no trailing slashes)
  - `http://localhost:3000/auth/callback`
  - `https://yourdomain.com/auth/callback`
  - `https://*.vercel.app/auth/callback` (if using Vercel preview deployments)

## 6b. Magic Link Production Checklist (Vercel)

The signin form calls `/api/auth/magic-link` (same-origin). Ensure these env vars in **Vercel → Settings → Environment Variables**:

| Variable | Required | Example |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://wfobsunzcrgverpgtcdp.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | `sb_publishable_xxx` |
| `NEXT_PUBLIC_APP_URL` | Yes (prod) | `https://www.realitypicks.xyz` |

**www vs non-www:** Set `NEXT_PUBLIC_APP_URL` to your canonical domain (e.g. `https://www.realitypicks.xyz`). Add both variants to Supabase Redirect URLs if users can reach either.

**Supabase Dashboard → Authentication → URL Configuration:**
- Site URL: `https://www.realitypicks.xyz` (no trailing slash)
- Redirect URLs: `https://www.realitypicks.xyz/auth/callback` (and `https://realitypicks.xyz/auth/callback` if non-www is used)

**Supabase project paused?** Free tier projects pause after inactivity. Restore from Dashboard.

## 7. Enable Email Auth (Magic Link)

In **Authentication → Providers → Email**:
- Enable Email provider
- Magic link is the default; no password required
- Configure "Confirm email" if you want double opt-in (off = instant magic link)

**Local dev:** Supabase's built-in email has a low rate limit (~3/hour). Use the "Instant login (dev only)" button on the signin page when on localhost, or configure [Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) in Supabase Dashboard.

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

## Magic Link Test Plan

**Local:**
1. `npm run dev`, open `http://localhost:3000/auth/signin`
2. Enter email, click "Send magic link"
3. Expect "Check your email" (no "Failed to fetch")
4. Click link in email → should land on `/auth/callback` then redirect to `/dashboard`

**Production (https://www.realitypicks.xyz):**
1. Open `https://www.realitypicks.xyz/auth/signin`
2. Enter email, click "Send magic link"
3. Expect "Check your email"
4. Click link in email → should redirect to `https://www.realitypicks.xyz/dashboard`

**If it fails:** Check Vercel logs for `[magic-link]` entries. Verify env vars are set and Supabase project is not paused.
