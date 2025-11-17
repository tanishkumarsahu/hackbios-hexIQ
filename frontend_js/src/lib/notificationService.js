import { supabase } from './supabase';
import { createTimeoutQuery } from './robustQuery';

class NotificationService {
  // Create notification
  async createNotification(userId, type, title, message, link = null) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          link
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Create notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user notifications
  async getUserNotifications(userId, limit = 20) {
    try {
      const { data, error } = await createTimeoutQuery(
        supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit),
        6000
      );

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Fetch notifications error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true, count };
    } catch (error) {
      console.error('Fetch unread count error:', error);
      return { success: false, count: 0 };
    }
  }

  // Mark as read
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message };
    }
  }

  // Mark all as read
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe to real-time notifications
  subscribeToNotifications(userId, callback) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(channel) {
    if (channel) {
      channel.unsubscribe();
    }
  }
}

export default new NotificationService();
