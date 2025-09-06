-- Create user_stats table to track registration counts
CREATE TABLE user_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_name TEXT NOT NULL UNIQUE,
  stat_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial user count
INSERT INTO user_stats (stat_name, stat_value) VALUES ('total_users', 0);

-- Create function to increment user count
CREATE OR REPLACE FUNCTION increment_user_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats 
  SET stat_value = stat_value + 1, updated_at = NOW()
  WHERE stat_name = 'total_users';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment on new user registration
-- Note: This would need to be set up with Clerk's webhooks in a real implementation
-- For now, we'll manually update the count

-- Create function to get user count
CREATE OR REPLACE FUNCTION get_user_count()
RETURNS INTEGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT stat_value INTO user_count FROM user_stats WHERE stat_name = 'total_users';
  RETURN COALESCE(user_count, 0);
END;
$$ LANGUAGE plpgsql;

-- Enable RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access to user stats (for displaying count)
CREATE POLICY "Allow public read access to user stats" ON user_stats
  FOR SELECT USING (true);

-- Allow authenticated users to update stats (for admin purposes)
CREATE POLICY "Allow authenticated users to update stats" ON user_stats
  FOR UPDATE USING (auth.uid() IS NOT NULL);
