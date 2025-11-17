const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const { supabaseAdmin } = require('../config/database');
const { NotFoundError, UnauthorizedError, ConflictError } = require('../middleware/errorHandler');

class AuthService {
  // Generate JWT token
  static generateToken(userId) {
    return jwt.sign({ userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  // Hash password
  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  // Compare password
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  static async register(userData) {
    const { email, password, name, graduation_year, degree, major } = userData;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const userId = uuidv4();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        password: hashedPassword,
        name,
        graduation_year,
        degree,
        major,
        is_verified: false,
        is_active: true,
        privacy_settings: {
          profile_visibility: 'public',
          show_email: false,
          show_phone: false,
          show_location: true
        },
        notification_settings: {
          email_notifications: true,
          push_notifications: true,
          message_notifications: true,
          event_notifications: true,
          job_notifications: true
        }
      })
      .select('id, email, name, graduation_year, degree, major, is_verified, created_at')
      .single();

    if (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }

    // Generate token
    const token = this.generateToken(user.id);

    return {
      user,
      token
    };
  }

  // Login user
  static async login(email, password) {
    // Get user with password
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Compare password
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Generate token
    const token = this.generateToken(user.id);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }

  // Get user profile
  static async getProfile(userId) {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, bio, phone, graduation_year, degree, major, current_title, current_company, location, social_links, skills, interests, profile_pic, is_verified, privacy_settings, notification_settings, created_at, updated_at')
      .eq('id', userId)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }
}

module.exports = AuthService;
