import { supabase } from './supabase';

class JobBookmarkService {
  /**
   * Bookmark a job
   */
  async bookmarkJob(jobId, userId) {
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .insert({
          job_id: jobId,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error bookmarking job:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove bookmark
   */
  async removeBookmark(jobId, userId) {
    try {
      const { error } = await supabase
        .from('job_bookmarks')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if job is bookmarked
   */
  async isBookmarked(jobId, userId) {
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return { success: true, isBookmarked: !!data };
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return { success: true, isBookmarked: false };
    }
  }

  /**
   * Get user's bookmarked jobs
   */
  async getUserBookmarks(userId) {
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .select(`
          id,
          created_at,
          jobs (
            id,
            title,
            company,
            description,
            location,
            job_type,
            experience_level,
            salary_range,
            skills_required,
            application_deadline,
            external_link,
            is_active,
            posted_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to flat structure
      const bookmarks = data.map(bookmark => ({
        bookmark_id: bookmark.id,
        bookmarked_at: bookmark.created_at,
        ...bookmark.jobs
      }));

      return { success: true, data: bookmarks };
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  /**
   * Get bookmark count for a job
   */
  async getBookmarkCount(jobId) {
    try {
      const { count, error } = await supabase
        .from('job_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('job_id', jobId);

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting bookmark count:', error);
      return { success: false, count: 0 };
    }
  }
}

export default new JobBookmarkService();
