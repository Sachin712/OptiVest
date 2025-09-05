-- Migration script to rename symbol field to option_name and add type field
-- Run this script in your Supabase SQL editor if you have existing data

-- Step 1: Add the new type column
ALTER TABLE trades ADD COLUMN type TEXT CHECK (type IN ('CALL', 'PUT'));

-- Step 2: Set default value for existing records (assuming they are CALL options)
UPDATE trades SET type = 'CALL' WHERE type IS NULL;

-- Step 3: Make the type column NOT NULL
ALTER TABLE trades ALTER COLUMN type SET NOT NULL;

-- Step 4: Rename symbol column to option_name
ALTER TABLE trades RENAME COLUMN symbol TO option_name;

-- Step 5: Drop the old index and create new ones
DROP INDEX IF EXISTS idx_trades_symbol;
CREATE INDEX idx_trades_option_name ON trades(option_name);
CREATE INDEX idx_trades_type ON trades(type);

-- Step 6: Remove old columns that are no longer used (if they exist)
ALTER TABLE trades DROP COLUMN IF EXISTS sell_price;
ALTER TABLE trades DROP COLUMN IF EXISTS sell_date;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'trades' 
ORDER BY ordinal_position;
