'use client';

import { useState } from 'react';
import { X, Send, Loader2, Briefcase, MapPin, DollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { toast } from 'sonner';
import jobApplicationService from '../../lib/jobApplicationService';

export default function ApplyModal({ job, userId, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!coverLetter.trim()) {
      toast.error('Please write a cover letter');
      return;
    }

    if (coverLetter.length > 1000) {
      toast.error('Cover letter must be less than 1000 characters');
      return;
    }

    setSubmitting(true);

    const result = await jobApplicationService.applyToJob(
      job.id,
      userId,
      coverLetter
    );

    setSubmitting(false);

    if (result.success) {
      toast.success('Application submitted successfully!');
      onSuccess();
      onClose();
    } else {
      if (result.error.includes('duplicate')) {
        toast.error('You have already applied to this job');
      } else {
        toast.error('Failed to submit application');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Apply to {job.company}</h2>
            <p className="text-sm text-gray-600">{job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Job Details */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Position:</span>
              <span>{job.title}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="font-medium">Location:</span>
              <span>{job.location}</span>
            </div>
            {job.salary_range && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="font-medium">Salary:</span>
                <span>{job.salary_range}</span>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter <span className="text-red-500">*</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell us why you're a great fit for this role...

Example:
- Your relevant experience
- Why you're interested in this position
- What you can bring to the company"
              rows={10}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                {coverLetter.length} / 1000 characters
              </p>
              {coverLetter.length > 900 && (
                <p className="text-xs text-orange-600 font-medium">
                  {1000 - coverLetter.length} characters remaining
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
