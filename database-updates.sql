-- Add expiry_date column to trades table
ALTER TABLE trades ADD COLUMN expiry_date DATE;

-- Add strike_price column to trades table (we'll need this for the option name format)
ALTER TABLE trades ADD COLUMN strike_price DECIMAL(10,2);

-- Add index on expiry_date for faster filtering
CREATE INDEX idx_trades_expiry_date ON trades(expiry_date);

-- Add index on strike_price for faster filtering
CREATE INDEX idx_trades_strike_price ON trades(strike_price);

-- Update existing records to have default values (optional - only if you have existing data)
-- UPDATE trades SET expiry_date = '2025-01-01' WHERE expiry_date IS NULL;
-- UPDATE trades SET strike_price = 100.00 WHERE strike_price IS NULL;

-- Make the new columns NOT NULL after updating existing data
-- ALTER TABLE trades ALTER COLUMN expiry_date SET NOT NULL;
-- ALTER TABLE trades ALTER COLUMN strike_price SET NOT NULL;
