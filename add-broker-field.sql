-- Add broker field to trades table
ALTER TABLE trades ADD COLUMN broker VARCHAR(100);

-- Add broker field to contract_purchases table
ALTER TABLE contract_purchases ADD COLUMN broker VARCHAR(100);

-- Add broker field to contract_sales table  
ALTER TABLE contract_sales ADD COLUMN broker VARCHAR(100);

-- Update existing records to have a default broker (optional)
-- UPDATE trades SET broker = 'Webull' WHERE broker IS NULL;
-- UPDATE contract_purchases SET broker = 'Webull' WHERE broker IS NULL;
-- UPDATE contract_sales SET broker = 'Webull' WHERE broker IS NULL;
