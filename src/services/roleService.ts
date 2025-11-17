import { supabase } from "@/integrations/supabase/client";

export interface RoleCheckResponse {
  isAdmin: boolean;
  error?: string;
}

export const roleService = {
  async checkAdminStatus(): Promise<RoleCheckResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return { isAdmin: false, error: 'No active session' };
      }

      const { data, error } = await supabase.functions.invoke('check-admin', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking admin status:', error);
        return { isAdmin: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Unexpected error checking admin status:', error);
      return { isAdmin: false, error: 'Failed to check admin status' };
    }
  },

  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(r => r.role) || [];
    } catch (error) {
      console.error('Unexpected error fetching user roles:', error);
      return [];
    }
  },
};
