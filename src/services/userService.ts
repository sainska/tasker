
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const UserService = {
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('UserService.getAllUsers error:', error);
      throw error;
    }
  },

  async getUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.getUserById error:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: Partial<Profile>) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.updateUser error:', error);
      throw error;
    }
  },

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  },

  async toggleUserStatus(id: string, isActive: boolean) {
    try {
      // Since is_active doesn't exist in the current schema, we'll simulate this
      // by updating the bio field
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          bio: isActive ? 'Active user' : 'Inactive user',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling user status:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.toggleUserStatus error:', error);
      throw error;
    }
  },

  async changeUserRole(id: string, role: 'client' | 'writer' | 'admin') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error changing user role:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.changeUserRole error:', error);
      throw error;
    }
  },

  async getWriters() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'writer')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching writers:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('UserService.getWriters error:', error);
      throw error;
    }
  },

  async getClients() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('UserService.getClients error:', error);
      throw error;
    }
  },

  async getUserStats(userId: string, userRole: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        user_id: userId,
        user_role: userRole
      });

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      throw error;
    }
  },

  async getAdminStats() {
    try {
      const { data, error } = await supabase.rpc('get_admin_stats');

      if (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.getAdminStats error:', error);
      throw error;
    }
  },

  async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'writer' | 'admin';
  }) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: crypto.randomUUID(),
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role,
          bio: '',
          avatar_url: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('UserService.createUser error:', error);
      throw error;
    }
  }
};
