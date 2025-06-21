import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export class MessageService {
  // Get messages for an assignment
  static async getMessages(assignmentId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, email),
          recipient:profiles!messages_recipient_id_fkey(id, first_name, last_name, email)
        `)
        .eq('assignment_id', assignmentId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('MessageService.getMessages error:', error);
      throw error;
    }
  }

  // Send a message
  static async sendMessage(message: MessageInsert) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, email),
          recipient:profiles!messages_recipient_id_fkey(id, first_name, last_name, email)
        `)
        .single();

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('MessageService.sendMessage error:', error);
      throw error;
    }
  }

  // Mark message as read
  static async markAsRead(messageId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Error marking message as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('MessageService.markAsRead error:', error);
      throw error;
    }
  }

  // Get unread message count for a user
  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('MessageService.getUnreadCount error:', error);
      throw error;
    }
  }

  // Get recent messages for a user
  static async getRecentMessages(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          assignment:assignments!messages_assignment_id_fkey(id, title),
          sender:profiles!messages_sender_id_fkey(id, first_name, last_name, email),
          recipient:profiles!messages_recipient_id_fkey(id, first_name, last_name, email)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent messages:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('MessageService.getRecentMessages error:', error);
      throw error;
    }
  }
} 