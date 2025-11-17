// Events Service - Handles all event-related API calls
import { supabase } from './supabase';

class EventsService {
  /**
   * Get all events with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of events
   */
  async getAllEvents(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        eventType = null,
        isVirtual = null,
        upcoming = true,
        search = null
      } = options;

      let query = supabase
        .from('events')
        .select(`
          *,
          created_by_user:users!events_created_by_fkey(
            id,
            name,
            avatar_url,
            current_title,
            current_company
          ),
          event_attendees(count)
        `)
        .order('start_date', { ascending: true });

      // Filter by upcoming/past events
      if (upcoming) {
        query = query.gte('start_date', new Date().toISOString());
      } else {
        query = query.lt('start_date', new Date().toISOString());
      }

      // Filter by event type
      if (eventType) {
        query = query.eq('event_type', eventType);
      }

      // Filter by virtual/in-person
      if (isVirtual !== null) {
        query = query.eq('is_virtual', isVirtual);
      }

      // Search in title and description
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Format the data
      return data.map(event => this.formatEvent(event));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get event by ID
   * @param {string} id - Event ID
   * @returns {Promise<Object>} Event details
   */
  async getEventById(id) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          created_by_user:users!events_created_by_fkey(
            id,
            name,
            avatar_url,
            current_title,
            current_company
          ),
          event_attendees(
            user_id,
            status,
            registered_at,
            user:users(name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.formatEvent(data);
    } catch (error) {
      console.error('❌ Error fetching event:', error);
      throw error;
    }
  }

  /**
   * Register for an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Registration result
   */
  async registerForEvent(eventId, userId) {
    try {
      const { data, error } = await supabase
        .from('event_attendees')
        .insert({
          event_id: eventId,
          user_id: userId,
          status: 'registered'
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('❌ Error registering for event:', error);
      throw error;
    }
  }

  /**
   * Unregister from an event
   * @param {string} eventId - Event ID
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async unregisterFromEvent(eventId, userId) {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error unregistering from event:', error);
      throw error;
    }
  }

  /**
   * Format event data
   * @param {Object} event - Raw event data
   * @returns {Object} Formatted event
   */
  formatEvent(event) {
    // Parse location
    let locationText = '';
    if (event.is_virtual) {
      locationText = 'Virtual Event';
    } else if (event.location) {
      const loc = event.location;
      if (loc.venue) {
        locationText = `${loc.venue}, ${loc.city || ''}`;
      } else {
        locationText = `${loc.city || ''}, ${loc.state || ''}, ${loc.country || ''}`;
      }
      locationText = locationText.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
    }

    // Calculate attendee count
    const attendeeCount = Array.isArray(event.event_attendees) 
      ? event.event_attendees.length 
      : (event.event_attendees?.count || 0);

    // Format dates
    const startDate = new Date(event.start_date);
    const endDate = event.end_date ? new Date(event.end_date) : null;

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      eventType: event.event_type,
      startDate: event.start_date,
      endDate: event.end_date,
      startDateFormatted: startDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      startTimeFormatted: startDate.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      location: locationText,
      locationData: event.location,
      isVirtual: event.is_virtual,
      virtualLink: event.virtual_link,
      maxAttendees: event.max_attendees,
      attendeeCount,
      spotsLeft: event.max_attendees ? event.max_attendees - attendeeCount : null,
      isPublic: event.is_public,
      createdBy: event.created_by_user || event.created_by,
      attendees: event.event_attendees || [],
      createdAt: event.created_at,
      updatedAt: event.updated_at
    };
  }

  /**
   * Get event types for filtering
   * @returns {Array<string>} Event types
   */
  getEventTypes() {
    return ['Workshop', 'Networking', 'Webinar', 'Social', 'Conference', 'Seminar'];
  }
}

export default new EventsService();
