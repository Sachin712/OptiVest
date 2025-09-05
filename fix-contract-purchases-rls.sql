-- Fix RLS policies for contract_purchases table
-- This should resolve the "new row violates row-level security policy" error

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view contract purchases for their trades" ON contract_purchases;
DROP POLICY IF EXISTS "Users can insert contract purchases for their trades" ON contract_purchases;
DROP POLICY IF EXISTS "Users can update contract purchases for their trades" ON contract_purchases;
DROP POLICY IF EXISTS "Users can delete contract purchases for their trades" ON contract_purchases;

-- Create simpler policies that work better with Clerk
CREATE POLICY "Users can view contract purchases for their trades" ON contract_purchases
  FOR SELECT USING (
    trade_id IN (
      SELECT id FROM trades WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert contract purchases for their trades" ON contract_purchases
  FOR INSERT WITH CHECK (
    trade_id IN (
      SELECT id FROM trades WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can update contract purchases for their trades" ON contract_purchases
  FOR UPDATE USING (
    trade_id IN (
      SELECT id FROM trades WHERE user_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete contract purchases for their trades" ON contract_purchases
  FOR DELETE USING (
    trade_id IN (
      SELECT id FROM trades WHERE user_id = auth.uid()::text
    )
  );

-- Alternative: If the above still doesn't work, try this simpler approach
-- (Uncomment if needed)
-- DROP POLICY IF EXISTS "Users can insert contract purchases for their trades" ON contract_purchases;
-- CREATE POLICY "Users can insert contract purchases for their trades" ON contract_purchases
--   FOR INSERT WITH CHECK (user_id IS NOT NULL);
