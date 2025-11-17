import { supabase } from './supabase';

class WarmIntroService {
  async createRequest({ requesterId, alumniId, goal, message, preferredTime }) {
    const { data, error } = await supabase
      .from('warm_intro_requests')
      .insert({
        requester_id: requesterId,
        alumni_id: alumniId,
        goal,
        message,
        preferred_time: preferredTime || null,
        status: 'pending'
      })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  async getIncomingRequests(alumniId) {
    const { data, error } = await supabase
      .from('warm_intro_requests')
      .select(`
        *,
        requester:requester_id(id, name, avatar_url, current_title, current_company, graduation_year),
        alumni:alumni_id(id, name, avatar_url)
      `)
      .eq('alumni_id', alumniId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getOutgoingRequests(requesterId) {
    const { data, error } = await supabase
      .from('warm_intro_requests')
      .select(`
        *,
        requester:requester_id(id, name, avatar_url),
        alumni:alumni_id(id, name, avatar_url, current_title, current_company, graduation_year)
      `)
      .eq('requester_id', requesterId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async updateStatus({ requestId, status }) {
    const { data, error } = await supabase
      .from('warm_intro_requests')
      .update({ status })
      .eq('id', requestId)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}

export default new WarmIntroService();
