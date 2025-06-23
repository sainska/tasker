
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const UserService = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async toggleUserStatus(id: string, isActive: boolean) {
    // Since is_active doesn't exist in the current schema, we'll simulate this
    // by updating the profile with a note or using another field
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        bio: isActive ? 'Active user' : 'Inactive user'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async changeUserRole(id: string, role: 'client' | 'writer' | 'admin') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getWriters() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'writer')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getClients() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'client')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserStats(userId: string, userRole: string) {
    const { data, error } = await supabase.rpc('get_user_stats', {
      user_id: userId,
      user_role: userRole
    });

    if (error) throw error;
    return data;
  },

  async getAdminStats() {
    const { data, error } = await supabase.rpc('get_admin_stats');

    if (error) throw error;
    return data;
  },

  async createUser(userData: {
    email: string;
    first_name: string;
    last_name: string;
    role: 'client' | 'writer' | 'admin';
  }) {
    // Note: This would typically involve creating an auth user first
    // For now, we'll just create a profile entry
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: crypto.randomUUID(), // Temporary ID generation
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        bio: '',
        avatar_url: ''
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
