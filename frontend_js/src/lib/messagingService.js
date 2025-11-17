import { supabase } from './supabase';
import { createTimeoutQuery } from './robustQuery';

class MessagingService {
  /**
   * Get or create a conversation between two users
   */
  async getOrCreateConversation(userId1, userId2) {
    try {
      // Find existing conversation between these two users
      const { data: conversations, error: searchError } = await supabase
        .from('conversations')
        .select('id, participant_ids')
        .contains('participant_ids', [userId1])
        .contains('participant_ids', [userId2]);

      if (searchError) throw searchError;

      // Check if conversation exists with exactly these two participants
      const existingConv = conversations?.find(conv => 
        conv.participant_ids.length === 2 &&
        conv.participant_ids.includes(userId1) &&
        conv.participant_ids.includes(userId2)
      );

      if (existingConv) {
        return { success: true, conversationId: existingConv.id, isNew: false };
      }

      // Create new conversation with both participants
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert([{
          participant_ids: [userId1, userId2],
          last_message_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;

      return { success: true, conversationId: newConv.id, isNew: true };
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId) {
    try {
      // Get all conversations where user is a participant
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .contains('participant_ids', [userId])
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      if (!conversations || conversations.length === 0) {
        return { success: true, data: [] };
      }

      // Get all unique participant IDs
      const allParticipantIds = [...new Set(
        conversations.flatMap(conv => conv.participant_ids.filter(id => id !== userId))
      )];

      // Fetch all participants in one query
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, current_title, current_company')
        .in('id', allParticipantIds);

      const userMap = Object.fromEntries(users?.map(u => [u.id, u]) || []);

      // Get last message for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          // Get other participant
          const otherUserId = conv.participant_ids.find(id => id !== userId);
          const otherUser = userMap[otherUserId];

          // Get last message
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          const lastMessage = messages?.[0] || null;

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .eq('is_read', false);

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            last_message_at: conv.last_message_at,
            otherUser,
            lastMessage,
            unreadCount: unreadCount || 0
          };
        })
      );

      return { success: true, data: conversationsWithDetails };
    } catch (error) {
      console.error('Error fetching conversations:', error.message || error);
      return { success: true, data: [] };
    }
  }

  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users (
            id,
            name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message
   */
  async sendMessage(conversationId, senderId, content) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversationId,
            sender_id: senderId,
            content: content.trim(),
            is_read: false
          }
        ])
        .select(`
          *,
          sender:users (
            id,
            name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId, userId) {
    try {
      // Mark all messages in conversation as read
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Subscribe to messages in a conversation (inserts + status updates)
   */
  subscribeToMessages(conversationId, callback) {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: message } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users (
                id,
                name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          callback(message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const { data: message } = await supabase
            .from('messages')
            .select(`
              *,
              sender:users (
                id,
                name,
                avatar_url
              )
            `)
            .eq('id', payload.new.id)
            .single();

          callback(message);
        }
      )
      .subscribe();

    return channel;
  }

  /**
   * Unsubscribe from messages
   */
  unsubscribeFromMessages(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
    }
  }

  /**
   * Get total unread message count for user
   */
  async getUnreadCount(userId) {
    try {
      // Get all user's conversations
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .contains('participant_ids', [userId]);

      if (!conversations || conversations.length === 0) {
        return { success: true, count: 0 };
      }

      const conversationIds = conversations.map(c => c.id);

      // Count unread messages across all conversations
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { success: false, count: 0 };
    }
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId, userId) {
    try {
      // Verify user is participant
      const { data: conversation } = await supabase
        .from('conversations')
        .select('participant_ids')
        .eq('id', conversationId)
        .single();

      if (!conversation || !conversation.participant_ids.includes(userId)) {
        throw new Error('Not authorized to delete this conversation');
      }

      // Delete conversation (cascade will handle messages)
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if two users are connected (for messaging permission)
   */
  async canMessage(userId1, userId2) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('status')
        .or(`requester_id.eq.${userId1},requester_id.eq.${userId2}`)
        .or(`recipient_id.eq.${userId1},recipient_id.eq.${userId2}`);

      if (error) throw error;

      // Find connection between these two specific users
      const connection = data?.find(conn => 
        (conn.requester_id === userId1 && conn.recipient_id === userId2) ||
        (conn.requester_id === userId2 && conn.recipient_id === userId1)
      );

      return {
        success: true,
        canMessage: connection?.status === 'accepted',
        connectionStatus: connection?.status || 'none'
      };
    } catch (error) {
      console.error('Error checking message permission:', error);
      return { success: false, canMessage: false };
    }
  }
}

export default new MessagingService();
