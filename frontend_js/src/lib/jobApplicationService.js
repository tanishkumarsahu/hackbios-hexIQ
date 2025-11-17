import { supabase } from './supabase';

class JobApplicationService {
  // Apply to a job
  async applyToJob(jobId, userId, coverLetter = '') {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          user_id: userId,
          cover_letter: coverLetter,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Apply error:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if user has applied to job
  async hasApplied(jobId, userId) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('id, status')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .maybeSingle();

      return { hasApplied: !!data, status: data?.status };
    } catch (error) {
      return { hasApplied: false };
    }
  }

  // Get user's applications
  async getUserApplications(userId) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          jobs:job_id (
            id,
            title,
            company,
            location,
            job_type,
            salary_range,
            logo_url
          )
        `)
        .eq('user_id', userId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Fetch applications error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get application count for a job
  async getApplicationCount(jobId) {
    try {
      const { count, error } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId);

      if (error) throw error;
      return { success: true, count };
    } catch (error) {
      return { success: false, count: 0 };
    }
  }

  // Withdraw application
  async withdrawApplication(applicationId) {
    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new JobApplicationService();
