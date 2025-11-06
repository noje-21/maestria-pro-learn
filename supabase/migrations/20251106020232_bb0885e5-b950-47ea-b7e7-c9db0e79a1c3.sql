-- Create secure RPC function for admin to get user list without exposing emails
CREATE OR REPLACE FUNCTION public.get_user_list_for_admin()
RETURNS TABLE (
  id uuid,
  full_name text,
  status text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only allow admins to call this function
  SELECT 
    p.id,
    p.full_name,
    p.status,
    p.created_at
  FROM public.profiles p
  WHERE has_role(auth.uid(), 'admin'::app_role)
  ORDER BY p.created_at DESC;
$$;