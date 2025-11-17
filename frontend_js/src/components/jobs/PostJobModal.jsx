'use client';

import { useState } from 'react';
import { X, Briefcase, MapPin, DollarSign, Clock, Users, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import Input from '../ui/Input';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { toast } from 'sonner';

export default function PostJobModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    job_type: 'Full-time',
    experience_level: 'Mid-level',
    location_city: '',
    location_state: '',
    location_country: 'India',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    salary_currency: 'INR',
    skills_required: '',
    application_deadline: '',
    external_link: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to post a job');
      return;
    }

    // Validation
    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare location data
      const location = {
        city: formData.location_city,
        state: formData.location_state,
        country: formData.location_country,
        is_remote: formData.is_remote
      };

      // Prepare salary range
      const salary_range = formData.salary_min || formData.salary_max ? {
        min: formData.salary_min ? parseInt(formData.salary_min) : null,
        max: formData.salary_max ? parseInt(formData.salary_max) : null,
        currency: formData.salary_currency
      } : null;

      // Prepare skills array
      const skills_required = formData.skills_required
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Insert job
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: formData.title.trim(),
          company: formData.company.trim(),
          description: formData.description.trim(),
          job_type: formData.job_type,
          experience_level: formData.experience_level,
          location,
          salary_range,
          skills_required,
          application_deadline: formData.application_deadline || null,
          external_link: formData.external_link || null,
          posted_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Job posted successfully!');
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        company: '',
        description: '',
        job_type: 'Full-time',
        experience_level: 'Mid-level',
        location_city: '',
        location_state: '',
        location_country: 'India',
        is_remote: false,
        salary_min: '',
        salary_max: '',
        salary_currency: 'INR',
        skills_required: '',
        application_deadline: '',
        external_link: ''
      });

    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Post a Job</h2>
              <p className="text-sm text-gray-600">Share opportunities with alumni</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Basic Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <Input
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google India"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Describe the role, responsibilities, and requirements..."
                  required
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Job Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                Location
              </h3>

              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  name="is_remote"
                  checked={formData.is_remote}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Remote Position
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <Input
                    name="location_city"
                    value={formData.location_city}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Input
                    name="location_state"
                    value={formData.location_state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <Input
                    name="location_country"
                    value={formData.location_country}
                    onChange={handleChange}
                    placeholder="e.g. India"
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                Salary Range (Optional)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum
                  </label>
                  <Input
                    type="number"
                    name="salary_min"
                    value={formData.salary_min}
                    onChange={handleChange}
                    placeholder="e.g. 500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum
                  </label>
                  <Input
                    type="number"
                    name="salary_max"
                    value={formData.salary_max}
                    onChange={handleChange}
                    placeholder="e.g. 1000000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    name="salary_currency"
                    value={formData.salary_currency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Skills & Additional Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Additional Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills (comma-separated)
                </label>
                <Input
                  name="skills_required"
                  value={formData.skills_required}
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, MongoDB"
                />
                <p className="text-xs text-gray-500 mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Deadline (Optional)
                </label>
                <Input
                  type="date"
                  name="application_deadline"
                  value={formData.application_deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  External Application Link (Optional)
                </label>
                <Input
                  type="url"
                  name="external_link"
                  value={formData.external_link}
                  onChange={handleChange}
                  placeholder="https://company.com/careers/job-id"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </div>
    </div>
  );
}
