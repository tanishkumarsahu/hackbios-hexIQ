'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, Users, Trash2, ExternalLink, AlertCircle, RefreshCw, Loader2, Plus, Edit, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { CardSkeleton } from '../ui/Skeleton';
import { NoSearchResults, NoDataYet } from '../ui/EmptyState';

export default function EventManagement() {
  const { organization } = useAdmin();
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, eventId: null, eventTitle: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const loadingRef = useRef(false);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    loadEvents();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filter, statusFilter, organization]);

  const loadEvents = useCallback(async () => {
    if (loadingRef.current) {
      console.log('Already loading events, skipping...');
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
      console.log('Loading events for organization:', organization?.id);

      if (!organization?.id) {
        console.warn('No organization ID available');
        setEvents([]);
        setLoading(false);
        loadingRef.current = false;
        return;
      }

      let query = supabase
        .from('events')
        .select('*, created_by:users!events_created_by_fkey(name, email)')
        .eq('organization_id', organization.id)
        .order('start_date', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('event_type', filter);
      }

      if (statusFilter === 'upcoming') {
        query = query.gte('start_date', new Date().toISOString());
      } else if (statusFilter === 'past') {
        query = query.lt('start_date', new Date().toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching events:', fetchError);
        throw new Error(fetchError.message || 'Failed to load events');
      }

      console.log(`✅ Loaded ${data?.length || 0} events`);
      setEvents(data || []);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
      console.error('Error loading events:', err);
      setError(err.message || 'Failed to load events');
      toast.error('Failed to load events', {
        description: err.message || 'Please try again'
      });
      setEvents([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [organization, filter, statusFilter]);

  const openDeleteDialog = (eventId, eventTitle) => {
    if (!eventId) {
      toast.error('Invalid event ID');
      return;
    }
    setConfirmDialog({ isOpen: true, eventId, eventTitle });
  };

  const handleDelete = async () => {
    const { eventId } = confirmDialog;
    setActionLoading(eventId);

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;

      toast.success('Event deleted successfully');
      await loadEvents();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event', {
        description: err.message || 'Please try again'
      });
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, eventId: null, eventTitle: '' });
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
  };

  const handleUpdate = async (updatedData) => {
    if (!editingEvent?.id) return;

    setActionLoading(editingEvent.id);

    try {
      const { error } = await supabase
        .from('events')
        .update(updatedData)
        .eq('id', editingEvent.id);

      if (error) throw error;

      toast.success('Event updated successfully');
      setEditingEvent(null);
      await loadEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      toast.error('Failed to update event', {
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
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <button
            onClick={loadEvents}
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
              <p className="text-sm font-medium text-red-800">Error Loading Events</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={loadEvents}
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
              <option value="all">All Types</option>
              <option value="workshop">Workshops</option>
              <option value="seminar">Seminars</option>
              <option value="networking">Networking</option>
              <option value="reunion">Reunions</option>
              <option value="conference">Conferences</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>

            <div className="text-sm text-gray-600 flex items-center justify-end">
              <span className="font-medium">{events.length}</span>
              <span className="ml-1">event{events.length !== 1 ? 's' : ''}</span>
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
      ) : events.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12">
          {filter !== 'all' || statusFilter !== 'all' ? (
            <NoSearchResults 
              onClear={() => {
                setFilter('all');
                setStatusFilter('all');
              }}
            />
          ) : (
            <NoDataYet
              icon={Calendar}
              title="No events yet"
              description="Create your first event to bring your alumni community together. Host workshops, reunions, networking sessions, and more."
              actionLabel="Refresh"
              onAction={loadEvents}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isUpcoming = new Date(event.start_date) > new Date();
            const isPast = new Date(event.start_date) < new Date();
            
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all p-5 relative">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isUpcoming ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-50 text-green-700 flex items-center gap-1 border border-green-200">
                      <CheckCircle className="h-3 w-3" />
                      Upcoming
                    </span>
                  ) : isPast ? (
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-50 text-gray-600 border border-gray-200">
                      Past
                    </span>
                  ) : null}
                </div>

                <div className="mb-4 pr-24">
                  <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1">{event.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{event.description || 'Alumni startups pitch their ideas to investors. Great networking...'}</p>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{new Date(event.start_date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{event.is_virtual ? 'Virtual Event' : event.location?.city || 'Location TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm">{event.max_attendees ? `Max ${event.max_attendees} attendees` : 'Unlimited'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                      event.is_public ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {event.is_public ? 'Public' : 'Private'}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize ${
                      event.event_type === 'workshop' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      event.event_type === 'seminar' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                      event.event_type === 'networking' ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                      event.event_type === 'conference' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-gray-50 text-gray-600 border border-gray-200'
                    }`}>
                      {event.event_type || 'Event'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEdit(event)}
                      disabled={actionLoading === event.id}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Edit event"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(event.id, event.title)}
                      disabled={actionLoading === event.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Delete event"
                    >
                      {actionLoading === event.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {event.created_by && (
                  <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                    Created by {event.created_by.name || event.created_by.email}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, eventId: null, eventTitle: '' })}
        onConfirm={handleDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${confirmDialog.eventTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        icon={Trash2}
      />

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdate={handleUpdate}
          isLoading={actionLoading === editingEvent.id}
        />
      )}
    </div>
  );
}

// Edit Event Modal Component
function EditEventModal({ event, onClose, onUpdate, isLoading }) {
  const [formData, setFormData] = useState({
    title: event.title || '',
    description: event.description || '',
    event_type: event.event_type || 'workshop',
    start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
    end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
    is_virtual: event.is_virtual || false,
    is_public: event.is_public !== false,
    max_attendees: event.max_attendees || '',
    location: {
      city: event.location?.city || '',
      address: event.location?.address || ''
    }
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
          <h3 className="text-xl font-semibold text-gray-900">Edit Event</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
              <select
                required
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="networking">Networking</option>
                <option value="reunion">Reunion</option>
                <option value="conference">Conference</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees</label>
              <input
                type="number"
                min="0"
                value={formData.max_attendees}
                onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? parseInt(e.target.value) : '' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_virtual}
                onChange={(e) => setFormData({ ...formData, is_virtual: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Virtual Event</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Public Event</span>
            </label>
          </div>

          {!formData.is_virtual && (
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

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
                'Update Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
