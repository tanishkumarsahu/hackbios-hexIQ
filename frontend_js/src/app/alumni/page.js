'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { AlumniService } from '../../lib/alumniService';
import connectionService from '../../lib/connectionService';
import messagingService from '../../lib/messagingService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { NoSearchResults, NoDataYet } from '../../components/ui/EmptyState';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Mail,
  Phone,
  MessageSquare,
  UserPlus,
  Grid,
  List,
  Linkedin,
  Github,
  Globe,
  X,
  ChevronDown,
  Building2,
  Calendar
} from 'lucide-react';
import Image from 'next/image';

function AlumniDirectoryContent() {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    graduationYear: '',
    degree: '',
    company: '',
    location: ''
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'


  // Load alumni data from Supabase
  useEffect(() => {
    loadAlumni();
  }, []);

  const loadAlumni = async () => {
    try {
      setLoading(true);
      const result = await AlumniService.getAllAlumni();
      
      // AlumniService now always returns success with fallback data
      setAlumni(result.data);
      setFilteredAlumni(result.data);
      
      // Optional: Show info toast if using mock data
      if (result.source === 'mock') {
        console.info('Using demo data - database not configured yet');
      }
    } catch (error) {
      // This should rarely happen now since AlumniService handles all errors
      console.warn('Unexpected error in loadAlumni:', error);
      setAlumni([]);
      setFilteredAlumni([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter alumni based on search term and filters
  useEffect(() => {
    let filtered = alumni;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(person =>
        (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.current_company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.degree || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.current_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (person.bio || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Additional filters
    if (filters.graduationYear) {
      filtered = filtered.filter(person => person.graduation_year == filters.graduationYear);
    }
    if (filters.degree) {
      filtered = filtered.filter(person => 
        (person.degree || '').toLowerCase().includes(filters.degree.toLowerCase())
      );
    }
    if (filters.company) {
      filtered = filtered.filter(person => 
        (person.current_company || '').toLowerCase().includes(filters.company.toLowerCase())
      );
    }
    if (filters.location) {
      filtered = filtered.filter(person => 
        (person.location || '').toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredAlumni(filtered);
  }, [searchTerm, filters, alumni]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      graduationYear: '',
      degree: '',
      company: '',
      location: ''
    });
    setSearchTerm('');
  };

  const AlumniCard = ({ person, ...props }) => {
    const router = useRouter();
    const [skillsExpanded, setSkillsExpanded] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('none');
    const [connectionLoading, setConnectionLoading] = useState(false);
    
    const getInitials = () => {
      if (!person.name) return 'U';
      return person.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const handleMessage = async () => {
      if (!user?.id || !person.id) return;
      
      try {
        const result = await messagingService.getOrCreateConversation(user.id, person.id);
        if (result.success) {
          router.push('/messages');
        } else {
          toast.error('Failed to start conversation');
        }
      } catch (error) {
        console.error('Message error:', error);
        toast.error('Something went wrong');
      }
    };

    // Check connection status
    useEffect(() => {
      const checkConnection = async () => {
        if (user?.id && person.id && user.id !== person.id) {
          try {
            const result = await connectionService.getConnectionStatus(user.id, person.id);
            if (result.success) {
              setConnectionStatus(result.status);
            }
          } catch (error) {
            // Silently fail - connection feature not critical for display
            console.log('Connection check skipped:', error.message);
          }
        }
      };
      checkConnection();
    }, [person.id, user?.id]);

    // Handle connection request
    const handleConnect = async () => {
      if (!user?.id) {
        toast.error('Please login to connect');
        return;
      }

      if (user.id === person.id) {
        toast.error('Cannot connect with yourself');
        return;
      }

      setConnectionLoading(true);
      try {
        const result = await connectionService.sendRequest(person.id, user.id);
        if (result.success) {
          setConnectionStatus('pending');
          toast.success(`Connection request sent to ${person.name}`);
        } else {
          toast.error('Failed to send request');
        }
      } catch (error) {
        console.error('Connection error:', error);
        toast.error('Something went wrong');
      } finally {
        setConnectionLoading(false);
      }
    };

    // Get button text and style based on status
    const getConnectButton = () => {
      if (user?.id === person.id) return null; // Don't show for own profile

      switch (connectionStatus) {
        case 'accepted':
          return (
            <Button 
              size="sm" 
              variant="outline"
              disabled
              className="w-full border-green-400 text-green-700 bg-green-50 cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Connected</span>
            </Button>
          );
        case 'pending':
          return (
            <Button 
              size="sm" 
              variant="outline"
              disabled
              className="w-full border-orange-400 text-orange-700 bg-orange-50 cursor-not-allowed"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Pending</span>
            </Button>
          );
        default:
          return (
            <Button 
              size="sm" 
              onClick={handleConnect}
              disabled={connectionLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <UserPlus className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">{connectionLoading ? 'Connecting...' : 'Connect'}</span>
            </Button>
          );
      }
    };

    return (
      <Card className="border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col bg-white group overflow-hidden" {...props}>
        {/* Header Section */}
        <CardHeader className="flex-shrink-0 p-5 pb-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md ring-2 ring-white group-hover:ring-blue-100 transition-all">
                {person.avatar_url ? (
                  <img 
                    src={person.avatar_url} 
                    alt={person.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextElementSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`text-white font-bold text-lg ${person.avatar_url ? 'hidden' : 'flex'}`}>
                  {getInitials()}
                </span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            </div>
            
            {/* Name and Title */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight truncate font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {person.name}
              </CardTitle>
              <CardDescription className="text-sm leading-tight mt-1 line-clamp-2 text-gray-600">
                {person.current_title && person.current_company 
                  ? `${person.current_title} at ${person.current_company}`
                  : person.current_title || person.current_company || 'Alumni'
                }
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col p-5 overflow-hidden">
          <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Education/Location Info */}
            <div className="space-y-2">
              {(person.degree || person.graduation_year) && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <GraduationCap className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span className="truncate font-medium">
                    {person.degree && person.graduation_year 
                      ? `${person.degree} • Class of ${person.graduation_year}`
                      : person.degree || `Class of ${person.graduation_year}`
                    }
                  </span>
                </div>
              )}
              {person.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  <span className="truncate font-medium">{person.location}</span>
                </div>
              )}
            </div>

            {/* Bio Section */}
            {person.bio && (
              <div className="pt-1">
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                  {person.bio}
                </p>
              </div>
            )}
            
            {/* Skills Section */}
            {person.skills && person.skills.length > 0 && (
              <div className="pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {person.skills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md whitespace-nowrap font-medium border border-blue-200"
                    >
                      {skill}
                    </span>
                  ))}
                  {person.skills.length > 5 && (
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-md whitespace-nowrap font-medium border border-gray-200">
                      +{person.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons - Always at Bottom */}
          <div className="flex flex-col gap-2 pt-4 mt-auto border-t border-gray-200 flex-shrink-0 bg-gray-50/50 -mx-5 -mb-5 px-5 pb-5 rounded-b-lg">
            {user?.id !== person.id ? (
              <>
                {/* Show Message button ONLY if connected */}
                {connectionStatus === 'accepted' ? (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 hover:bg-white hover:border-blue-400 transition-all border-gray-300 bg-white"
                      onClick={() => window.location.href = `mailto:${person.email}`}
                    >
                      <Mail className="h-4 w-4 mr-1.5" />
                      <span className="text-sm font-medium">Email</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleMessage}
                      className="flex-1 hover:bg-white hover:border-blue-400 transition-all border-gray-300 bg-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      <span className="text-sm font-medium">Message</span>
                    </Button>
                  </div>
                ) : null}
                
                {/* Connect button - Show when not connected */}
                {getConnectButton()}
              </>
            ) : (
              <div className="text-center py-2 text-sm text-gray-500 font-medium bg-white rounded-md border border-gray-200">
                This is your profile
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const AlumniListItem = ({ person, ...props }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 bg-white hover:border-blue-200" {...props}>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center animate-spin-slow">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-blue-50 animate-spin-reverse">
                {person.name.charAt(0)}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
          </div>
          
          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{person.name}</h3>
            <p className="text-base text-gray-700 font-medium mb-2">
              {person.current_title} <span className="text-gray-500">at</span> {person.current_company}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                {person.degree} • {person.graduation_year}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-gray-400" />
                {person.location}
              </span>
            </div>
          </div>
          
          {/* Actions Section */}
          <div className="flex items-center gap-2 flex-shrink-0 sm:ml-auto">
            <Button 
              size="sm" 
              variant="outline" 
              className="hover:bg-blue-50 hover:border-blue-300 transition-all"
              title="Send Message"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="hover:bg-blue-50 hover:border-blue-300 transition-all"
              title="Send Email"
            >
              <Mail className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Connect</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Loading state
  if (loading) {
    return (
      <Navigation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </Navigation>
    );
  }

  // Old Loading Skeleton Component (kept for reference)
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (loading) {
    return (
      <Navigation>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
          </div>
          <LoadingSkeleton />
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      {/* Header - Following Dashboard Structure */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Alumni Directory
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Connect with {alumni.length} alumni from your network
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' : 'hover:bg-blue-50'}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-md' : 'hover:bg-blue-50'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Following Dashboard Structure */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search alumni..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Input
                placeholder="Graduation Year"
                value={filters.graduationYear}
                onChange={(e) => handleFilterChange('graduationYear', e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Degree"
                value={filters.degree}
                onChange={(e) => handleFilterChange('degree', e.target.value)}
              />
            </div>
            <div>
              <Input
                placeholder="Company"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={clearFilters} className="hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredAlumni.length} of {alumni.length} alumni
          </p>
        </div>

        {/* Alumni Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredAlumni.map((person, index) => (
              <AlumniCard 
                key={person.id} 
                person={person}
                data-aos="zoom-out"
                data-aos-delay={50 + (index * 30)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlumni.map((person, index) => (
              <AlumniListItem 
                key={person.id} 
                person={person}
                data-aos="zoom-out"
                data-aos-delay={50 + (index * 30)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {filteredAlumni.length === 0 && !loading && (
          <div>
            {searchTerm || filters.graduationYear || filters.degree || filters.company || filters.location ? (
              <NoSearchResults 
                searchTerm={searchTerm}
                onClear={clearFilters}
              />
            ) : (
              <NoDataYet
                icon={Users}
                title="No alumni yet"
                description="Be the first to join your alumni network! Connect with fellow graduates, share experiences, and build meaningful professional relationships."
                actionLabel="Refresh"
                onAction={loadAlumni}
              />
            )}
          </div>
        )}
      </div>
    </Navigation>
  );
}

export default function AlumniDirectoryPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <AlumniDirectoryContent />
    </AuthGuard>
  );
}
