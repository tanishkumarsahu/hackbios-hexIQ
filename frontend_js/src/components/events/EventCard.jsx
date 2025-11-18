'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Video, ExternalLink, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import eventRegistrationService from '../../lib/eventRegistrationService';
import { toast } from 'sonner';

/**
 * EventCard Component - Fully responsive event card
 * Mobile: < 640px - Compact, stacked layout
 * Tablet: 640px+ - Two-column grid
 * Desktop: 1024px+ - Three-column grid
 */
export default function EventCard({ event, variant = 'default' }) {
  const { user } = useAuth();
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [registrationCount, setRegistrationCount] = useState(0);

  const {
    id,
    title,
    description,
    eventType,
    startDateFormatted,
    startTimeFormatted,
    location,
    isVirtual,
    virtualLink,
    attendeeCount,
    spotsLeft,
    maxAttendees,
    createdBy
  } = event;

  const isFeaturedVariant = variant === 'featured';

  // Check registration status
  useEffect(() => {
    const checkRegistration = async () => {
      if (user?.id && id) {
        const result = await eventRegistrationService.isRegistered(id, user.id);
        setIsRegistered(result.isRegistered);
      }
      
      // Get registration count
      const countResult = await eventRegistrationService.getRegistrationCount(id);
      if (countResult.success) {
        setRegistrationCount(countResult.count);
      }
      
      setCheckingStatus(false);
    };
    checkRegistration();
  }, [id, user?.id]);

  // Handle registration
  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register');
      return;
    }

    setRegistering(true);
    const result = await eventRegistrationService.registerForEvent(id, user.id);
    setRegistering(false);

    if (result.success) {
      setIsRegistered(true);
      setRegistrationCount(prev => prev + 1);
      toast.success('Successfully registered for event!');
    } else {
      if (result.error.includes('duplicate')) {
        toast.error('You are already registered');
      } else {
        toast.error('Failed to register');
      }
    }
  };

  // Handle cancellation
  const handleCancel = async () => {
    setRegistering(true);
    const result = await eventRegistrationService.cancelRegistration(id, user.id);
    setRegistering(false);

    if (result.success) {
      setIsRegistered(false);
      setRegistrationCount(prev => Math.max(0, prev - 1));
      toast.success('Registration cancelled');
    } else {
      toast.error('Failed to cancel registration');
    }
  };

  // Event type colors
  const typeColors = {
    'Workshop': 'bg-blue-50 text-blue-700 border-blue-200',
    'Networking': 'bg-green-50 text-green-700 border-green-200',
    'Webinar': 'bg-purple-50 text-purple-700 border-purple-200',
    'Social': 'bg-orange-50 text-orange-700 border-orange-200',
    'Conference': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Seminar': 'bg-pink-50 text-pink-700 border-pink-200'
  };

  const typeColor = typeColors[eventType] || 'bg-gray-50 text-gray-700 border-gray-200';

  return (
    <div className="bg-white rounded-lg border border-blue-200/60 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group bg-gradient-to-br from-blue-50/30 via-white to-white h-full flex flex-col">
      {/* Card Header */}
      <div className="p-4 sm:p-5 lg:p-6 flex-1 flex flex-col bg-gradient-to-r from-blue-50/20 to-transparent">
        {/* Type Badge & Virtual Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <Badge 
            variant="outline" 
            className={`${typeColor} text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm`}
          >
            {eventType}
          </Badge>
          {isVirtual && (
            <Badge 
              variant="outline" 
              className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs sm:text-sm px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-sm"
            >
              <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
              Virtual
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-gray-700 mb-4 line-clamp-3">
          {description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 sm:space-y-2.5 mb-4">
          {/* Date & Time */}
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-700 font-medium">
                {startDateFormatted}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                <Clock className="w-3 h-3 inline mr-1" />
                {startTimeFormatted}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 truncate flex-1">
              {location}
            </p>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-1">
              <p className="text-xs sm:text-sm text-gray-700">
                {registrationCount} {registrationCount === 1 ? 'attendee' : 'attendees'}
              </p>
              {maxAttendees && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shadow-sm ${
                  (maxAttendees - registrationCount) > 10 
                    ? 'bg-blue-50 text-blue-700' 
                    : (maxAttendees - registrationCount) > 0 
                    ? 'bg-yellow-50 text-yellow-700' 
                    : 'bg-red-50 text-red-700'
                }`}>
                  {(maxAttendees - registrationCount) > 0 ? `${maxAttendees - registrationCount} spots left` : 'Full'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Organizer */}
        {createdBy && (
          <div className="flex items-center gap-2 pb-4 mb-4 border-t border-blue-100 pt-4 flex-shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md ring-2 ring-blue-100">
              {createdBy.name?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Organized by</p>
              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {createdBy.name}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0 mt-auto w-full">
          {checkingStatus ? (
            <Button
              variant="outline"
              className="w-full sm:flex-1 h-9 sm:h-10 text-xs sm:text-sm"
              disabled
            >
              Loading...
            </Button>
          ) : isRegistered ? (
            <div className="flex gap-2 w-full sm:flex-1">
              <Button
                variant="outline"
                className="flex-1 h-9 sm:h-10 text-xs sm:text-sm bg-green-50 border-green-300 text-green-700 shadow-sm"
                disabled
              >
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                Registered
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={registering}
                className="h-9 sm:h-10 text-xs sm:text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-700"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleRegister}
              disabled={registering || (maxAttendees && registrationCount >= maxAttendees)}
              className={`w-full sm:flex-1 h-9 sm:h-10 text-xs sm:text-sm text-white shadow-md hover:shadow-lg transition-all duration-200 ${
                isFeaturedVariant
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {registering
                ? 'Registering...'
                : (maxAttendees && registrationCount >= maxAttendees)
                  ? 'Event Full'
                  : 'Register Now'}
            </Button>
          )}
          
          {isVirtual && virtualLink && (
            <Button
              variant="outline"
              className={`w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap ${
                isFeaturedVariant
                  ? 'hover:bg-orange-50 hover:border-orange-300 text-orange-700'
                  : 'hover:bg-blue-50 hover:border-blue-300'
              }`}
              onClick={() => window.open(virtualLink, '_blank')}
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
              <span className="hidden sm:inline">Join Link</span>
              <span className="sm:hidden">Link</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
