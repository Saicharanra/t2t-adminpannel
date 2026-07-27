-- Create OTP Codes Table for real email/SMS OTP verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_otp_email_code ON public.otp_codes(email, code);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Service role full access to otp_codes" ON public.otp_codes FOR ALL USING (true);';
EXCEPTION WHEN OTHERS THEN
  -- Policy already exists
END $$;
