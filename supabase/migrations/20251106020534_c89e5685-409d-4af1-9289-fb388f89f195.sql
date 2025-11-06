-- Create RPC function for server-side admin verification
CREATE OR REPLACE FUNCTION public.verify_admin_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'admin'::app_role);
$$;

-- Add RLS policy for admins to view all exam attempts
CREATE POLICY "Admins can view all exam attempts"
ON public.exam_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add RLS policy for admins to view user progress
CREATE POLICY "Admins can view all user progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));