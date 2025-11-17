'use client';

import { useState, useEffect } from 'react';
import { Briefcase, MapPin, Clock, ExternalLink, DollarSign, Award, Calendar, CheckCircle, Bookmark } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import ApplyModal from './ApplyModal';
import jobApplicationService from '../../lib/jobApplicationService';
import jobBookmarkService from '../../lib/jobBookmarkService';
import { toast } from 'sonner';

/**
 * JobCard Component - Fully responsive job card
 * Mobile: < 640px - Compact, stacked layout
 * Tablet: 640px+ - Two-column grid
 * Desktop: 1024px+ - Three-column grid
 */
export default function JobCard({ job }) {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const {
    id,
    title,
    description,
    company,
    location,
    jobType,
    experienceLevel,
    salaryFormatted,
    skills,
    deadlineFormatted,
    daysRemaining,
    externalLink,
    postedBy,
    daysAgo
  } = job;

  // Check if user has applied and bookmarked
  useEffect(() => {
    const checkStatus = async () => {
      if (user?.id && id) {
        // Check application status
        const appResult = await jobApplicationService.hasApplied(id, user.id);
        setHasApplied(appResult.hasApplied);
        
        // Check bookmark status
        const bookmarkResult = await jobBookmarkService.isBookmarked(id, user.id);
        setIsBookmarked(bookmarkResult.isBookmarked);
        
        setCheckingStatus(false);
      } else {
        setCheckingStatus(false);
      }
    };
    checkStatus();
  }, [id, user?.id]);

  // Handle bookmark toggle
  const handleBookmarkToggle = async () => {
    if (!user?.id) {
      toast.error('Please login to bookmark jobs');
      return;
    }

    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        const result = await jobBookmarkService.removeBookmark(id, user.id);
        if (result.success) {
          setIsBookmarked(false);
          toast.success('Bookmark removed');
        } else {
          toast.error('Failed to remove bookmark');
        }
      } else {
        const result = await jobBookmarkService.bookmarkJob(id, user.id);
        if (result.success) {
          setIsBookmarked(true);
          toast.success('Job bookmarked!');
        } else {
          toast.error('Failed to bookmark job');
        }
      }
    } catch (error) {
      console.error('Bookmark error:', error);
      toast.error('Something went wrong');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Job type colors
  const typeColors = {
    'Full-time': 'bg-blue-50 text-blue-700 border-blue-200',
    'Part-time': 'bg-green-50 text-green-700 border-green-200',
    'Contract': 'bg-purple-50 text-purple-700 border-purple-200',
    'Internship': 'bg-orange-50 text-orange-700 border-orange-200'
  };

  // Experience level colors
  const experienceColors = {
    'Entry': 'bg-gray-50 text-gray-700 border-gray-200',
    'Mid-level': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Senior': 'bg-pink-50 text-pink-700 border-pink-200',
    'Lead': 'bg-red-50 text-red-700 border-red-200'
  };

  const typeColor = typeColors[jobType] || 'bg-gray-50 text-gray-700 border-gray-200';
  const expColor = experienceColors[experienceLevel] || 'bg-gray-50 text-gray-700 border-gray-200';

  // Deadline urgency color
  const getDeadlineColor = () => {
    if (!daysRemaining) return 'text-gray-500';
    if (daysRemaining <= 7) return 'text-red-600';
    if (daysRemaining <= 14) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg border border-blue-200/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group h-full flex flex-col bg-gradient-to-br from-blue-50/30 via-white to-white">
      {/* Card Header */}
      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col bg-gradient-to-r from-blue-50/20 to-transparent">
        {/* Badges Row with Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2 flex-1">
          <Badge 
            variant="outline" 
            className={`${typeColor} text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm`}
          >
            {jobType}
          </Badge>
          {experienceLevel && (
            <Badge 
              variant="outline" 
              className={`${expColor} text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm`}
            >
              {experienceLevel}
            </Badge>
          )}
          {daysAgo <= 7 && (
            <Badge 
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200 text-xs sm:text-sm px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm"
            >
              New
            </Badge>
          )}
          </div>
          
          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            disabled={bookmarkLoading}
            className={`p-2 rounded-lg transition-all ${
              isBookmarked 
                ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark job'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Company & Title */}
        <div className="mb-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg ring-2 ring-blue-100 group-hover:ring-blue-200 transition-all">
              {company[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                {title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 font-medium mt-0.5">
                {company}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Job Details */}
        <div className="space-y-2 sm:space-y-2.5 mb-4 flex-shrink-0">
          {/* Location */}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-700 truncate flex-1">
                {location}
              </p>
            </div>
          )}

          {/* Salary */}
          {salaryFormatted && (
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                {salaryFormatted}
              </p>
            </div>
          )}

          {/* Deadline */}
          {deadlineFormatted && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400 flex-shrink-0" />
              <p className={`text-xs sm:text-sm font-medium ${getDeadlineColor()}`}>
                Closes on {deadlineFormatted}
                {daysRemaining !== null && daysRemaining > 0 && (
                  <span className="ml-1">({daysRemaining} days left)</span>
                )}
                {daysRemaining !== null && daysRemaining <= 0 && (
                  <span className="ml-1 text-red-600">(Expired)</span>
                )}
              </p>
            </div>
          )}

          {/* Posted */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gray-400 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-500">
              Posted {daysAgo === 0 ? 'today' : `${daysAgo} ${daysAgo === 1 ? 'day' : 'days'} ago`}
            </p>
          </div>
        </div>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="mb-4 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-medium shadow-sm"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium shadow-sm">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* Posted By */}
        {postedBy && (
          <div className="flex items-center gap-2 pb-4 mb-4 border-t border-blue-100 pt-4 flex-shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md ring-2 ring-blue-100">
              {postedBy.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Posted by</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {postedBy.name}
                {postedBy.current_company && (
                  <span className="text-gray-500 font-normal"> • {postedBy.current_company}</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className={`w-full h-9 sm:h-10 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex-shrink-0 mt-auto ${
            hasApplied 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
          }`}
          onClick={() => {
            if (hasApplied) return;
            if (externalLink) {
              window.open(externalLink, '_blank', 'noopener,noreferrer');
            } else {
              setShowApplyModal(true);
            }
          }}
          disabled={checkingStatus || hasApplied || (daysRemaining !== null && daysRemaining <= 0)}
        >
          {checkingStatus ? (
            'Loading...'
          ) : hasApplied ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              Applied
            </>
          ) : daysRemaining !== null && daysRemaining <= 0 ? (
            'Application Closed'
          ) : externalLink ? (
            <>
              Apply Now
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5" />
            </>
          ) : (
            'Apply Now'
          )}
        </Button>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          job={job}
          userId={user?.id}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => setHasApplied(true)}
        />
      )}
    </div>
  );
}
