import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class UserService {
  // Get user profile by ID
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.getUserProfile error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: ProfileUpdate) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.updateUserProfile error:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats(userId: string, role: 'client' | 'writer') {
    try {
      let stats = {
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        inProgressAssignments: 0,
        earnings: 0
      };

      if (role === 'client') {
        // Get client statistics
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .eq('client_id', userId);

        if (assignmentsError) {
          console.error('Error fetching client assignments:', assignmentsError);
          throw assignmentsError;
        }

        stats.totalAssignments = assignments?.length || 0;
        stats.completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
        stats.pendingAssignments = assignments?.filter(a => a.status === 'pending').length || 0;
        stats.inProgressAssignments = assignments?.filter(a => a.status === 'in_progress').length || 0;
      } else if (role === 'writer') {
        // Get writer statistics
        const { data: assignments, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .eq('writer_id', userId);

        if (assignmentsError) {
          console.error('Error fetching writer assignments:', assignmentsError);
          throw assignmentsError;
        }

        stats.totalAssignments = assignments?.length || 0;
        stats.completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
        stats.pendingAssignments = assignments?.filter(a => a.status === 'pending').length || 0;
        stats.inProgressAssignments = assignments?.filter(a => a.status === 'in_progress').length || 0;
        
        // Calculate earnings from completed assignments
        const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];
        stats.earnings = completedAssignments.reduce((total, assignment) => total + (assignment.budget || 0), 0);
      }

      return stats;
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      throw error;
    }
  }

  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.getAllUsers error:', error);
      throw error;
    }
  }

  // Get admin statistics
  static async getAdminStats() {
    try {
      const stats = {
        totalUsers: 0,
        totalAssignments: 0,
        totalRevenue: 0,
        activeWriters: 0,
        pendingAssignments: 0,
        completedAssignments: 0
      };

      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');

      if (usersError) {
        console.error('Error fetching users for admin stats:', usersError);
        throw usersError;
      }

      stats.totalUsers = users?.length || 0;
      stats.activeWriters = users?.filter(u => u.role === 'writer' && u.is_active).length || 0;

      // Get all assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*');

      if (assignmentsError) {
        console.error('Error fetching assignments for admin stats:', assignmentsError);
        throw assignmentsError;
      }

      stats.totalAssignments = assignments?.length || 0;
      stats.pendingAssignments = assignments?.filter(a => a.status === 'pending').length || 0;
      stats.completedAssignments = assignments?.filter(a => a.status === 'completed').length || 0;
      
      // Calculate total revenue from completed assignments
      const completedAssignments = assignments?.filter(a => a.status === 'completed') || [];
      stats.totalRevenue = completedAssignments.reduce((total, assignment) => total + (assignment.budget || 0), 0);

      return stats;
    } catch (error) {
      console.error('UserService.getAdminStats error:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('UserService.deleteUser error:', error);
      throw error;
    }
  }

  // Deactivate/Activate user (admin only)
  static async toggleUserStatus(userId: string, isActive: boolean) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
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
  }

  // Change user role (admin only)
  static async changeUserRole(userId: string, newRole: 'client' | 'writer' | 'admin') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
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
  }

  // Get users by role
  static async getUsersByRole(role: 'client' | 'writer' | 'admin') {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users by role:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.getUsersByRole error:', error);
      throw error;
    }
  }

  // Get writers for assignment assignment
  static async getAvailableWriters() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, bio')
        .eq('role', 'writer')
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching available writers:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.getAvailableWriters error:', error);
      throw error;
    }
  }
} 