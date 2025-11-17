'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import connectionService from '../../lib/connectionService';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX,
  Mail,
  Briefcase,
  MapPin,
  Clock,
  Check,
  X as XIcon
} from 'lucide-react';
import Image from 'next/image';

function ConnectionsContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections'); // connections, pending, sent
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, id: null, title: '', message: '' });

  // Enable scroll
  useEffect(() => {
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Load data
  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading connections for user:', user.id);
      
      const [connectionsRes, pendingRes, sentRes] = await Promise.all([
        connectionService.getUserConnections(user.id),
        connectionService.getPendingRequests(user.id),
        connectionService.getSentRequests(user.id)
      ]);

      console.log('📊 Connections response:', connectionsRes);
      console.log('📊 Pending response:', pendingRes);
      console.log('📊 Sent response:', sentRes);

      setConnections(connectionsRes.data || []);
      setPendingRequests(pendingRes.data || []);
      setSentRequests(sentRes.data || []);
      
      console.log('✅ Data loaded:', {
        connections: connectionsRes.data?.length || 0,
        pending: pendingRes.data?.length || 0,
        sent: sentRes.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Error loading connections:', error);
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    const result = await connectionService.acceptRequest(connectionId);
    if (result.success) {
      toast.success('Connection accepted!');
      loadData();
    } else {
      toast.error('Failed to accept connection');
    }
  };

  const handleReject = async (connectionId) => {
    const result = await connectionService.rejectRequest(connectionId);
    if (result.success) {
      toast.success('Connection rejected');
      loadData();
    } else {
      toast.error('Failed to reject connection');
    }
  };

  const handleRemove = async (connectionId) => {
    openConfirmDialog(
      'remove',
      connectionId,
      'Remove Connection?',
      'Are you sure you want to remove this connection? You can always reconnect later.'
    );
  };
  
  const executeRemove = async (connectionId) => {
    const result = await connectionService.removeConnection(connectionId);
    if (result.success) {
      toast.success('Connection removed');
      loadData();
    } else {
      toast.error('Failed to remove connection');
    }
  };

  const handleWithdraw = async (connectionId) => {
    const result = await connectionService.withdrawRequest(connectionId);
    if (result.success) {
      // Remove from state immediately without reload
      setSentRequests(prev => prev.filter(req => req.id !== connectionId));
      toast.success('Request withdrawn');
    } else {
      toast.error('Failed to withdraw request');
    }
  };

  const openConfirmDialog = (action, id, title, message) => {
    setConfirmDialog({ isOpen: true, action, id, title, message });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ isOpen: false, action: null, id: null, title: '', message: '' });
  };

  const handleConfirmAction = () => {
    const { action, id } = confirmDialog;
    if (action === 'withdraw') {
      handleWithdraw(id);
    } else if (action === 'remove') {
      executeRemove(id);
    } else if (action === 'reject') {
      handleReject(id);
    }
  };

  const ConnectionCard = ({ connection, type }) => {
    // Determine which user to show based on type
    let person;
    if (type === 'pending') {
      person = connection?.requester;
    } else if (type === 'sent') {
      person = connection?.recipient;
    } else {
      person = connection?.user;
    }
    
    // Safety check - if no person data, show placeholder
    if (!person || !person.id) {
      return (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-lg">
                ?
              </div>
              <div>
                <h3 className="font-semibold text-gray-500">User data unavailable</h3>
                <p className="text-sm text-gray-400">This user may have been deleted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-3 sm:p-4 lg:p-5">
          <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0 shadow-md">
              {person?.avatar_url ? (
                <img 
                  src={person.avatar_url} 
                  alt={person.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                person.name?.charAt(0) || 'U'
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">{person?.name || 'Unknown'}</h3>
              {person?.current_title && (
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {person.current_title}
                  {person?.current_company && ` at ${person.current_company}`}
                </p>
              )}
              {person?.location && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{person.location}</span>
                </p>
              )}
              {type === 'pending' && connection.message && (
                <p className="text-xs sm:text-sm text-gray-700 mt-2 italic line-clamp-2">"{connection.message}"</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
              {type === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleAccept(connection.id)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Accept</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(connection.id)}
                    className="border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <XIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Reject</span>
                  </Button>
                </>
              )}
              {type === 'sent' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openConfirmDialog(
                    'withdraw',
                    connection.id,
                    'Withdraw Connection Request?',
                    'Are you sure you want to withdraw this connection request?'
                  )}
                  className="text-red-600 hover:bg-red-50 border-red-300 px-3 py-1.5 text-xs sm:text-sm"
                >
                  <UserX className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Withdraw</span>
                </Button>
              )}
              {type === 'connection' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`mailto:${person?.email}`, '_blank')}
                    className="hover:bg-blue-50 border-blue-300 text-blue-600 px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Message</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRemove(connection.connection_id)}
                    className="text-red-600 hover:bg-red-50 border-red-300 px-3 py-1.5 text-xs sm:text-sm"
                  >
                    <UserX className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Remove</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Navigation>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 relative animate-pulse mx-auto mb-4">
              <Image src="/favicon.png" alt="Loading..." fill className="object-contain" priority />
            </div>
            <p className="text-gray-600">Loading connections...</p>
          </div>
        </div>
      </Navigation>
    );
  }

  return (
    <Navigation>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600" />
            My Network
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Manage your connections and requests
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 sm:gap-2 mb-4 sm:mb-6 border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-2 sm:px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'connections'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Connections</span>
              <Badge className="bg-blue-100 text-blue-700 text-xs px-1.5 py-0.5">{connections.length}</Badge>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-2 sm:px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'pending'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Requests</span>
              {pendingRequests.length > 0 && (
                <Badge className="bg-orange-100 text-orange-700 text-xs px-1.5 py-0.5">{pendingRequests.length}</Badge>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-2 sm:px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 ${
              activeTab === 'sent'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">Sent</span>
              {sentRequests.length > 0 && (
                <Badge className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5">{sentRequests.length}</Badge>
              )}
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'connections' && (
            <>
              {connections.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <UserCheck className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No connections yet</h3>
                  <p className="text-sm sm:text-base text-gray-600">Start connecting with alumni!</p>
                </div>
              ) : (
                connections.map(conn => (
                  <ConnectionCard key={conn.connection_id} connection={conn} type="connection" />
                ))
              )}
            </>
          )}

          {activeTab === 'pending' && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-600">You're all caught up!</p>
                </div>
              ) : (
                pendingRequests.map(req => (
                  <ConnectionCard key={req.id} connection={req} type="pending" />
                ))
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {sentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No sent requests</h3>
                  <p className="text-gray-600">Send connection requests to alumni!</p>
                </div>
              ) : (
                sentRequests.map(req => (
                  <ConnectionCard key={req.id} connection={req} type="sent" />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Yes, proceed"
        cancelText="Cancel"
        confirmVariant="warning"
      />
    </Navigation>
  );
}

export default function ConnectionsPage() {
  return (
    <AuthGuard>
      <ConnectionsContent />
    </AuthGuard>
  );
}
