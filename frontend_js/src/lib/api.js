/**
 * API utility for traditional auth endpoints
 * This is a placeholder for any custom backend API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const authAPI = {
  /**
   * Traditional logout endpoint (if you have a custom backend)
   * This is optional - Supabase handles auth primarily
   */
  logout: async () => {
    try {
      // If you have a custom backend logout endpoint, call it here
      // For now, this is a no-op since we're using Supabase auth
      return { success: true };
    } catch (error) {
      console.warn('Traditional logout API call failed:', error);
      throw error;
    }
  },

  /**
   * Check server health (optional)
   */
  healthCheck: async () => {
    try {
      if (!API_BASE_URL) return { status: 'ok', message: 'No API configured' };
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return await response.json();
    } catch (error) {
      console.warn('Health check failed:', error);
      return { status: 'error', message: error.message };
    }
  },
};

export default authAPI;
