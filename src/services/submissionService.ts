import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AssignmentSubmission = Database['public']['Tables']['assignment_submissions']['Row'];
type AssignmentSubmissionInsert = Database['public']['Tables']['assignment_submissions']['Insert'];

export class SubmissionService {
  // Get submissions for an assignment
  static async getSubmissions(assignmentId: string) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          writer:profiles!assignment_submissions_writer_id_fkey(id, first_name, last_name, email)
        `)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching submissions:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SubmissionService.getSubmissions error:', error);
      throw error;
    }
  }

  // Create a new submission
  static async createSubmission(submission: AssignmentSubmissionInsert) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .insert(submission)
        .select()
        .single();

      if (error) {
        console.error('Error creating submission:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SubmissionService.createSubmission error:', error);
      throw error;
    }
  }

  // Upload file to Supabase Storage
  static async uploadFile(file: File, assignmentId: string, writerId: string) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${assignmentId}/${writerId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('assignment-files')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('assignment-files')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('SubmissionService.uploadFile error:', error);
      throw error;
    }
  }

  // Download file from Supabase Storage
  static async downloadFile(fileUrl: string) {
    try {
      const { data, error } = await supabase.storage
        .from('assignment-files')
        .download(fileUrl);

      if (error) {
        console.error('Error downloading file:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SubmissionService.downloadFile error:', error);
      throw error;
    }
  }

  // Get submission by ID
  static async getSubmissionById(id: string) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          writer:profiles!assignment_submissions_writer_id_fkey(id, first_name, last_name, email),
          assignment:assignments!assignment_submissions_assignment_id_fkey(id, title, description)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching submission:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SubmissionService.getSubmissionById error:', error);
      throw error;
    }
  }

  // Update submission
  static async updateSubmission(id: string, updates: Partial<AssignmentSubmission>) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating submission:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SubmissionService.updateSubmission error:', error);
      throw error;
    }
  }

  // Delete submission
  static async deleteSubmission(id: string) {
    try {
      const { error } = await supabase
        .from('assignment_submissions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting submission:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('SubmissionService.deleteSubmission error:', error);
      throw error;
    }
  }

  // Get submission by assignment ID
  static async getSubmissionByAssignmentId(assignmentId: string) {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          writer:profiles!assignment_submissions_writer_id_fkey(id, first_name, last_name, email),
          assignment:assignments!assignment_submissions_assignment_id_fkey(id, title, description)
        `)
        .eq('assignment_id', assignmentId)
        .single();

      if (error) {
        console.error('Error fetching submission by assignment ID:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('SubmissionService.getSubmissionByAssignmentId error:', error);
      throw error;
    }
  }
} 