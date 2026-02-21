-- Optional: todos table for Supabase client usage (e.g. page.tsx)
CREATE TABLE IF NOT EXISTS "todos" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "title" TEXT,
  "completed" BOOLEAN DEFAULT FALSE
);
