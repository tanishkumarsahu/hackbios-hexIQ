import React, { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, MoreVertical, Trash2, MessageSquare, Keyboard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import messagingService from '../../lib/messagingService';
import { formatDistanceToNow } from 'date-fns';

export default function ChatWindow({ conversation, currentUser, onBack, onDelete }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const messagesEndRef = useRef(null);
  const subscriptionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
      markAsRead();
      subscribeToNewMessages();
      // Auto-focus input when conversation changes
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    return () => {
      if (subscriptionRef.current) {
        messagingService.unsubscribeFromMessages(subscriptionRef.current);
      }
    };
  }, [conversation?.id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape to close menu
      if (e.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMenu]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    const result = await messagingService.getMessages(conversation.id);
    if (result.success) {
      setMessages(result.data);
    }
    setLoading(false);
  };

  const markAsRead = async () => {
    await messagingService.markAsRead(conversation.id, currentUser.id);
  };

  const subscribeToNewMessages = () => {
    subscriptionRef.current = messagingService.subscribeToMessages(
      conversation.id,
      (message) => {
        // Merge INSERT + UPDATE events into local state
        setMessages(prev => {
          const index = prev.findIndex(m => m.id === message.id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = message;
            return updated;
          }
          return [...prev, message];
        });

        // Auto-mark as read for new incoming messages that are still unread
        if (message.sender_id !== currentUser.id && !message.is_read) {
          markAsRead();
        }
      }
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const result = await messagingService.sendMessage(
      conversation.id,
      currentUser.id,
      newMessage
    );

    if (result.success) {
      setNewMessage('');
      // Keep focus on input after sending
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    setSending(false);
  };

  // Handle Enter key to send (Shift+Enter for new line)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      const result = await messagingService.deleteConversation(conversation.id, currentUser.id);
      if (result.success) {
        onDelete();
      }
    }
    setShowMenu(false);
  };

  const formatMessageTime = (timestamp) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mb-4">
          <MessageSquare className="h-10 w-10 text-blue-600" />
        </div>
        <p className="text-gray-900 font-semibold text-lg mb-2">Select a conversation</p>
        <p className="text-gray-500 text-sm text-center max-w-xs">Choose a conversation from the list to start messaging</p>
      </div>
    );
  }

  const otherUser = conversation.otherUser;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="lg:hidden flex-shrink-0 -ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ring-2 ring-blue-100 flex-shrink-0 overflow-hidden">
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
            <span className="text-sm">{otherUser?.name?.[0]?.toUpperCase() || '?'}</span>
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">{otherUser?.name || 'Unknown'}</h3>
            {otherUser?.current_title && (
              <p className="text-[10px] sm:text-xs text-gray-500 truncate">{otherUser.current_title}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Keyboard Shortcuts Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShortcuts(!showShortcuts)}
              className="hover:bg-gray-100 rounded-lg p-2"
              title="Keyboard shortcuts"
            >
              <Keyboard className="h-5 w-5 text-gray-600" />
            </Button>
            
            {showShortcuts && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowShortcuts(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-20">
                  <h4 className="font-semibold text-sm text-gray-900 mb-3">Keyboard Shortcuts</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Send message</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Enter</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">New line</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Shift + Enter</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Focus input</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Ctrl/⌘ + K</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Previous chat</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">↑</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Next chat</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">↓</kbd>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Close menu</span>
                      <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono">Esc</kbd>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* More Options Button */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="hover:bg-gray-100 rounded-lg p-2"
            >
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </Button>
          
            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-20 overflow-hidden">
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="font-medium">Delete Conversation</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-gradient-to-br from-gray-50 to-blue-50/20">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-3">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium mb-1">No messages yet</p>
            <p className="text-sm text-gray-500">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUser.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                  {!isOwn && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 overflow-hidden">
                      {message.sender?.avatar_url && (
                        <img
                          src={message.sender.avatar_url}
                          alt={message.sender.name}
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      {message.sender?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  
                  <div>
                    <div
                      className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm ${
                        isOwn
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'bg-white text-gray-900 border border-gray-100'
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                    </div>
                    <p
                      className={`text-xs text-gray-400 mt-1 flex items-center gap-1 ${
                        isOwn ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {isOwn && (
                        <span className="text-[10px]">
                          {message.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                      <span>{formatMessageTime(message.created_at)}</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Extended Width */}
      <form onSubmit={handleSend} className="border-t border-gray-200 bg-white shadow-lg sticky bottom-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex gap-3 items-end max-w-6xl mx-auto">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
              className="flex-1 min-w-0 text-sm sm:text-base py-3 px-4 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 shadow-sm"
              disabled={sending}
              autoComplete="off"
              autoFocus
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="flex-shrink-0 w-12 h-12 p-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
