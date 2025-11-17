'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Briefcase, MapPin, Clock, DollarSign, Bookmark, ExternalLink, Trash2 } from 'lucide-react';
import jobBookmarkService from '../../lib/jobBookmarkService';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function SavedJobsPage() {
  return (
    <Navigation>
      <SavedJobsContent />
    </Navigation>
  );
}

function SavedJobsContent() {
  const { user } = useAuth();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, bookmarkId: null, jobTitle: '' });

  useEffect(() => {
    if (user?.id) {
      loadSavedJobs();
    }
  }, [user?.id]);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      
      // Get user's bookmarks with job details
      const { data, error } = await supabase
        .from('job_bookmarks')
        .select(`
          id,
          created_at,
          job:jobs (
            id,
            title,
            company,
            location,
            job_type,
            experience_level,
            salary_range,
            description,
            skills_required,
            external_link,
            created_at,
            posted_by
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedJobs(data || []);
    } catch (error) {
      console.error('Error loading saved jobs:', error);
      toast.error('Failed to load saved jobs');
    } finally {
      setLoading(false);
    }
  };

  const openConfirmDialog = (bookmarkId, jobTitle) => {
    setConfirmDialog({ isOpen: true, bookmarkId, jobTitle });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, bookmarkId: null, jobTitle: '' });
  };

  const handleRemoveBookmark = async () => {
    const { bookmarkId, jobTitle } = confirmDialog;
    try {
      const { error } = await supabase
        .from('job_bookmarks')
        .delete()
        .eq('id', bookmarkId);

      if (error) throw error;

      setSavedJobs(prev => prev.filter(item => item.id !== bookmarkId));
      toast.success(`Removed "${jobTitle}" from saved jobs`);
      closeConfirmDialog();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Not specified';
    if (typeof salaryRange === 'string') return salaryRange;
    if (salaryRange.min && salaryRange.max) {
      return `₹${salaryRange.min}L - ₹${salaryRange.max}L`;
    }
    return 'Not specified';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Saved today';
    if (diffDays < 7) return `Saved ${diffDays} days ago`;
    if (diffDays < 30) return `Saved ${Math.floor(diffDays / 7)} weeks ago`;
    return `Saved on ${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Saved Jobs</h1>
          </div>
          <p className="text-gray-600">
            {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later
          </p>
        </div>

        {/* Empty State */}
        {savedJobs.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved jobs yet</h3>
              <p className="text-gray-600 mb-6">
                Start bookmarking jobs you're interested in to see them here
              </p>
              <Button onClick={() => window.location.href = '/jobs'}>
                Browse Jobs
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Saved Jobs List */}
        <div className="space-y-4">
          {savedJobs.map((item) => {
            const job = item.job;
            if (!job) return null;

            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Job Title & Company */}
                      <div className="mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {job.title}
                        </h3>
                        <p className="text-lg text-gray-700">{job.company}</p>
                      </div>

                      {/* Job Details */}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{typeof job.location === 'string' ? job.location : job.location.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{job.job_type}</span>
                        </div>
                        {job.experience_level && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{job.experience_level}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatSalary(job.salary_range)}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {job.description && (
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {job.description}
                        </p>
                      )}

                      {/* Skills */}
                      {job.skills_required && job.skills_required.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.skills_required.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills_required.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              +{job.skills_required.length - 5} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Saved Date */}
                      <p className="text-xs text-gray-500">
                        {formatDate(item.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {job.external_link && (
                        <Button
                          size="sm"
                          onClick={() => window.open(job.external_link, '_blank')}
                          className="whitespace-nowrap"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Apply
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openConfirmDialog(item.id, job.title)}
                        className="whitespace-nowrap text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleRemoveBookmark}
        title="Remove Saved Job?"
        message={`Are you sure you want to remove "${confirmDialog.jobTitle}" from your saved jobs?`}
        confirmText="Yes, remove"
        cancelText="Cancel"
        confirmVariant="danger"
      />
    </div>
  );
}
