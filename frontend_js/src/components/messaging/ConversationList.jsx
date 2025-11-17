import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';

export default function ConversationList({ conversations, selectedId, onSelect, loading }) {
  // Keyboard navigation for conversations
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!conversations.length) return;
      
      const currentIndex = conversations.findIndex(c => c.id === selectedId);
      
      // Arrow Up - Previous conversation
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        onSelect(conversations[currentIndex - 1]);
      }
      // Arrow Down - Next conversation
      if (e.key === 'ArrowDown' && currentIndex < conversations.length - 1) {
        e.preventDefault();
        onSelect(conversations[currentIndex + 1]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, selectedId, onSelect]);
  const formatTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
        </div>
        <p className="text-gray-900 font-semibold text-lg mb-2">No conversations yet</p>
        <p className="text-sm text-gray-500 max-w-xs">
          Start a conversation from the Alumni Directory by clicking the Message button
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherUser = conversation.otherUser;
        const isSelected = conversation.id === selectedId;
        const hasUnread = conversation.unreadCount > 0;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`w-full p-3 sm:p-4 hover:bg-gray-50 transition-all duration-200 text-left border-l-4 ${
              isSelected 
                ? 'bg-blue-50 hover:bg-blue-50 border-blue-600' 
                : 'border-transparent hover:border-gray-200'
            }`}
          >
            <div className="flex gap-3 items-start">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white overflow-hidden">
                  {otherUser?.avatar_url && (
                    <img
                      src={otherUser.avatar_url}
                      alt={otherUser.name}
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="text-sm sm:text-base">
                    {otherUser?.name?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                {hasUnread && (
                  <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-0.5">
                  <h3 className={`text-sm sm:text-base font-semibold text-gray-900 truncate ${hasUnread ? 'font-bold' : 'font-medium'}`}>
                    {otherUser?.name || 'Unknown User'}
                  </h3>
                  {conversation.lastMessage && (
                    <span className="text-[10px] sm:text-xs text-gray-500 flex-shrink-0 ml-2">
                      {formatTime(conversation.lastMessage.created_at)}
                    </span>
                  )}
                </div>

                {otherUser?.current_title && (
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">
                    {otherUser.current_title}
                    {otherUser.current_company && ` • ${otherUser.current_company}`}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  {conversation.lastMessage ? (
                    <p className={`text-xs sm:text-sm truncate flex-1 ${hasUnread ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {conversation.lastMessage.content}
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 italic flex-1">No messages yet</p>
                  )}

                  {hasUnread && (
                    <span className="bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
