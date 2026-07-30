-- ============================================================================
-- Trash2Treasure (T2T) Master Unified Database Migration
-- Target: Supabase Postgres
-- Connects: User App, Admin Panel, Business Portal, Super Admin Panel
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS FOR TIMESTAMPS & SECURITY
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security Role Helper Functions
CREATE OR REPLACE FUNCTION public.is_super_admin(user_auth_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.super_admins WHERE auth_user_id = user_auth_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin(user_auth_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE auth_user_id = user_auth_id
  ) OR public.is_super_admin(user_auth_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_business(user_auth_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.businesses WHERE auth_user_id = user_auth_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 3. CORE AUTH & IDENTITY TABLES
-- ----------------------------------------------------------------------------

-- Public Users (Extends auth.users 1:1)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'User',
  status TEXT NOT NULL DEFAULT 'Active',
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  points INT NOT NULL DEFAULT 0,
  waste_submitted DOUBLE PRECISION NOT NULL DEFAULT 0,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Super Admins
CREATE TABLE IF NOT EXISTS public.super_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL DEFAULT '["*"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admins
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'Moderator',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  locked_until TIMESTAMPTZ,
  login_attempts INT NOT NULL DEFAULT 0,
  created_by UUID REFERENCES public.super_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Businesses
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending Approval',
  document_url TEXT,
  logo_url TEXT,
  revenue DOUBLE PRECISION NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. USER ECOSYSTEM TABLES
-- ----------------------------------------------------------------------------

-- Waste Submissions
CREATE TABLE IF NOT EXISTS public.waste_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  weight DOUBLE PRECISION NOT NULL,
  location TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  image_url TEXT,
  ai_confidence DOUBLE PRECISION NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  assigned_admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Points History
CREATE TABLE IF NOT EXISTS public.points_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  type TEXT NOT NULL, -- Earned, Redeemed, Adjusted
  source TEXT NOT NULL, -- Waste Submission, Reward Redemption, Admin Adjustment
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  type TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Support Tickets
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  assigned_to UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ticket Messages
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. BUSINESS & REWARDS ECOSYSTEM TABLES
-- ----------------------------------------------------------------------------

-- Rewards Catalog
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  points_required INT NOT NULL,
  category TEXT NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  discount_value DOUBLE PRECISION NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  points_required INT NOT NULL,
  max_redemptions INT NOT NULL DEFAULT 100,
  current_redemptions INT NOT NULL DEFAULT 0,
  expiry_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget DOUBLE PRECISION NOT NULL DEFAULT 0,
  spent DOUBLE PRECISION NOT NULL DEFAULT 0,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  redemptions_count INT NOT NULL DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reward Transactions
CREATE TABLE IF NOT EXISTS public.reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  reward_id UUID REFERENCES public.rewards(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Completed',
  transaction_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupon Redemptions
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  points_spent INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Redeemed',
  redemption_code TEXT UNIQUE NOT NULL,
  verified_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store Visits
CREATE TABLE IF NOT EXISTS public.store_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  redemption_id UUID REFERENCES public.coupon_redemptions(id) ON DELETE SET NULL,
  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Verified',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Notifications
CREATE TABLE IF NOT EXISTS public.business_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. ADMIN OPERATIONS & SECURITY TABLES
-- ----------------------------------------------------------------------------

-- Admin Sessions
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin OTPs
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

-- Admin Login History
CREATE TABLE IF NOT EXISTS public.admin_login_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trusted Devices
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

-- Smart Bins Monitoring
CREATE TABLE IF NOT EXISTS public.bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  capacity DOUBLE PRECISION NOT NULL,
  fill_percentage DOUBLE PRECISION NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Active',
  maintenance_status TEXT,
  last_cleared TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. SUPER ADMIN & INFRASTRUCTURE TABLES
-- ----------------------------------------------------------------------------

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_by UUID REFERENCES public.super_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Global Announcements
CREATE TABLE IF NOT EXISTS public.global_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target_audience TEXT NOT NULL DEFAULT 'All', -- All, Users, Businesses, Admins
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.super_admins(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin Management
CREATE TABLE IF NOT EXISTS public.admin_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  managed_by UUID REFERENCES public.super_admins(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Business Management
CREATE TABLE IF NOT EXISTS public.business_management (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  managed_by UUID REFERENCES public.super_admins(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Impersonation Sessions (Super Admin cross-panel access)
CREATE TABLE IF NOT EXISTS public.impersonation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_admin_id UUID NOT NULL REFERENCES public.super_admins(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  target_role TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Omnipresent Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  super_admin_id UUID REFERENCES public.super_admins(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE & FAST LOOKUPS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_admins_auth_id ON public.admins(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_auth_id ON public.businesses(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_super_admins_auth_id ON public.super_admins(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_waste_submissions_user ON public.waste_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_waste_submissions_admin ON public.waste_submissions(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_points_history_user ON public.points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_business ON public.coupons(business_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon ON public.coupon_redemptions(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user ON public.coupon_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_store_visits_business ON public.store_visits(business_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON public.audit_logs(admin_id);

-- ----------------------------------------------------------------------------
-- 9. AUTOMATED TRIGGERS & WORKFLOWS
-- ----------------------------------------------------------------------------

-- Trigger to auto-update updated_at across all key tables
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND column_name = 'updated_at'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_update_%I_updated_at ON public.%I;
      CREATE TRIGGER trg_update_%I_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- Auth Trigger: Auto-create User Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_role TEXT;
BEGIN
  v_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'User');

  INSERT INTO public.users (id, auth_user_id, email, name, role, status)
  VALUES (NEW.id, NEW.id, NEW.email, v_name, v_role, 'Active')
  ON CONFLICT (id) DO UPDATE 
  SET name = EXCLUDED.name, email = EXCLUDED.email;

  -- Create Welcome Notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (NEW.id, 'Welcome to Trash2Treasure!', 'Your account has been successfully created. Start recycling today!', 'welcome');

  -- Log Audit Event
  INSERT INTO public.audit_logs (user_id, event, details)
  VALUES (NEW.id, 'USER_REGISTERED', jsonb_build_object('email', NEW.email, 'role', v_role));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 10. RPC STORED PROCEDURES
-- ----------------------------------------------------------------------------

-- Waste Submission Verification Function
CREATE OR REPLACE FUNCTION public.verify_waste_submission(
  p_submission_id UUID,
  p_admin_id UUID,
  p_is_approved BOOLEAN,
  p_awarded_points INT DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_sub RECORD;
BEGIN
  SELECT * INTO v_sub FROM public.waste_submissions WHERE id = p_submission_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Waste submission not found';
  END IF;

  IF p_is_approved THEN
    -- Update submission status
    UPDATE public.waste_submissions
    SET status = 'Verified',
        points = p_awarded_points,
        assigned_admin_id = p_admin_id,
        notes = p_notes,
        verified_at = NOW()
    WHERE id = p_submission_id;

    -- Award points & increment waste total on user
    UPDATE public.users
    SET points = points + p_awarded_points,
        waste_submitted = waste_submitted + v_sub.weight
    WHERE id = v_sub.user_id;

    -- Record Points History
    INSERT INTO public.points_history (user_id, points, type, source, reference_id, description)
    VALUES (v_sub.user_id, p_awarded_points, 'Earned', 'Waste Submission', p_submission_id, 'Points awarded for waste recycling');

    -- Create Notification
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_sub.user_id, 'Waste Verification Approved', format('Your waste submission of %s kg has been verified! You earned %s points.', v_sub.weight, p_awarded_points), 'success');
  ELSE
    UPDATE public.waste_submissions
    SET status = 'Rejected',
        assigned_admin_id = p_admin_id,
        notes = p_notes,
        verified_at = NOW()
    WHERE id = p_submission_id;

    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (v_sub.user_id, 'Waste Submission Rejected', format('Your submission was rejected. Reason: %s', COALESCE(p_notes, 'Does not meet guidelines')), 'warning');
  END IF;

  -- Create Audit Log
  INSERT INTO public.audit_logs (admin_id, user_id, event, details)
  VALUES (p_admin_id, v_sub.user_id, CASE WHEN p_is_approved THEN 'WASTE_APPROVED' ELSE 'WASTE_REJECTED' END, jsonb_build_object('submission_id', p_submission_id, 'points', p_awarded_points));

  RETURN jsonb_build_object('success', true, 'status', CASE WHEN p_is_approved THEN 'Verified' ELSE 'Rejected' END);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business Approval Function
CREATE OR REPLACE FUNCTION public.approve_business(
  p_business_id UUID,
  p_admin_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_biz RECORD;
BEGIN
  SELECT * INTO v_biz FROM public.businesses WHERE id = p_business_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Business not found';
  END IF;

  UPDATE public.businesses
  SET status = 'Approved',
      approved_by = p_admin_id,
      approved_at = NOW()
  WHERE id = p_business_id;

  INSERT INTO public.business_notifications (business_id, title, message)
  VALUES (p_business_id, 'Business Account Approved!', 'Your business profile has been activated. You can now publish coupons and campaigns.');

  INSERT INTO public.audit_logs (admin_id, business_id, event, details)
  VALUES (p_admin_id, p_business_id, 'BUSINESS_APPROVED', jsonb_build_object('name', v_biz.name));

  RETURN jsonb_build_object('success', true, 'status', 'Approved');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Business Rejection Function
CREATE OR REPLACE FUNCTION public.reject_business(
  p_business_id UUID,
  p_admin_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.businesses
  SET status = 'Rejected',
      approved_by = p_admin_id,
      rejection_reason = p_reason
  WHERE id = p_business_id;

  INSERT INTO public.business_notifications (business_id, title, message)
  VALUES (p_business_id, 'Business Account Rejected', format('Your account application was rejected. Reason: %s', COALESCE(p_reason, 'Incomplete details.')));

  INSERT INTO public.audit_logs (admin_id, business_id, event, details)
  VALUES (p_admin_id, p_business_id, 'BUSINESS_REJECTED', jsonb_build_object('reason', p_reason));

  RETURN jsonb_build_object('success', true, 'status', 'Rejected');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Coupon Redemption Function
CREATE OR REPLACE FUNCTION public.redeem_coupon(
  p_coupon_id UUID,
  p_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_coupon RECORD;
  v_user RECORD;
  v_code TEXT;
  v_redemption_id UUID;
BEGIN
  SELECT * INTO v_coupon FROM public.coupons WHERE id = p_coupon_id AND status = 'Active';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Coupon not found or inactive';
  END IF;

  IF v_coupon.current_redemptions >= v_coupon.max_redemptions THEN
    RAISE EXCEPTION 'Coupon maximum redemptions reached';
  END IF;

  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF v_user.points < v_coupon.points_required THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;

  -- Generate unique redemption code
  v_code := 'RED-' || upper(substring(md5(random()::text) from 1 for 8));

  -- Deduct points
  UPDATE public.users SET points = points - v_coupon.points_required WHERE id = p_user_id;

  -- Update coupon counter
  UPDATE public.coupons SET current_redemptions = current_redemptions + 1 WHERE id = p_coupon_id;

  -- Insert redemption
  INSERT INTO public.coupon_redemptions (coupon_id, user_id, business_id, points_spent, status, redemption_code)
  VALUES (p_coupon_id, p_user_id, v_coupon.business_id, v_coupon.points_required, 'Redeemed', v_code)
  RETURNING id INTO v_redemption_id;

  -- Record store visit automatically
  INSERT INTO public.store_visits (user_id, business_id, redemption_id, status)
  VALUES (p_user_id, v_coupon.business_id, v_redemption_id, 'Verified');

  -- Record Points History
  INSERT INTO public.points_history (user_id, points, type, source, reference_id, description)
  VALUES (p_user_id, -v_coupon.points_required, 'Redeemed', 'Coupon Redemption', v_redemption_id, format('Redeemed coupon %s', v_coupon.code));

  -- Send Notifications
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Coupon Redeemed!', format('You successfully redeemed %s code: %s', v_coupon.title, v_code), 'success');

  INSERT INTO public.business_notifications (business_id, title, message)
  VALUES (v_coupon.business_id, 'New Coupon Redemption', format('User redeemed coupon %s (Code: %s)', v_coupon.title, v_code));

  -- Log Audit Event
  INSERT INTO public.audit_logs (user_id, business_id, event, details)
  VALUES (p_user_id, v_coupon.business_id, 'COUPON_REDEEMED', jsonb_build_object('coupon_id', p_coupon_id, 'code', v_code));

  RETURN jsonb_build_object('success', true, 'redemption_code', v_code, 'redemption_id', v_redemption_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Award Points Function
CREATE OR REPLACE FUNCTION public.award_points(
  p_user_id UUID,
  p_points INT,
  p_reason TEXT,
  p_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.users SET points = points + p_points WHERE id = p_user_id;

  INSERT INTO public.points_history (user_id, points, type, source, description)
  VALUES (p_user_id, p_points, 'Earned', 'Admin Bonus', p_reason);

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (p_user_id, 'Points Awarded!', format('You were awarded %s points. Reason: %s', p_points, p_reason), 'success');

  INSERT INTO public.audit_logs (admin_id, user_id, event, details)
  VALUES (p_admin_id, p_user_id, 'POINTS_AWARDED', jsonb_build_object('points', p_points, 'reason', p_reason));

  RETURN jsonb_build_object('success', true, 'points_awarded', p_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock & Unlock Admin Functions
CREATE OR REPLACE FUNCTION public.lock_admin(
  p_admin_id UUID,
  p_reason TEXT DEFAULT NULL,
  p_super_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.admins 
  SET is_locked = true, 
      locked_until = NOW() + INTERVAL '30 days'
  WHERE id = p_admin_id;

  INSERT INTO public.audit_logs (super_admin_id, admin_id, event, details)
  VALUES (p_super_admin_id, p_admin_id, 'ADMIN_LOCKED', jsonb_build_object('reason', p_reason));

  RETURN jsonb_build_object('success', true, 'locked', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.unlock_admin(
  p_admin_id UUID,
  p_super_admin_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
BEGIN
  UPDATE public.admins 
  SET is_locked = false, 
      locked_until = NULL,
      login_attempts = 0
  WHERE id = p_admin_id;

  INSERT INTO public.audit_logs (super_admin_id, admin_id, event, details)
  VALUES (p_super_admin_id, p_admin_id, 'ADMIN_UNLOCKED', '{}'::jsonb);

  RETURN jsonb_build_object('success', true, 'locked', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Impersonation Session Start Function
CREATE OR REPLACE FUNCTION public.start_impersonation(
  p_super_admin_id UUID,
  p_target_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_token TEXT;
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE id = p_target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found';
  END IF;

  v_token := 'IMP-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 16));

  INSERT INTO public.impersonation_sessions (super_admin_id, target_user_id, session_token, target_role, expires_at)
  VALUES (p_super_admin_id, p_target_user_id, v_token, v_role, NOW() + INTERVAL '2 hours');

  INSERT INTO public.audit_logs (super_admin_id, user_id, event, details)
  VALUES (p_super_admin_id, p_target_user_id, 'SUPER_ADMIN_IMPERSONATED_USER', jsonb_build_object('target_role', v_role, 'token', v_token));

  RETURN jsonb_build_object('success', true, 'session_token', v_token, 'target_role', v_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Overall System Statistics Function
CREATE OR REPLACE FUNCTION public.system_statistics()
RETURNS JSONB AS $$
DECLARE
  v_users INT;
  v_admins INT;
  v_businesses INT;
  v_waste DOUBLE PRECISION;
  v_points INT;
  v_revenue DOUBLE PRECISION;
  v_pending_waste INT;
  v_active_campaigns INT;
BEGIN
  SELECT COUNT(*) INTO v_users FROM public.users;
  SELECT COUNT(*) INTO v_admins FROM public.admins;
  SELECT COUNT(*) INTO v_businesses FROM public.businesses WHERE status = 'Approved';
  SELECT COALESCE(SUM(waste_submitted), 0) INTO v_waste FROM public.users;
  SELECT COALESCE(SUM(points), 0) INTO v_points FROM public.users;
  SELECT COALESCE(SUM(revenue), 0) INTO v_revenue FROM public.businesses;
  SELECT COUNT(*) INTO v_pending_waste FROM public.waste_submissions WHERE status = 'Pending';
  SELECT COUNT(*) INTO v_active_campaigns FROM public.campaigns WHERE status = 'Active';

  RETURN jsonb_build_object(
    'total_users', v_users,
    'total_admins', v_admins,
    'active_businesses', v_businesses,
    'total_waste_kg', v_waste,
    'total_points_circulating', v_points,
    'total_revenue', v_revenue,
    'pending_waste_submissions', v_pending_waste,
    'active_campaigns', v_active_campaigns
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ----------------------------------------------------------------------------
-- 11. ANALYTICS VIEWS
-- ----------------------------------------------------------------------------

-- System Dashboard Overview
CREATE OR REPLACE VIEW public.v_system_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM public.users) AS total_users,
  (SELECT COUNT(*) FROM public.admins) AS total_admins,
  (SELECT COUNT(*) FROM public.businesses) AS total_businesses,
  (SELECT COUNT(*) FROM public.businesses WHERE status = 'Approved') AS approved_businesses,
  (SELECT COALESCE(SUM(waste_submitted), 0) FROM public.users) AS total_waste_kg,
  (SELECT COALESCE(SUM(points), 0) FROM public.users) AS total_points_in_circulation,
  (SELECT COALESCE(SUM(revenue), 0) FROM public.businesses) AS total_ecosystem_revenue;

-- User Leaderboard
CREATE OR REPLACE VIEW public.v_user_leaderboard AS
SELECT 
  id AS user_id,
  name,
  email,
  city,
  state,
  points,
  waste_submitted AS waste_kg,
  DENSE_RANK() OVER (ORDER BY points DESC) AS rank
FROM public.users
WHERE status = 'Active'
ORDER BY points DESC;

-- Waste Collection Analytics
CREATE OR REPLACE VIEW public.v_waste_collection_analytics AS
SELECT 
  category,
  COUNT(*) AS total_submissions,
  COALESCE(SUM(weight), 0) AS total_weight_kg,
  COALESCE(SUM(points), 0) AS total_points_awarded,
  COALESCE(AVG(ai_confidence), 0) AS avg_ai_confidence
FROM public.waste_submissions
WHERE status = 'Verified'
GROUP BY category;

-- Business Performance & Revenue View
CREATE OR REPLACE VIEW public.v_business_dashboard AS
SELECT 
  b.id AS business_id,
  b.name AS business_name,
  b.category,
  b.status,
  b.revenue,
  COUNT(DISTINCT c.id) AS active_coupons,
  COUNT(DISTINCT cmp.id) AS active_campaigns,
  COUNT(DISTINCT cr.id) AS total_redemptions,
  COUNT(DISTINCT sv.id) AS total_store_visits
FROM public.businesses b
LEFT JOIN public.coupons c ON c.business_id = b.id AND c.status = 'Active'
LEFT JOIN public.campaigns cmp ON cmp.business_id = b.id AND cmp.status = 'Active'
LEFT JOIN public.coupon_redemptions cr ON cr.business_id = b.id
LEFT JOIN public.store_visits sv ON sv.business_id = b.id
GROUP BY b.id, b.name, b.category, b.status, b.revenue;

-- Admin Operations View
CREATE OR REPLACE VIEW public.v_admin_dashboard AS
SELECT 
  (SELECT COUNT(*) FROM public.waste_submissions WHERE status = 'Pending') AS pending_waste_reviews,
  (SELECT COUNT(*) FROM public.businesses WHERE status = 'Pending Approval') AS pending_business_approvals,
  (SELECT COUNT(*) FROM public.support_tickets WHERE status = 'Open') AS open_support_tickets,
  (SELECT COUNT(*) FROM public.bins WHERE fill_percentage > 80) AS high_capacity_bins;

-- ----------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Service Role Bypass (Full access for backend / triggers / service keys)
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Service role full access on %I" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "Service role full access on %I" ON public.%I FOR ALL USING (true)', t, t);
  END LOOP;
END $$;

-- 2. User Policies
CREATE POLICY "Users can read own record" ON public.users 
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own record" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own waste submissions" ON public.waste_submissions 
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can submit waste" ON public.waste_submissions 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own points history" ON public.points_history 
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can read own notifications" ON public.notifications 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications 
  FOR UPDATE USING (user_id = auth.uid());

-- 3. Business Policies
CREATE POLICY "Businesses read own record" ON public.businesses 
  FOR SELECT USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Businesses read public rewards/coupons" ON public.coupons 
  FOR SELECT USING (true);

CREATE POLICY "Businesses manage own coupons" ON public.coupons 
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE auth_user_id = auth.uid()) OR public.is_admin());

CREATE POLICY "Businesses manage own campaigns" ON public.campaigns 
  FOR ALL USING (business_id IN (SELECT id FROM public.businesses WHERE auth_user_id = auth.uid()) OR public.is_admin());

-- 4. Admin & Super Admin Policies
CREATE POLICY "Admins full access to operational tables" ON public.waste_submissions 
  FOR ALL USING (public.is_admin());

CREATE POLICY "Super Admins full access system settings" ON public.system_settings 
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Super Admins full access audit logs" ON public.audit_logs 
  FOR ALL USING (public.is_super_admin() OR public.is_admin());

-- ----------------------------------------------------------------------------
-- 13. STORAGE BUCKET CREATION & CONFIGURATION
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('waste-images', 'waste-images', true),
  ('business-documents', 'business-documents', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 14. SCHEMA RELOAD NOTIFICATION
-- ----------------------------------------------------------------------------
NOTIFY pgrst, 'reload schema';
