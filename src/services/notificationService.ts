import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export class NotificationService {
  // Get notifications for a user
  static async getNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('NotificationService.getNotifications error:', error);
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('NotificationService.getUnreadCount error:', error);
      throw error;
    }
  }

  // Create a new notification
  static async createNotification(notification: NotificationInsert) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('NotificationService.createNotification error:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('NotificationService.markAsRead error:', error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('NotificationService.markAllAsRead error:', error);
      throw error;
    }
  }

  // Delete a notification
  static async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('NotificationService.deleteNotification error:', error);
      throw error;
    }
  }

  // Create system notifications
  static async createSystemNotification(userId: string, title: string, message: string, type: 'assignment' | 'message' | 'rating' | 'system' = 'system') {
    try {
      return await this.createNotification({
        user_id: userId,
        title,
        message,
        type,
        is_read: false
      });
    } catch (error) {
      console.error('Error creating system notification:', error);
      throw error;
    }
  }

  // Create assignment notification
  static async createAssignmentNotification(userId: string, assignmentId: string, title: string, message: string) {
    try {
      return await this.createNotification({
        user_id: userId,
        title,
        message,
        type: 'assignment',
        related_id: assignmentId,
        is_read: false
      });
    } catch (error) {
      console.error('Error creating assignment notification:', error);
      throw error;
    }
  }

  // Create message notification
  static async createMessageNotification(userId: string, messageId: string, title: string, message: string) {
    try {
      return await this.createNotification({
        user_id: userId,
        title,
        message,
        type: 'message',
        related_id: messageId,
        is_read: false
      });
    } catch (error) {
      console.error('Error creating message notification:', error);
      throw error;
    }
  }

  // Get notifications by type
  static async getNotificationsByType(userId: string, type: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications by type:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('NotificationService.getNotificationsByType error:', error);
      throw error;
    }
  }
} 