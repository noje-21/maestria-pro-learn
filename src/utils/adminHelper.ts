import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a user has admin role
 * Uses the secure user_roles table instead of profiles
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error('Error checking admin role:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkIsAdmin:', error);
    return false;
  }
};

/**
 * Assign admin role to a user
 * Only use this for initial setup or admin management
 */
export const assignAdminRole = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    if (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in assignAdminRole:', error);
    return false;
  }
};
