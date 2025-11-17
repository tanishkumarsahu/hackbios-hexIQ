// Jobs Service - Handles all job-related API calls
import { supabase } from './supabase';

class JobsService {
  /**
   * Get all jobs with optional filters
   * @param {Object} options - Filter options
   * @returns {Promise<Array>} Array of jobs
   */
  async getAllJobs(options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        jobType = null,
        experienceLevel = null,
        location = null,
        salaryMin = null,
        salaryMax = null,
        skills = null,
        search = null,
        activeOnly = true
      } = options;

      let query = supabase
        .from('jobs')
        .select(`
          *,
          posted_by_user:users!jobs_posted_by_fkey(
            id,
            name,
            avatar_url,
            current_title,
            current_company
          )
        `)
        .order('created_at', { ascending: false });

      // Filter by active jobs only
      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      // Filter by job type
      if (jobType) {
        query = query.eq('job_type', jobType);
      }

      // Filter by experience level
      if (experienceLevel) {
        query = query.eq('experience_level', experienceLevel);
      }

      // Filter by location (city)
      if (location) {
        query = query.contains('location', { city: location });
      }

      // Filter by salary range
      if (salaryMin !== null) {
        query = query.gte('salary_range->min', salaryMin);
      }
      if (salaryMax !== null) {
        query = query.lte('salary_range->max', salaryMax);
      }

      // Filter by skills
      if (skills && skills.length > 0) {
        query = query.overlaps('skills_required', skills);
      }

      // Search in title, description, company
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`);
      }

      // Pagination
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (error) throw error;

      // Format the data
      return data.map(job => this.formatJob(job));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }

  /**
   * Get job by ID
   * @param {string} id - Job ID
   * @returns {Promise<Object>} Job details
   */
  async getJobById(id) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          posted_by_user:users!jobs_posted_by_fkey(
            id,
            name,
            avatar_url,
            current_title,
            current_company,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return this.formatJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }

  /**
   * Format job data
   * @param {Object} job - Raw job data
   * @returns {Object} Formatted job
   */
  formatJob(job) {
    // Parse location
    let locationText = '';
    if (job.location) {
      const loc = job.location;
      const parts = [loc.city, loc.state, loc.country].filter(Boolean);
      locationText = parts.join(', ');
    }

    // Parse and format salary
    let salaryFormatted = '';
    let salaryMin = null;
    let salaryMax = null;
    let salaryCurrency = 'INR';

    if (job.salary_range) {
      const salary = job.salary_range;
      salaryMin = salary.min;
      salaryMax = salary.max;
      salaryCurrency = salary.currency || 'INR';

      // Format in lakhs for INR
      if (salaryCurrency === 'INR') {
        const minLakhs = (salaryMin / 100000).toFixed(0);
        const maxLakhs = (salaryMax / 100000).toFixed(0);
        salaryFormatted = `₹${minLakhs}L - ₹${maxLakhs}L per annum`;
      } else {
        salaryFormatted = `${salaryCurrency} ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
      }
    }

    // Format deadline
    let deadlineFormatted = '';
    let daysRemaining = null;

    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const now = new Date();
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      daysRemaining = diffDays;

      deadlineFormatted = deadline.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }

    // Format posted date
    const postedDate = new Date(job.created_at);
    const postedFormatted = postedDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    // Calculate days ago
    const now = new Date();
    const diffTime = now - postedDate;
    const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return {
      id: job.id,
      title: job.title,
      description: job.description,
      company: job.company,
      location: locationText,
      locationData: job.location,
      jobType: job.job_type,
      experienceLevel: job.experience_level,
      salaryFormatted,
      salaryMin,
      salaryMax,
      salaryCurrency,
      skills: job.skills_required || [],
      deadline: job.application_deadline,
      deadlineFormatted,
      daysRemaining,
      externalLink: job.external_link,
      isActive: job.is_active,
      postedBy: job.posted_by_user || job.posted_by,
      postedDate: job.created_at,
      postedFormatted,
      daysAgo,
      createdAt: job.created_at,
      updatedAt: job.updated_at
    };
  }

  /**
   * Get job types for filtering
   * @returns {Array<string>} Job types
   */
  getJobTypes() {
    return ['Full-time', 'Part-time', 'Contract', 'Internship'];
  }

  /**
   * Get experience levels for filtering
   * @returns {Array<string>} Experience levels
   */
  getExperienceLevels() {
    return ['Entry', 'Mid-level', 'Senior', 'Lead'];
  }

  /**
   * Get unique locations from jobs
   * @returns {Promise<Array<string>>} Locations
   */
  async getLocations() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('location')
        .eq('is_active', true);

      if (error) throw error;

      // Extract unique cities
      const cities = new Set();
      data.forEach(job => {
        if (job.location && job.location.city) {
          cities.add(job.location.city);
        }
      });

      return Array.from(cities).sort();
    } catch (error) {
      console.error('Error fetching locations:', error);
      return ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Chennai'];
    }
  }

  /**
   * Get unique skills from jobs
   * @returns {Promise<Array<string>>} Skills
   */
  async getSkills() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('skills_required')
        .eq('is_active', true);

      if (error) throw error;

      // Extract unique skills
      const skills = new Set();
      data.forEach(job => {
        if (job.skills_required) {
          job.skills_required.forEach(skill => skills.add(skill));
        }
      });

      return Array.from(skills).sort();
    } catch (error) {
      console.error('Error fetching skills:', error);
      return [];
    }
  }
}

export default new JobsService();
