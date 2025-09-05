-- Create contract_purchases table to track multiple purchases of the same option
CREATE TABLE contract_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  contracts INTEGER NOT NULL CHECK (contracts > 0),
  purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_contract_purchases_trade_id ON contract_purchases(trade_id);
CREATE INDEX idx_contract_purchases_purchase_date ON contract_purchases(purchase_date);

-- Enable Row Level Security (RLS)
ALTER TABLE contract_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for contract_purchases
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

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contract_purchases_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_contract_purchases_updated_at
  BEFORE UPDATE ON contract_purchases
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_purchases_updated_at_column();

-- Update trades table to remove individual purchase fields (we'll use contract_purchases instead)
-- First, let's add a migration to move existing data to contract_purchases
INSERT INTO contract_purchases (trade_id, contracts, purchase_price, purchase_date, notes)
SELECT 
  id as trade_id,
  contracts,
  purchase_price,
  purchase_date,
  notes
FROM trades
WHERE id IS NOT NULL;

-- Now we can remove the individual purchase fields from trades table
-- (Commenting out for safety - uncomment after verifying data migration)
-- ALTER TABLE trades DROP COLUMN IF EXISTS contracts;
-- ALTER TABLE trades DROP COLUMN IF EXISTS purchase_price;
-- ALTER TABLE trades DROP COLUMN IF EXISTS purchase_date;
-- ALTER TABLE trades DROP COLUMN IF EXISTS notes;

-- Add computed columns for easier querying (optional, for performance)
-- These will be calculated from contract_purchases
-- ALTER TABLE trades ADD COLUMN total_contracts INTEGER GENERATED ALWAYS AS (
--   (SELECT COALESCE(SUM(contracts), 0) FROM contract_purchases WHERE trade_id = trades.id)
-- ) STORED;

-- ALTER TABLE trades ADD COLUMN weighted_avg_price DECIMAL(10,2) GENERATED ALWAYS AS (
--   (SELECT COALESCE(
--     SUM(contracts * purchase_price) / NULLIF(SUM(contracts), 0), 
--     0
--   ) FROM contract_purchases WHERE trade_id = trades.id)
-- ) STORED;
