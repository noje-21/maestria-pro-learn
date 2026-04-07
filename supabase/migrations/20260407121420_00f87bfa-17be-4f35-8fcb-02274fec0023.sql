
-- Create a safe view for enrollment leads that hides Stripe IDs from non-admins
CREATE OR REPLACE VIEW public.enrollment_leads_safe AS
SELECT 
  id, full_name, email, country, specialty, phone, course_id, 
  status, user_id, created_at, updated_at,
  payment_completed_at,
  -- Only expose Stripe IDs to admins
  CASE WHEN public.has_role(auth.uid(), 'admin'::public.app_role) THEN stripe_customer_id ELSE NULL END AS stripe_customer_id,
  CASE WHEN public.has_role(auth.uid(), 'admin'::public.app_role) THEN stripe_session_id ELSE NULL END AS stripe_session_id
FROM public.enrollment_leads;

-- Drop the existing user SELECT policy that exposes all columns
DROP POLICY IF EXISTS "Users can view their own lead" ON public.enrollment_leads;

-- Re-create user SELECT policy without Stripe fields access
-- Users can only see their own leads but Stripe IDs are still in the row
-- The application should use the safe view for user-facing queries
CREATE POLICY "Users can view their own lead" 
ON public.enrollment_leads FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND email = (SELECT p.email FROM profiles p WHERE p.id = auth.uid())
);
