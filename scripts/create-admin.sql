-- Run this in Supabase Dashboard → SQL Editor
-- Creates or updates laszlo.bihary@gmail.com as ADMIN

INSERT INTO "User" (
  "id",
  "email",
  "name",
  "role",
  "emailVerified",
  "referralCode",
  "picksBalance",
  "createdAt",
  "updatedAt"
)
VALUES (
  'c' || substr(encode(gen_random_bytes(12), 'hex'), 1, 24),
  'laszlo.bihary@gmail.com',
  'Laszlo',
  'ADMIN',
  NOW(),
  'ADMLASZLO',
  33333,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "role" = 'ADMIN',
  "updatedAt" = NOW();
