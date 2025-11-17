'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { supabase } from '../../lib/supabase';
import { Briefcase, MapPin, DollarSign, Trash2, ExternalLink, AlertCircle, RefreshCw, Loader2, CheckCircle, XCircle, Clock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CardSkeleton } from '../ui/Skeleton';
import { NoSearchResults, NoDataYet } from '../ui/EmptyState';

export default function JobManagement() {
  const { organization } = useAdmin();
  const [jobs, setJobs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, jobId: null, jobTitle: '' });
  const [editingJob, setEditingJob] = useState(null);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    loadJobs();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filter, typeFilter, organization]);

  const loadJobs = useCallback(async () => {
    if (loadingRef.current) {
      console.log('Already loading jobs, skipping...');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    loadingRef.current = true;
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      console.log('Loading jobs for organization:', organization?.id);

      if (!organization?.id) {
        console.warn('No organization ID available');
        setJobs([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      let query = supabase
        .from('jobs')
        .select('*, posted_by:users!jobs_posted_by_fkey(name, email)')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (filter === 'active') {
        query = query.eq('is_active', true);
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false);
      }

      if (typeFilter !== 'all') {
        query = query.eq('job_type', typeFilter);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching jobs:', fetchError);
        throw new Error(fetchError.message || 'Failed to load jobs');
      }

      console.log(`✅ Loaded ${data?.length || 0} jobs`);
      setJobs(data || []);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Error loading jobs:', err);
      setError(err.message || 'Failed to load jobs');
      toast.error('Failed to load jobs', {
        description: err.message || 'Please try again'
      });
      setJobs([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [organization, filter, typeFilter]);

  const openDeleteDialog = (jobId, jobTitle) => {
    if (!jobId) {
      toast.error('Invalid job ID');
      return;
    }
    setConfirmDialog({ isOpen: true, jobId, jobTitle });
  };

  const handleDelete = async () => {
    const { jobId } = confirmDialog;
    setActionLoading(jobId);

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast.success('Job deleted successfully');
      await loadJobs();
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error('Failed to delete job', {
        description: err.message || 'Please try again'
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, jobId: null, jobTitle: '' });
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
  };

  const handleUpdate = async (updatedData) => {
    if (!editingJob?.id) return;

    setActionLoading(editingJob.id);

    try {
      const { error } = await supabase
        .from('jobs')
        .update(updatedData)
        .eq('id', editingJob.id);

      if (error) throw error;

      toast.success('Job updated successfully');
      setEditingJob(null);
      await loadJobs();
    } catch (err) {
      console.error('Error updating job:', err);
      toast.error('Failed to update job', {
        description: err.message || 'Please try again'
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
          <button
            onClick={loadJobs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error Loading Jobs</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={loadJobs}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center justify-end">
              <span className="font-medium">{jobs.length}</span>
              <span className="ml-1">job{jobs.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          {filter !== 'all' || typeFilter !== 'all' ? (
            <NoSearchResults 
              onClear={() => {
                setFilter('all');
                setTypeFilter('all');
              }}
            />
          ) : (
            <NoDataYet
              icon={Briefcase}
              title="No jobs yet"
              description="Post job opportunities to help your alumni network find their next career move. Share full-time, part-time, contract, and internship positions."
              actionLabel="Refresh"
              onAction={loadJobs}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all p-5 relative">
              <div className="absolute top-4 right-4">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center gap-1 border ${
                  job.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}>
                  {job.is_active ? (
                    <><CheckCircle className="h-3 w-3" /> Active</>
                  ) : (
                    <><XCircle className="h-3 w-3" /> Inactive</>
                  )}
                </span>
              </div>

              <div className="mb-4 pr-24">
                <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{job.title}</h3>
                <p className="text-sm font-medium text-blue-600 mb-1.5">{job.company}</p>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{job.description || 'No description'}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="capitalize text-sm">{job.job_type || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">{job.location?.city || 'Remote'}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">${job.salary_range.min?.toLocaleString()} - ${job.salary_range.max?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm">Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize border ${
                    job.job_type === 'full-time' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    job.job_type === 'part-time' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    job.job_type === 'contract' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                    job.job_type === 'internship' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                    'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {job.job_type || 'Job'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(job)}
                    disabled={actionLoading === job.id}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Edit job"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(job.id, job.title)}
                    disabled={actionLoading === job.id}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Delete job"
                  >
                    {actionLoading === job.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {job.posted_by && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  Posted by {job.posted_by.name || job.posted_by.email}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, jobId: null, jobTitle: '' })}
        onConfirm={handleDelete}
        title="Delete Job"
        message={`Are you sure you want to delete "${confirmDialog.jobTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        icon={Trash2}
      />

      {/* Edit Job Modal */}
      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdate={handleUpdate}
          isLoading={actionLoading === editingJob.id}
        />
      )}
    </div>
  );
}

// Edit Job Modal Component
function EditJobModal({ job, onClose, onUpdate, isLoading }) {
  const [formData, setFormData] = useState({
    title: job.title || '',
    company: job.company || '',
    description: job.description || '',
    job_type: job.job_type || 'full-time',
    is_active: job.is_active !== false,
    salary_range: {
      min: job.salary_range?.min || '',
      max: job.salary_range?.max || ''
    },
    location: {
      city: job.location?.city || '',
      state: job.location?.state || '',
      country: job.location?.country || ''
    },
    requirements: job.requirements || [],
    application_url: job.application_url || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Edit Job</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select
                required
                value={formData.job_type}
                onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 h-full pt-8">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Active Job Posting</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
              <input
                type="number"
                min="0"
                value={formData.salary_range.min}
                onChange={(e) => setFormData({ ...formData, salary_range: { ...formData.salary_range, min: e.target.value ? parseInt(e.target.value) : '' } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
              <input
                type="number"
                min="0"
                value={formData.salary_range.max}
                onChange={(e) => setFormData({ ...formData, salary_range: { ...formData.salary_range, max: e.target.value ? parseInt(e.target.value) : '' } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 80000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.location.city}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.location.state}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.location.country}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
            <input
              type="url"
              value={formData.application_url}
              onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
              ) : (
                'Update Job'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
