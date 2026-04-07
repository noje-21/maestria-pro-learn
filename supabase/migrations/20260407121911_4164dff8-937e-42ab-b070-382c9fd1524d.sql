
-- Recreate exam_questions_safe as SECURITY INVOKER
CREATE OR REPLACE VIEW public.exam_questions_safe
WITH (security_invoker = true) AS
SELECT 
  id,
  exam_id,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  hint,
  created_at
FROM public.exam_questions;

-- Recreate enrollment_leads_safe as SECURITY INVOKER
CREATE OR REPLACE VIEW public.enrollment_leads_safe
WITH (security_invoker = true) AS
SELECT 
  id, full_name, email, country, specialty, phone, course_id, 
  status, user_id, created_at, updated_at,
  payment_completed_at,
  CASE WHEN public.has_role(auth.uid(), 'admin'::public.app_role) THEN stripe_customer_id ELSE NULL END AS stripe_customer_id,
  CASE WHEN public.has_role(auth.uid(), 'admin'::public.app_role) THEN stripe_session_id ELSE NULL END AS stripe_session_id
FROM public.enrollment_leads;
