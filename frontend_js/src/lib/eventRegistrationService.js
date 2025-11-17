import { supabase } from './supabase';

class EventRegistrationService {
  // Register for an event
  async registerForEvent(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user is registered
  async isRegistered(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();

      return { 
        isRegistered: !!data && data.status === 'registered', 
        status: data?.status 
      };
    } catch (error) {
      return { isRegistered: false };
    }
  }

  // Cancel registration
  async cancelRegistration(eventId, userId) {
    try {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Cancel error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's registrations
  async getUserRegistrations(userId) {
    try {
      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          events:event_id (
            id,
            title,
            description,
            event_date,
            location,
            event_type,
            is_virtual,
            image_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'registered')
        .order('registered_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Fetch registrations error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get registration count for an event
  async getRegistrationCount(eventId) {
    try {
      const { count, error } = await supabase
        .from('event_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .eq('status', 'registered');

      if (error) throw error;
      return { success: true, count };
    } catch (error) {
      return { success: false, count: 0 };
    }
  }
}

export default new EventRegistrationService();
