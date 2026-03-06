-- BaridiMob Payments Table
-- For manual payment verification via BaridiMob transfers

CREATE TABLE IF NOT EXISTS baridimob_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  amount INTEGER NOT NULL CHECK (amount IN (1350, 13500)),
  receipt_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_baridimob_payments_user_id ON baridimob_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_baridimob_payments_user_email ON baridimob_payments(user_email);
CREATE INDEX IF NOT EXISTS idx_baridimob_payments_status ON baridimob_payments(status);
CREATE INDEX IF NOT EXISTS idx_baridimob_payments_created_at ON baridimob_payments(created_at DESC);

-- Enable RLS
ALTER TABLE baridimob_payments ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert own payments" ON baridimob_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own payments" ON baridimob_payments
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_email = auth.jwt()->>'email'
  );

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_baridimob_payments_updated_at
  BEFORE UPDATE ON baridimob_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE baridimob_payments IS 'Manual BaridiMob payment submissions requiring admin approval';
COMMENT ON COLUMN baridimob_payments.status IS 'pending = awaiting review, approved = subscription activated, rejected = payment declined';
