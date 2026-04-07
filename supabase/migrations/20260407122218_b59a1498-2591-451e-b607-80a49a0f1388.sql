
-- 1. Create dedicated password_reset_tokens table (no SELECT policy for users)
CREATE TABLE public.password_reset_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email TEXT NOT NULL,
  reset_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- No SELECT/INSERT/UPDATE/DELETE policies for regular users
-- Only service_role (edge functions) can access this table

-- 2. Remove reset_code columns from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS reset_code;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS reset_code_expires_at;

-- 3. Fix enrollment_leads SELECT policy to use user_id instead of email
DROP POLICY IF EXISTS "Users can view their own lead" ON public.enrollment_leads;

CREATE POLICY "Users can view their own lead"
ON public.enrollment_leads FOR SELECT
USING (
  auth.uid() IS NOT NULL AND auth.uid() = user_id
);
