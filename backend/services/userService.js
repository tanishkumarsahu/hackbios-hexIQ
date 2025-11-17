const { supabaseAdmin } = require('../config/database');
const { NotFoundError, ConflictError } = require('../middleware/errorHandler');

class UserService {
  // Get all users with pagination and filters
  static async getAllUsers(options = {}) {
    const {
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
      search,
      graduation_year,
      location,
      skills
    } = options;

    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('users')
      .select(`
        id, email, name, bio, graduation_year, degree, major,
        current_title, current_company, location, skills, interests,
        profile_pic, is_verified, created_at
      `)
      .eq('is_active', true);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%,current_company.ilike.%${search}%`);
    }
    
    if (graduation_year) {
      query = query.eq('graduation_year', graduation_year);
    }
    
    if (location) {
      query = query.ilike('location->city', `%${location}%`);
    }
    
    if (skills && skills.length > 0) {
      query = query.overlaps('skills', skills);
    }

    // Apply sorting and pagination
    query = query
      .order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return {
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  // Get user by ID
  static async getUserById(userId) {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, email, name, bio, phone, graduation_year, degree, major,
        current_title, current_company, location, social_links,
        skills, interests, profile_pic, is_verified, privacy_settings,
        created_at, updated_at
      `)
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // Update user profile
  static async updateUser(userId, updates) {
    // Remove fields that shouldn't be updated directly
    const { id, email, password, created_at, ...allowedUpdates } = updates;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select(`
        id, email, name, bio, phone, graduation_year, degree, major,
        current_title, current_company, location, social_links,
        skills, interests, profile_pic, is_verified, privacy_settings,
        created_at, updated_at
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // Search users
  static async searchUsers(searchTerm, filters = {}) {
    const { graduation_year, location, skills } = filters;

    let query = supabaseAdmin
      .from('users')
      .select(`
        id, name, bio, graduation_year, degree, major,
        current_title, current_company, location, skills,
        profile_pic, is_verified
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,current_company.ilike.%${searchTerm}%,degree.ilike.%${searchTerm}%,major.ilike.%${searchTerm}%`);

    // Apply additional filters
    if (graduation_year) {
      query = query.eq('graduation_year', graduation_year);
    }
    
    if (location) {
      query = query.ilike('location->city', `%${location}%`);
    }
    
    if (skills && skills.length > 0) {
      query = query.overlaps('skills', skills);
    }

    query = query.limit(50); // Limit search results

    const { data: users, error } = await query;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return users || [];
  }

  // Get user statistics
  static async getUserStats() {
    const { count: totalUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: verifiedUsers, error: verifiedError } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_verified', true);

    if (usersError || verifiedError) {
      console.error('Stats Error Details:', { usersError, verifiedError });
      throw new Error(`Failed to fetch user statistics: ${usersError?.message || verifiedError?.message}`);
    }

    return {
      totalUsers: totalUsers || 0,
      verifiedUsers: verifiedUsers || 0,
      unverifiedUsers: (totalUsers || 0) - (verifiedUsers || 0)
    };
  }
}

module.exports = UserService;
