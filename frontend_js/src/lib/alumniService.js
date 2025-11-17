import { supabase } from './supabase';

export class AlumniService {
  // Mock data removed - using real database only

  /**
   * Fetch all alumni profiles with optional filters
   */
  static async getAllAlumni(filters = {}) {
    try {
      // Check if Supabase is properly configured
      if (!supabase) {
        console.error('Supabase not configured');
        return {
          success: false,
          data: [],
          count: 0,
          source: 'error'
        };
      }

      let query = supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          location,
          bio,
          current_title,
          current_company,
          graduation_year,
          degree,
          major,
          linkedin_url,
          github_url,
          website_url,
          avatar_url,
          skills,
          interests,
          profile_completed,
          profile_completion_percentage,
          created_at,
          updated_at
        `)
        // CRITICAL: Only show users with COMPLETED and VERIFIED profiles
        .eq('profile_completed', true)
        .eq('is_verified', true) // Only verified users
        .eq('is_active', true) // Only active users
        .order('name', { ascending: true })
        .limit(100); // Limit to 100 users for performance

      // Apply filters
      if (filters.graduationYear) {
        query = query.eq('graduation_year', filters.graduationYear);
      }
      
      if (filters.degree) {
        query = query.ilike('degree', `%${filters.degree}%`);
      }
      
      if (filters.company) {
        query = query.ilike('current_company', `%${filters.company}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          current_company.ilike.%${filters.search}%,
          degree.ilike.%${filters.search}%,
          current_title.ilike.%${filters.search}%,
          bio.ilike.%${filters.search}%
        `);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Database query failed:', error.message);
        return {
          success: false,
          data: [],
          count: 0,
          source: 'error'
        };
      }

      return {
        success: true,
        data: data || [],
        count: data?.length || 0,
        source: 'database'
      };

    } catch (error) {
      console.error('Alumni service error:', error?.message || 'Unknown error');
      return {
        success: false,
        data: [],
        count: 0,
        source: 'error'
      };
    }
  }

  /**
   * Get alumni with pagination
   */
  static async getAlumniPaginated(page = 1, limit = 12, filters = {}) {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return {
          success: false,
          data: [],
          count: 0,
          page,
          limit,
          totalPages: 0,
          source: 'error'
        };
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          phone,
          location,
          bio,
          current_title,
          current_company,
          graduation_year,
          degree,
          major,
          linkedin_url,
          github_url,
          website_url,
          avatar_url,
          skills,
          interests,
          profile_completed,
          profile_completion_percentage,
          created_at,
          updated_at
        `, { count: 'exact' })
        // CRITICAL: Only show users with COMPLETED and VERIFIED profiles
        .eq('profile_completed', true)
        .eq('is_verified', true) // Only verified users
        .eq('is_active', true) // Only active users
        .order('name', { ascending: true })
        .range(from, to);

      // Apply filters (same as above)
      if (filters.graduationYear) {
        query = query.eq('graduation_year', filters.graduationYear);
      }
      
      if (filters.degree) {
        query = query.ilike('degree', `%${filters.degree}%`);
      }
      
      if (filters.company) {
        query = query.ilike('current_company', `%${filters.company}%`);
      }
      
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters.search) {
        query = query.or(`
          name.ilike.%${filters.search}%,
          current_company.ilike.%${filters.search}%,
          degree.ilike.%${filters.search}%,
          current_title.ilike.%${filters.search}%,
          bio.ilike.%${filters.search}%
        `);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Database pagination failed:', error.message);
        return {
          success: false,
          data: [],
          count: 0,
          page,
          limit,
          totalPages: 0,
          source: 'error'
        };
      }

      return {
        success: true,
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
        source: 'database'
      };

    } catch (error) {
      console.error('Pagination error:', error?.message || 'Unknown error');
      return {
        success: false,
        data: [],
        count: 0,
        page,
        limit,
        totalPages: 0,
        source: 'error'
      };
    }
  }

  /**
   * Get unique values for filter dropdowns
   */
  static async getFilterOptions() {
    try {
      if (!supabase) {
        console.error('Supabase not configured');
        return {
          success: false,
          graduationYears: [],
          degrees: [],
          companies: [],
          locations: [],
          source: 'error'
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('graduation_year, degree, current_company, location')
        .not('graduation_year', 'is', null)
        .not('degree', 'is', null)
        .not('current_company', 'is', null)
        .not('location', 'is', null);

      if (error) {
        console.error('Database filter options failed:', error.message);
        return {
          success: false,
          graduationYears: [],
          degrees: [],
          companies: [],
          locations: [],
          source: 'error'
        };
      }

      // Extract unique values
      const graduationYears = [...new Set(data.map(item => item.graduation_year))].sort((a, b) => b - a);
      const degrees = [...new Set(data.map(item => item.degree))].sort();
      const companies = [...new Set(data.map(item => item.current_company))].sort();
      const locations = [...new Set(data.map(item => item.location))].sort();

      return {
        success: true,
        graduationYears,
        degrees,
        companies,
        locations,
        source: 'database'
      };

    } catch (error) {
      console.error('Filter options error:', error?.message || 'Unknown error');
      return {
        success: false,
        graduationYears: [],
        degrees: [],
        companies: [],
        locations: [],
        source: 'error'
      };
    }
  }

  /**
   * Get alumni statistics
   */
  static async getAlumniStats() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('graduation_year, degree, current_company, location');

      if (error) {
        throw error;
      }

      const totalAlumni = data.length;
      const graduationYears = [...new Set(data.map(item => item.graduation_year))];
      const degrees = [...new Set(data.map(item => item.degree))];
      const companies = [...new Set(data.map(item => item.current_company))];
      const locations = [...new Set(data.map(item => item.location))];

      // Most common graduation year
      const yearCounts = data.reduce((acc, item) => {
        acc[item.graduation_year] = (acc[item.graduation_year] || 0) + 1;
        return acc;
      }, {});
      const mostCommonYear = Object.keys(yearCounts).reduce((a, b) => 
        yearCounts[a] > yearCounts[b] ? a : b
      );

      // Most common company
      const companyCounts = data.reduce((acc, item) => {
        acc[item.current_company] = (acc[item.current_company] || 0) + 1;
        return acc;
      }, {});
      const mostCommonCompany = Object.keys(companyCounts).reduce((a, b) => 
        companyCounts[a] > companyCounts[b] ? a : b
      );

      return {
        success: true,
        stats: {
          totalAlumni,
          uniqueGraduationYears: graduationYears.length,
          uniqueDegrees: degrees.length,
          uniqueCompanies: companies.length,
          uniqueLocations: locations.length,
          mostCommonYear,
          mostCommonCompany
        }
      };

    } catch (error) {
      console.error('Error fetching alumni stats:', error);
      return {
        success: false,
        error: error.message,
        stats: {}
      };
    }
  }

  /**
   * Search alumni by skills
   */
  static async searchBySkills(skills = []) {
    try {
      if (!skills.length) {
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          current_title,
          current_company,
          graduation_year,
          degree,
          avatar_url,
          skills
        `)
        .contains('skills', skills);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || []
      };

    } catch (error) {
      console.error('Error searching by skills:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}
