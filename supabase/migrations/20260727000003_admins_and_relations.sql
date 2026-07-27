-- 1. Create Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Moderator',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_until TIMESTAMPTZ,
  login_attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create Admin Sessions Table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create Admin OTPs Table
CREATE TABLE IF NOT EXISTS public.admin_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Admin Login Histories Table
CREATE TABLE IF NOT EXISTS public.admin_login_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create Trusted Devices Table
CREATE TABLE IF NOT EXISTS public.trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  device_token TEXT UNIQUE NOT NULL,
  device_name TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Modify Audit Logs Table to include admin relations and additional metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'admin_id'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'browser'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN browser TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'os'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN os TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'audit_logs' 
      AND column_name = 'timestamp'
  ) THEN
    ALTER TABLE public.audit_logs ADD COLUMN timestamp TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- 7. Add Indexes
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_otps_hash ON public.admin_otps(otp_hash);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_token ON public.trusted_devices(device_token);

-- 8. Enable RLS on new tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

-- 9. Add RLS Policies allowing full access to service role
DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Service role full access to admins" ON public.admins FOR ALL USING (true);';
  EXECUTE 'CREATE POLICY "Service role full access to admin_sessions" ON public.admin_sessions FOR ALL USING (true);';
  EXECUTE 'CREATE POLICY "Service role full access to admin_otps" ON public.admin_otps FOR ALL USING (true);';
  EXECUTE 'CREATE POLICY "Service role full access to admin_login_histories" ON public.admin_login_histories FOR ALL USING (true);';
  EXECUTE 'CREATE POLICY "Service role full access to trusted_devices" ON public.trusted_devices FOR ALL USING (true);';
EXCEPTION WHEN OTHERS THEN
  -- Policies already exist
END $$;
