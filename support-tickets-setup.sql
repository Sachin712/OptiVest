-- Create the support_tickets table
CREATE TABLE support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  user_email TEXT NOT NULL,
  issue_summary TEXT NOT NULL,
  detailed_description TEXT NOT NULL,
  attachment_url TEXT,
  attachment_filename TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')) DEFAULT 'open',
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on reference_id for faster lookups
CREATE INDEX idx_support_tickets_reference_id ON support_tickets(reference_id);

-- Create index on user_id for user-specific queries
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);

-- Create index on status for filtering
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Create index on created_at for sorting
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR ALL USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create policy to allow users to insert their own tickets
CREATE POLICY "Users can insert own tickets" ON support_tickets
  FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_support_tickets_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_support_tickets_updated_at 
  BEFORE UPDATE ON support_tickets 
  FOR EACH ROW 
  EXECUTE FUNCTION update_support_tickets_updated_at_column();

-- Function to generate reference ID
CREATE OR REPLACE FUNCTION generate_reference_id()
RETURNS TEXT AS $$
DECLARE
  ref_id TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate a reference ID with format: OPT-YYYYMMDD-XXXXXX
    ref_id := 'OPT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    -- Check if this reference ID already exists
    SELECT COUNT(*) INTO exists_count FROM support_tickets WHERE reference_id = ref_id;
    
    -- If it doesn't exist, we can use it
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN ref_id;
END;
$$ LANGUAGE plpgsql;

-- Create storage bucket for support attachments
-- Note: This needs to be run in the Supabase dashboard or via the Supabase CLI
-- INSERT INTO storage.buckets (id, name, public) VALUES ('support-attachments', 'support-attachments', false);

-- Create storage policy for support attachments
-- CREATE POLICY "Users can upload their own support attachments" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can view their own support attachments" ON storage.objects
--   FOR SELECT USING (bucket_id = 'support-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
