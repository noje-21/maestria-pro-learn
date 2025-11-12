-- Cleanup: Remove user_roles entries for users that don't exist in profiles
DELETE FROM public.user_roles
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- Add a function to automatically clean up user_roles when a profile is deleted
CREATE OR REPLACE FUNCTION public.cleanup_user_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_roles WHERE user_id = OLD.id;
  RETURN OLD;
END;
$$;

-- Create trigger to auto-cleanup user_roles when profile is deleted
DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
CREATE TRIGGER on_profile_deleted
  BEFORE DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_user_roles();