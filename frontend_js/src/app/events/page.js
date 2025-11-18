'use client';

import React, { useState, useEffect } from 'react';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import EventCard from '../../components/events/EventCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { 
  Calendar,
  CalendarDays, 
  Search, 
  Filter, 
  Video, 
  MapPin, 
  X,
  Briefcase, 
  Clock, 
  Building2, 
  DollarSign
} from 'lucide-react';
import Image from 'next/image';
import eventsService from '../../lib/eventsService';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { toast } from 'sonner';

function EventsContent() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null); // 'virtual' | 'in-person' | null
  const [showFilters, setShowFilters] = useState(false);
  const [registeredEvents, setRegisteredEvents] = useState(new Set());

  const eventTypes = eventsService.getEventTypes();

  // Load events
  useEffect(() => {
    loadEvents();
  }, [selectedType, selectedFormat]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = {
        eventType: selectedType,
        isVirtual: selectedFormat === 'virtual' ? true : selectedFormat === 'in-person' ? false : null,
        upcoming: true
      };

      const data = await eventsService.getAllEvents(options);
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter events by search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query)
    );
  });

  // Derive Featured and Happening Soon sections purely on frontend rules
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const parseEventDate = (event) => {
    try {
      return new Date(event.startDate || event.start_date || event.startDateFormatted);
    } catch {
      return null;
    }
  };

  const withDates = filteredEvents.map(e => ({
    ...e,
    _start: parseEventDate(e)
  })).filter(e => e._start instanceof Date && !isNaN(e._start));

  // Featured: upcoming in next 7 days, sorted by start date
  const featuredEvents = withDates
    .filter(e => e._start >= now && e._start <= sevenDaysFromNow)
    .sort((a, b) => a._start - b._start);

  // Happening Soon: next 3 days excluding already featured
  const featuredIds = new Set(featuredEvents.map(e => e.id));
  const happeningSoonEvents = withDates
    .filter(e => !featuredIds.has(e.id) && e._start >= now && e._start <= threeDaysFromNow)
    .sort((a, b) => a._start - b._start)
    .slice(0, 6);

  // Remaining events for main grid
  const otherEvents = filteredEvents.filter(e => !featuredIds.has(e.id) && !happeningSoonEvents.some(h => h.id === e.id));

  // Handle registration
  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }
    
    try {
      await eventsService.registerForEvent(eventId, user.id);
      setRegisteredEvents(prev => new Set([...prev, eventId]));
      toast.success('Successfully registered for event!');
      // Reload to update attendee count
      loadEvents();
    } catch (err) {
      console.error('Error registering:', err);
      toast.error('Failed to register. Please try again.');
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedType(null);
    setSelectedFormat(null);
    setSearchQuery('');
  };

  const activeFiltersCount = [selectedType, selectedFormat, searchQuery].filter(Boolean).length;

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
                    <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
                    <span>Events</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-700 mt-1">
                    {loading
                      ? 'Loading...'
                      : `${filteredEvents.length} upcoming events • ${featuredEvents.length || 0} featured`}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 text-xs hover:bg-blue-50 hover:border-blue-300 transition-all shadow-sm flex-shrink-0 w-full sm:w-auto"
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

          {/* Search Bar */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events..."
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

          {/* Collapsible Filters */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pb-3 pt-2 border-t border-gray-100 mt-3">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Event Type Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-600 mr-1">Type:</span>
                    <Button
                      variant={selectedType === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedType(null)}
                      className={`h-7 text-xs px-2.5 ${selectedType === null ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      All
                    </Button>
                    {eventTypes.slice(0, 4).map(type => (
                      <Button
                        key={type}
                        variant={selectedType === type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedType(type)}
                        className={`h-7 text-xs px-2.5 ${selectedType === type ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>

                  <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

                  {/* Format Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-medium text-gray-600 mr-1">Format:</span>
                    <Button
                      variant={selectedFormat === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFormat(null)}
                      className={`h-7 text-xs px-2.5 ${selectedFormat === null ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      All
                    </Button>
                    <Button
                      variant={selectedFormat === 'virtual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFormat('virtual')}
                      className={`h-7 text-xs px-2.5 ${selectedFormat === 'virtual' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      <Video className="w-3 h-3 mr-1" />
                      Virtual
                    </Button>
                    <Button
                      variant={selectedFormat === 'in-person' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFormat('in-person')}
                      className={`h-7 text-xs px-2.5 ${selectedFormat === 'in-person' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'hover:bg-blue-50'}`}
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      In-Person
                    </Button>
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

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-3">
              <div className="w-12 h-12 relative animate-pulse">
                <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
              </div>
              <p className="text-sm text-gray-600 font-medium">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 sm:py-20">
              <p className="text-red-600 text-sm sm:text-base">{error}</p>
              <Button onClick={loadEvents} className="mt-4 h-9 sm:h-10 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200">
                Try Again
              </Button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <Calendar className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {searchQuery || selectedType || selectedFormat
                  ? 'Try adjusting your filters'
                  : 'Check back soon for upcoming events'}
              </p>
              {activeFiltersCount > 0 && (
                <Button onClick={clearFilters} variant="outline" className="h-9 sm:h-10 text-sm hover:bg-blue-50 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-10">
              {/* Featured Spotlight: Hero + horizontal scroll carousel */}
              {featuredEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100">★</span>
                      Featured spotlight
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">Highlighted events for this week</p>
                  </div>

                  {/* Hero featured event */}
                  <div
                    data-aos="zoom-out"
                    data-aos-delay="0"
                    className="relative mb-4 sm:mb-5 lg:mb-6 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50/70 via-white to-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500" />
                    <div className="absolute top-3 right-4 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-[10px] font-medium text-orange-700 border border-orange-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span>Spotlight</span>
                    </div>
                    <EventCard
                      event={featuredEvents[0]}
                      variant="featured"
                    />
                  </div>

                  {/* Horizontal scroll for remaining featured */}
                  {featuredEvents.length > 1 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-medium text-gray-800">More featured events</p>
                        <p className="text-[11px] text-gray-500 hidden sm:block">Swipe to explore</p>
                      </div>
                      <div className="overflow-x-auto -mx-1 sm:-mx-2 pb-1 scrollbar-hide">
                        <div className="flex gap-3 sm:gap-4 px-1 sm:px-2">
                          {featuredEvents.slice(1).map((event, index) => (
                            <div
                              key={event.id}
                              data-aos="zoom-out"
                              data-aos-delay={(index + 1) * 40}
                              className="min-w-[260px] max-w-[280px] sm:min-w-[280px] sm:max-w-[300px] flex-shrink-0 rounded-2xl border border-orange-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                            >
                              <EventCard
                                event={event}
                                variant="featured"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Happening Soon */}
              {happeningSoonEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      Happening soon
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">Within the next 3 days</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {happeningSoonEvents.map((event, index) => (
                      <div
                        key={event.id}
                        data-aos="zoom-out"
                        data-aos-delay={index < 6 ? index * 30 : 40}
                        className="relative rounded-2xl border border-orange-100 bg-orange-50/40 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/80 border border-orange-100 text-[10px] font-medium text-orange-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                          <span>Soon</span>
                        </div>
                        <EventCard
                          event={event}
                          onRegister={handleRegister}
                          isRegistered={registeredEvents.has(event.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* All Events */}
              {otherEvents.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-700" />
                      All upcoming events
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">Based on your filters and search</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                    {otherEvents.map((event, index) => (
                      <div
                        key={event.id}
                        data-aos="zoom-out"
                        data-aos-delay={index < 9 ? index * 20 : 40}
                      >
                        <EventCard
                          event={event}
                          onRegister={handleRegister}
                          isRegistered={registeredEvents.has(event.id)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
      </div>
    </Navigation>
  );
}

export default function EventsPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <EventsContent />
    </AuthGuard>
  );
}
