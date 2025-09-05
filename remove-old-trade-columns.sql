-- Migration script to remove old columns from trades table
-- Run this AFTER running contract-purchases-setup.sql

-- Remove the old columns that are now handled by contract_purchases table
ALTER TABLE trades DROP COLUMN IF EXISTS contracts;
ALTER TABLE trades DROP COLUMN IF EXISTS purchase_price;
ALTER TABLE trades DROP COLUMN IF EXISTS purchase_date;
ALTER TABLE trades DROP COLUMN IF EXISTS notes;

-- Verify the changes
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'trades' 
-- ORDER BY ordinal_position;
