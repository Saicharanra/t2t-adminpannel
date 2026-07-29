-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- 1. USERS POLICIES
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins full access to users"
  ON public.users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 2. ADMINS POLICIES (Admin Management)
CREATE POLICY "Admins can view admins list"
  ON public.admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

CREATE POLICY "Super Admins manage admins"
  ON public.admins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'Super Admin'
    )
  );

-- 3. BUSINESSES POLICIES
CREATE POLICY "Public or authenticated read businesses"
  ON public.businesses FOR SELECT
  USING (status = 'Active');

CREATE POLICY "Admins full access to businesses"
  ON public.businesses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 4. BINS POLICIES
CREATE POLICY "Public read active bins"
  ON public.bins FOR SELECT
  USING (true);

CREATE POLICY "Admins manage bins"
  ON public.bins FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 5. WASTE SUBMISSIONS POLICIES
CREATE POLICY "Users can read own waste submissions"
  ON public.waste_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create waste submission"
  ON public.waste_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage waste submissions"
  ON public.waste_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 6. REWARDS POLICIES
CREATE POLICY "Public read rewards catalog"
  ON public.rewards FOR SELECT
  USING (true);

CREATE POLICY "Admins manage rewards catalog"
  ON public.rewards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 7. REDEMPTION REQUESTS POLICIES
CREATE POLICY "Users view own redemptions"
  ON public.redemption_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users request redemptions"
  ON public.redemption_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage redemptions"
  ON public.redemption_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 8. SUPPORT TICKETS & MESSAGES POLICIES
CREATE POLICY "Users view own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage support tickets"
  ON public.support_tickets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

CREATE POLICY "Ticket participants read ticket messages"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

CREATE POLICY "Ticket participants create ticket messages"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 9. NOTIFICATIONS POLICIES
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 10. PUBLIC SETTINGS & FEATURE FLAGS POLICIES
CREATE POLICY "Public read settings"
  ON public.settings FOR SELECT
  USING (true);

CREATE POLICY "Admins manage settings"
  ON public.settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

CREATE POLICY "Public read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

CREATE POLICY "Admins manage feature flags"
  ON public.feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- 11. AUDIT LOGS POLICIES
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('Admin', 'Super Admin')
    )
  );

-- SUPABASE STORAGE BUCKET CONFIGURATION
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('waste-images', 'waste-images', true),
  ('avatars', 'avatars', true),
  ('business-documents', 'business-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
CREATE POLICY "Public access to waste images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'waste-images');

CREATE POLICY "Authenticated users upload waste images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'waste-images' AND auth.role() = 'authenticated');

CREATE POLICY "Public access to avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
