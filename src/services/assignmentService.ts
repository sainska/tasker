import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Assignment = Database['public']['Tables']['assignments']['Row'];
type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];
type AssignmentUpdate = Database['public']['Tables']['assignments']['Update'];

export class AssignmentService {
  // Get all assignments for a user (client, writer, or admin)
  static async getAssignments(userId: string, role: 'client' | 'writer' | 'admin') {
    try {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          client:profiles!assignments_client_id_fkey(id, first_name, last_name, email),
          writer:profiles!assignments_writer_id_fkey(id, first_name, last_name, email)
        `);

      if (role === 'client') {
        query = query.eq('client_id', userId);
      } else if (role === 'writer') {
        query = query.eq('writer_id', userId);
      }
      // Admin can see all assignments

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AssignmentService.getAssignments error:', error);
      throw error;
    }
  }

  // Get assignment by ID
  static async getAssignmentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          *,
          client:profiles!assignments_client_id_fkey(id, first_name, last_name, email),
          writer:profiles!assignments_writer_id_fkey(id, first_name, last_name, email)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching assignment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AssignmentService.getAssignmentById error:', error);
      throw error;
    }
  }

  // Create new assignment
  static async createAssignment(assignment: AssignmentInsert) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert(assignment)
        .select()
        .single();

      if (error) {
        console.error('Error creating assignment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AssignmentService.createAssignment error:', error);
      throw error;
    }
  }

  // Update assignment
  static async updateAssignment(id: string, updates: AssignmentUpdate) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating assignment:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AssignmentService.updateAssignment error:', error);
      throw error;
    }
  }

  // Delete assignment
  static async deleteAssignment(id: string) {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting assignment:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('AssignmentService.deleteAssignment error:', error);
      throw error;
    }
  }

  // Assign writer to assignment
  static async assignWriter(assignmentId: string, writerId: string) {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .update({ 
          writer_id: writerId, 
          status: 'assigned' 
        })
        .eq('id', assignmentId)
        .select()
        .single();

      if (error) {
        console.error('Error assigning writer:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AssignmentService.assignWriter error:', error);
      throw error;
    }
  }

  // Get assignments by status
  static async getAssignmentsByStatus(status: string, userId?: string, role?: string) {
    try {
      let query = supabase
        .from('assignments')
        .select(`
          *,
          client:profiles!assignments_client_id_fkey(id, first_name, last_name, email),
          writer:profiles!assignments_writer_id_fkey(id, first_name, last_name, email)
        `)
        .eq('status', status);

      if (userId && role) {
        if (role === 'client') {
          query = query.eq('client_id', userId);
        } else if (role === 'writer') {
          query = query.eq('writer_id', userId);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching assignments by status:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('AssignmentService.getAssignmentsByStatus error:', error);
      throw error;
    }
  }
} 