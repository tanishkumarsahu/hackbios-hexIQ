'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import ChatWindow from '../../components/messaging/ChatWindow';
import ConversationList from '../../components/messaging/ConversationList';
import messagingService from '../../lib/messagingService';
import warmIntroService from '../../lib/warmIntroService';
import { MessageSquare, Sparkles, UserCircle2, Clock, Check, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';

function MessagesContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [incomingWarmIntros, setIncomingWarmIntros] = useState([]);
  const [loadingWarmIntros, setLoadingWarmIntros] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
      loadWarmIntroRequests();
    }
  }, [user?.id]);

  const loadConversations = async () => {
    setLoading(true);
    const result = await messagingService.getUserConversations(user.id);
    if (result.success) {
      setConversations(result.data);
    }
    setLoading(false);
  };

  const loadWarmIntroRequests = async () => {
    if (!user?.id) return;
    setLoadingWarmIntros(true);
    try {
      const data = await warmIntroService.getIncomingRequests(user.id);
      setIncomingWarmIntros(data || []);
    } catch (error) {
      console.error('Failed to load warm intro requests:', error);
    } finally {
      setLoadingWarmIntros(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedConversation(null);
    loadConversations(); // Refresh to update unread counts
  };

  const handleDelete = () => {
    setShowChat(false);
    setSelectedConversation(null);
    loadConversations();
  };

  const handleAcceptWarmIntro = async (request) => {
    try {
      await warmIntroService.updateStatus({ requestId: request.id, status: 'accepted' });

      // Find or create conversation with requester
      const existing = conversations.find(conv => conv.otherUser?.id === request.requester_id);
      let conversation = existing;

      if (!conversation) {
        const result = await messagingService.getOrCreateConversation(user.id, request.requester_id);
        if (result.success) {
          conversation = result.data;
          await loadConversations();
        }
      }

      if (conversation) {
        const introText = `Hi ${request.requester?.name || ''}, thanks for reaching out! I accepted your warm intro request for "${request.goal}". Let's start the conversation here.`;
        await messagingService.sendMessage(conversation.id, user.id, introText);
        setSelectedConversation(conversation);
        setShowChat(true);
      }

      await loadWarmIntroRequests();
    } catch (error) {
      console.error('Failed to accept warm intro request:', error);
    }
  };

  const handleDeclineWarmIntro = async (request) => {
    try {
      await warmIntroService.updateStatus({ requestId: request.id, status: 'declined' });
      await loadWarmIntroRequests();
    } catch (error) {
      console.error('Failed to decline warm intro request:', error);
    }
  };

  return (
    <Navigation>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header - Only show on mobile when not in chat */}
        <div className={`bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 px-4 sm:px-6 py-4 sm:py-5 ${showChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">Messages</h1>
                <p className="text-xs sm:text-sm text-blue-100">
                  {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex h-full">
            {/* Conversations List + Warm Intro Requests Panel */}
            <div className={`w-full lg:w-[420px] xl:w-[440px] bg-white border-r border-gray-200 overflow-y-auto ${showChat ? 'hidden lg:block' : 'block'}`}>
              <div className="flex flex-col h-full">
                <ConversationList
                  conversations={conversations}
                  selectedId={selectedConversation?.id}
                  onSelect={handleSelectConversation}
                  loading={loading}
                />

                {/* Warm Intro Requests Panel */}
                <div className="border-t border-gray-200 bg-gray-50/80">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-semibold text-gray-800">Warm intro requests</span>
                    </div>
                    {incomingWarmIntros.length > 0 && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">
                        {incomingWarmIntros.length} new
                      </span>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto px-3 pb-3 space-y-2">
                    {loadingWarmIntros ? (
                      <p className="text-[11px] text-gray-500">Loading requests...</p>
                    ) : incomingWarmIntros.length === 0 ? (
                      <p className="text-[11px] text-gray-500 pb-2">No warm intro requests yet.</p>
                    ) : (
                      incomingWarmIntros.map((req) => (
                        <div
                          key={req.id}
                          className="rounded-lg bg-white border border-orange-100 px-3 py-2 shadow-xs"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-shrink-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                                {req.requester?.name?.[0] || 'A'}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">
                                    {req.requester?.name || 'Unknown requester'}
                                  </p>
                                  {req.requester?.current_title && (
                                    <p className="text-[11px] text-gray-500 truncate">
                                      {req.requester.current_title}
                                      {req.requester?.current_company && ` at ${req.requester.current_company}`}
                                    </p>
                                  )}
                                </div>
                                <span className="text-[10px] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                                  <Clock className="w-3 h-3" />
                                  {new Date(req.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-700 mt-1 line-clamp-2">{req.message}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-[10px] text-gray-500 truncate">
                                  Goal: {req.goal.replace(/_/g, ' ')} • Pref: {req.preferred_time.replace(/_/g, ' ')}
                                </span>
                                <div className="flex gap-1 flex-shrink-0">
                                  <Button
                                    size="sm"
                                    className="h-6 px-2 text-[10px] bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1"
                                    onClick={() => handleAcceptWarmIntro(req)}
                                  >
                                    <Check className="w-3 h-3" />
                                    Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-[10px] border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center gap-1"
                                    onClick={() => handleDeclineWarmIntro(req)}
                                  >
                                    <X className="w-3 h-3" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${showChat ? 'flex' : 'hidden lg:flex'} flex-col`}>
              <ChatWindow
                conversation={selectedConversation}
                currentUser={user}
                onBack={handleBack}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </Navigation>
  );
}

export default function MessagesPage() {
  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <MessagesContent />
    </AuthGuard>
  );
}
