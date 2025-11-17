import { supabase } from './supabase';
import { canUserConnect } from './profileCompletionService';

class ConnectionService {
  /**
   * Send connection request - WITH PROFILE COMPLETION CHECK
   */
  async sendRequest(recipientId, userId, message = '') {
    console.log('🔗 [sendRequest] Attempting to send connection request');
    console.log('📤 [sendRequest] From:', userId, 'To:', recipientId);
    
    try {
      // STEP 1: Fetch both users' profile completion status
      console.log('🔍 [sendRequest] Checking profile completion...');
      
      const { data: users, error: fetchError } = await supabase
        .from('users')
        .select('id, name, email, profile_completed, graduation_year, degree, major')
        .in('id', [userId, recipientId]);

      if (fetchError) {
        console.error('❌ [sendRequest] Error fetching users:', fetchError);
        throw fetchError;
      }

      if (!users || users.length !== 2) {
        throw new Error('One or both users not found');
      }

      const sender = users.find(u => u.id === userId);
      const recipient = users.find(u => u.id === recipientId);

      console.log('👤 [sendRequest] Sender profile:', sender);
      console.log('👤 [sendRequest] Recipient profile:', recipient);

      // STEP 2: Check sender's profile completion
      const senderCheck = canUserConnect(sender);
      if (!senderCheck.canConnect) {
        console.warn('⚠️ [sendRequest] Sender profile incomplete');
        return {
          success: false,
          error: 'PROFILE_INCOMPLETE',
          message: senderCheck.reason,
          missingFields: senderCheck.missingFields
        };
      }

      // STEP 3: Check recipient's profile completion
      const recipientCheck = canUserConnect(recipient);
      if (!recipientCheck.canConnect) {
        console.warn('⚠️ [sendRequest] Recipient profile incomplete');
        return {
          success: false,
          error: 'RECIPIENT_PROFILE_INCOMPLETE',
          message: `${recipient.name}'s profile is incomplete. They cannot receive connection requests yet.`
        };
      }

      console.log('✅ [sendRequest] Both profiles complete, proceeding...');

      // STEP 4: Send connection request
      const { data, error } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          recipient_id: recipientId,
          status: 'pending',
          message: message || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [sendRequest] Database error:', error);
        throw error;
      }

      console.log('✅ [sendRequest] Connection request sent successfully');
      return { success: true, data };
      
    } catch (error) {
      console.error('💥 [sendRequest] Error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Accept connection request
   */
  async acceptRequest(connectionId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error accepting connection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Reject connection request
   */
  async rejectRequest(connectionId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error rejecting connection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Withdraw sent connection request
   */
  async withdrawRequest(connectionId) {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId)
        .eq('status', 'pending');

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error withdrawing request:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove connection (delete)
   */
  async removeConnection(connectionId) {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing connection:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check connection status between two users
   */
  async getConnectionStatus(userId1, userId2) {
    try {
      // Query for connection in both directions
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${userId1},requester_id.eq.${userId2}`)
        .or(`recipient_id.eq.${userId1},recipient_id.eq.${userId2}`);

      if (error) throw error;

      // Find connection between these two specific users
      const connection = data?.find(conn => 
        (conn.requester_id === userId1 && conn.recipient_id === userId2) ||
        (conn.requester_id === userId2 && conn.recipient_id === userId1)
      );

      if (!connection) {
        return { success: true, status: 'none', connection: null };
      }

      return { 
        success: true, 
        status: connection.status,
        connection: connection,
        isPending: connection.status === 'pending',
        isConnected: connection.status === 'accepted',
        isRequester: connection.requester_id === userId1
      };
    } catch (error) {
      console.error('Error checking connection status:', error);
      return { success: true, status: 'none', connection: null };
    }
  }

  /**
   * Get user's connections (accepted only) - OPTIMIZED
   */
  async getUserConnections(userId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('id, requester_id, recipient_id, status, created_at')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: true, data: [] };
      }

      // OPTIMIZATION: Get all unique user IDs
      const userIds = [...new Set(
        data.map(conn => 
          conn.requester_id === userId ? conn.recipient_id : conn.requester_id
        )
      )];

      // OPTIMIZATION: Fetch ALL users in ONE query instead of N queries
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, current_title, current_company, location')
        .in('id', userIds);

      // Create user map for O(1) lookup
      const userMap = Object.fromEntries(users?.map(u => [u.id, u]) || []);

      // Map connections with user data
      const connections = data.map(conn => {
        const isRequester = conn.requester_id === userId;
        const otherUserId = isRequester ? conn.recipient_id : conn.requester_id;
        
        return {
          connection_id: conn.id,
          connected_at: conn.created_at,
          user: userMap[otherUserId] || { id: otherUserId, name: 'Unknown User' }
        };
      });

      return { success: true, data: connections };
    } catch (error) {
      console.error('Error fetching connections:', error);
      return { success: true, data: [] };
    }
  }

  /**
   * Get pending connection requests (received) - OPTIMIZED
   */
  async getPendingRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('id, requester_id, message, created_at')
        .eq('recipient_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: true, data: [] };
      }

      // OPTIMIZATION: Fetch all requesters in one query
      const requesterIds = data.map(req => req.requester_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, current_title, current_company, location')
        .in('id', requesterIds);

      const userMap = Object.fromEntries(users?.map(u => [u.id, u]) || []);

      const requests = data.map(req => ({
        ...req,
        requester: userMap[req.requester_id] || { id: req.requester_id, name: 'Unknown User' }
      }));

      return { success: true, data: requests };
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      return { success: true, data: [] };
    }
  }

  /**
   * Get sent connection requests (pending) - OPTIMIZED
   */
  async getSentRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('connections')
        .select('id, recipient_id, message, created_at')
        .eq('requester_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        return { success: true, data: [] };
      }

      // OPTIMIZATION: Fetch all recipients in one query
      const recipientIds = data.map(req => req.recipient_id);
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, current_title, current_company, location')
        .in('id', recipientIds);

      const userMap = Object.fromEntries(users?.map(u => [u.id, u]) || []);

      const requests = data.map(req => ({
        ...req,
        recipient: userMap[req.recipient_id] || { id: req.recipient_id, name: 'Unknown User' }
      }));

      console.log('✅ Sent requests with details:', requests);
      return { success: true, data: requests };
    } catch (error) {
      console.error('Error fetching sent requests:', error);
      return { success: true, data: [] };
    }
  }

  /**
   * Get connection count for a user
   */
  async getConnectionCount(userId) {
    try {
      const { count, error } = await supabase
        .from('connections')
        .select('*', { count: 'exact', head: true })
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting connection count:', error);
      return { success: false, count: 0 };
    }
  }
}

export default new ConnectionService();
