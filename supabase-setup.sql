-- Create the trades table
CREATE TABLE trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  option_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CALL', 'PUT')),
  contracts INTEGER NOT NULL CHECK (contracts > 0),
  purchase_price DECIMAL(10,2) NOT NULL CHECK (purchase_price >= 0),
  purchase_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_trades_user_id ON trades(user_id);

-- Create index on option_name for faster searches
CREATE INDEX idx_trades_option_name ON trades(option_name);

-- Create index on type for filtering
CREATE INDEX idx_trades_type ON trades(type);

-- Create index on status for filtering
CREATE INDEX idx_trades_status ON trades(status);

-- Create index on dates for sorting
CREATE INDEX idx_trades_purchase_date ON trades(purchase_date);
CREATE INDEX idx_trades_sell_date ON trades(sell_date);

-- Enable Row Level Security (RLS)
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own trades
CREATE POLICY "Users can view own trades" ON trades
  FOR ALL USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own trades
CREATE POLICY "Users can insert own trades" ON trades
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own trades
CREATE POLICY "Users can update own trades" ON trades
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Create policy to allow users to delete their own trades
CREATE POLICY "Users can delete own trades" ON trades
  FOR DELETE USING (auth.uid()::text = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_trades_updated_at 
  BEFORE UPDATE ON trades 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Migration script for existing data (run this if you have existing trades table)
-- ALTER TABLE trades RENAME COLUMN symbol TO option_name;
-- ALTER TABLE trades ADD COLUMN type TEXT CHECK (type IN ('CALL', 'PUT'));
-- UPDATE trades SET type = 'CALL' WHERE type IS NULL; -- Set default to CALL for existing records
-- ALTER TABLE trades ALTER COLUMN type SET NOT NULL;
-- DROP INDEX IF EXISTS idx_trades_symbol;
-- CREATE INDEX idx_trades_option_name ON trades(option_name);
-- CREATE INDEX idx_trades_type ON trades(type);
