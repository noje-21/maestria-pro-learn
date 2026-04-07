
-- Fix: Make view use SECURITY INVOKER and grant necessary access
ALTER VIEW public.exam_questions_safe SET (security_invoker = on);

-- Since the view now uses invoker security, we need a SELECT policy 
-- for authenticated users on exam_questions but ONLY for the safe columns.
-- We'll use a different approach: allow authenticated SELECT but the view restricts columns.
DROP POLICY IF EXISTS "Only admins can view exam questions directly" ON public.exam_questions;

-- Authenticated users can SELECT exam_questions (view restricts which columns they see)
CREATE POLICY "Authenticated users can view exam questions"
ON public.exam_questions
FOR SELECT
USING (auth.role() = 'authenticated'::text);

-- But we also need to ensure the view is the ONLY way students access it.
-- Actually, with SECURITY INVOKER the user's own permissions apply.
-- The issue is that if they can SELECT the table, they can see correct_answer directly.
-- So we need to restrict table SELECT to admins only, and use SECURITY DEFINER view.

-- Revert: admin-only table access, security definer view
DROP POLICY IF EXISTS "Authenticated users can view exam questions" ON public.exam_questions;

CREATE POLICY "Only admins can view exam questions directly"
ON public.exam_questions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Revert view to security definer (this is the correct approach for this use case)
ALTER VIEW public.exam_questions_safe SET (security_invoker = off);
