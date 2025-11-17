'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import { AuthGuard } from '../../components/auth/AuthGuard';
import { Navigation } from '../../components/layout/Navigation';
import ChatWindow from '../../components/messaging/ChatWindow';
import ConversationList from '../../components/messaging/ConversationList';
import messagingService from '../../lib/messagingService';
import { MessageSquare } from 'lucide-react';

function MessagesContent() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadConversations();
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
            {/* Conversations List */}
            <div className={`w-full lg:w-96 xl:w-[400px] bg-white border-r border-gray-200 overflow-y-auto ${showChat ? 'hidden lg:block' : 'block'}`}>
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation?.id}
                onSelect={handleSelectConversation}
                loading={loading}
              />
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
