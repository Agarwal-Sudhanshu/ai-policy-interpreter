-- Guest Mode and Demo Policy Library
-- Run this migration manually in Supabase SQL editor.

-- 1. Policies: add is_demo and owner_user_id
ALTER TABLE policies
  ADD COLUMN IF NOT EXISTS is_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS owner_user_id uuid REFERENCES auth.users(id);

-- 2. Usage events: support guest sessions (user_id nullable, add guest_session_id)
ALTER TABLE usage_events
  ADD COLUMN IF NOT EXISTS guest_session_id text;

ALTER TABLE usage_events
  ALTER COLUMN user_id DROP NOT NULL;

-- 3. (Optional) Seed demo policies. Run after ensuring you have at least one organization and product.
--    Replace the org and product IDs below with real IDs from your organizations and products tables, then run:
--
-- INSERT INTO policies (product_id, name, status, is_demo) VALUES
--   ('YOUR_PRODUCT_UUID', 'Housing Loan – Demo', 'active', true),
--   ('YOUR_PRODUCT_UUID', 'LAP – Demo', 'active', true),
--   ('YOUR_PRODUCT_UUID', 'Personal Loan – Demo', 'active', true),
--   ('YOUR_PRODUCT_UUID', 'Business Loan – Demo', 'active', true);
