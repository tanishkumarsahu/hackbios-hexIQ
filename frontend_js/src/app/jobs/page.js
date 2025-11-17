'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import JobCard from '../../components/jobs/JobCard';
import PostJobModal from '../../components/jobs/PostJobModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Building2, 
  Filter, 
  Search, 
  X,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import jobsService from '../../lib/jobsService';

function JobsContent() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);

  const jobTypes = jobsService.getJobTypes();
  const experienceLevels = jobsService.getExperienceLevels();
  const locations = ['All', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Noida', 'Chennai'];

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, [selectedJobType, selectedExperienceLevel, selectedLocation]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        jobType: selectedJobType,
        experienceLevel: selectedExperienceLevel,
        location: selectedLocation === 'All' ? null : selectedLocation,
        activeOnly: true
      };

      const data = await jobsService.getAllJobs(options);
      setJobs(data);
    } catch (err) {
      console.error('Error loading jobs:', err);
      setError('Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs by search query
  const filteredJobs = jobs.filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.skills.some(skill => skill.toLowerCase().includes(query))
    );
  });

  // Clear all filters
  const clearFilters = () => {
    setSelectedJobType(null);
    setSelectedExperienceLevel(null);
    setSelectedLocation(null);
    setSearchQuery('');
  };

  const activeFiltersCount = [selectedJobType, selectedExperienceLevel, selectedLocation, searchQuery].filter(Boolean).length;

  return (
    <Navigation>
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-8 sm:h-10 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                    <span>Job Board</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    {loading ? 'Loading...' : `${filteredJobs.length} active job openings`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setShowPostJobModal(true)}
                className="h-9 text-xs bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-sm flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Post Job</span>
                <span className="sm:hidden">Post</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-9 text-xs hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm flex-shrink-0"
              >
                <Filter className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <Badge className="ml-1.5 sm:ml-2 bg-blue-600 text-white px-1.5 py-0.5 text-xs shadow-sm">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-10 h-9 sm:h-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Filters - Compact Inline Layout */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pb-3 pt-2 border-t border-gray-100 mt-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Job Type Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600 mr-1">Type:</span>
                  <Button
                    variant={selectedJobType === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedJobType(null)}
                    className={`h-7 text-xs px-2.5 ${selectedJobType === null ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                  >
                    All
                  </Button>
                  {jobTypes.map(type => (
                    <Button
                      key={type}
                      variant={selectedJobType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedJobType(type)}
                      className={`h-7 text-xs px-2.5 ${selectedJobType === type ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      {type}
                    </Button>
                  ))}
                </div>

                <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

                {/* Experience Level Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600 mr-1">Level:</span>
                  <Button
                    variant={selectedExperienceLevel === null ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedExperienceLevel(null)}
                    className={`h-7 text-xs px-2.5 ${selectedExperienceLevel === null ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                  >
                    All
                  </Button>
                  {experienceLevels.map(level => (
                    <Button
                      key={level}
                      variant={selectedExperienceLevel === level ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedExperienceLevel(level)}
                      className={`h-7 text-xs px-2.5 ${selectedExperienceLevel === level ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      {level}
                    </Button>
                  ))}
                </div>

                <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

                {/* Location Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-600 mr-1">Location:</span>
                  {locations.slice(0, 5).map(location => (
                    <Button
                      key={location}
                      variant={selectedLocation === location || (location === 'All' && !selectedLocation) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLocation(location === 'All' ? null : location)}
                      className={`h-7 text-xs px-2.5 ${(selectedLocation === location || (location === 'All' && !selectedLocation)) ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      {location === 'All' ? 'All' : location}
                    </Button>
                  ))}
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <>
                    <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
              <div className="w-12 h-12 relative animate-pulse">
                <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
              </div>
              <p className="text-sm text-gray-600 font-medium">Loading jobs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
              <Button onClick={loadJobs} className="mt-4 h-9 sm:h-10 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
                Try Again
              </Button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <Briefcase className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No jobs found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {searchQuery || selectedJobType || selectedExperienceLevel || selectedLocation
                  ? 'Try adjusting your filters'
                  : 'Check back soon for new opportunities'}
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" className="h-9 sm:h-10 text-sm hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
              {filteredJobs.map((job, index) => (
                <div
                  key={job.id}
                  data-aos="zoom-out"
                  data-aos-delay={index < 6 ? index * 30 : 50 + (index * 30)}
                >
                  <JobCard job={job} />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Post Job Modal */}
      <PostJobModal
        isOpen={showPostJobModal}
        onClose={() => setShowPostJobModal(false)}
        onSuccess={loadJobs}
      />
    </Navigation>
  );
}

export default function JobsPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <JobsContent />
    </AuthGuard>
  );
}
