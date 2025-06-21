import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class UserService {
  // Get all users (admin only)
  static async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.getAllUsers error:', error);
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

  // Get user profile by ID
  static async getUserById(id: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.getUserById error:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateProfile(id: string, updates: ProfileUpdate) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('UserService.updateProfile error:', error);
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

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

  // Get user statistics
  static async getUserStats(userId: string, role: string) {
    try {
      let stats = {
        totalAssignments: 0,
        completedAssignments: 0,
        pendingAssignments: 0,
        inProgressAssignments: 0,
        totalEarnings: 0,
        averageRating: 0
      };

      // Get assignment counts
      const { data: assignments, error: assignmentsError } = await supabase
        .from('assignments')
        .select('status, budget')
        .eq(role === 'client' ? 'client_id' : 'writer_id', userId);

      if (assignmentsError) {
        console.error('Error fetching assignment stats:', assignmentsError);
      } else if (assignments) {
        stats.totalAssignments = assignments.length;
        stats.completedAssignments = assignments.filter(a => a.status === 'completed').length;
        stats.pendingAssignments = assignments.filter(a => a.status === 'pending').length;
        stats.inProgressAssignments = assignments.filter(a => 
          ['assigned', 'in_progress', 'submitted', 'revision_requested'].includes(a.status)
        ).length;
        
        if (role === 'writer') {
          stats.totalEarnings = assignments
            .filter(a => a.status === 'completed')
            .reduce((sum, a) => sum + (a.budget || 0), 0);
        }
      }

      // Get average rating for writers
      if (role === 'writer') {
        const { data: ratings, error: ratingsError } = await supabase
          .from('ratings')
          .select('rating')
          .eq('rated_id', userId);

        if (!ratingsError && ratings && ratings.length > 0) {
          stats.averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        }
      }

      return stats;
    } catch (error) {
      console.error('UserService.getUserStats error:', error);
      throw error;
    }
  }
} 