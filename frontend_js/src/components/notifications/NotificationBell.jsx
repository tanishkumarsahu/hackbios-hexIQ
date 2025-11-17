'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../contexts/EnhancedAuthContext';
import notificationService from '../../lib/notificationService';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial count
    const fetchCount = async () => {
      const result = await notificationService.getUnreadCount(user.id);
      if (result.success) {
        setUnreadCount(result.count);
      }
    };
    fetchCount();

    // Subscribe to real-time updates
    const channel = notificationService.subscribeToNotifications(
      user.id,
      (newNotification) => {
        setUnreadCount(prev => prev + 1);
      }
    );

    return () => {
      notificationService.unsubscribeFromNotifications(channel);
    };
  }, [user?.id]);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <NotificationDropdown
          userId={user?.id}
          onClose={() => setShowDropdown(false)}
          onMarkAllRead={handleMarkAllRead}
        />
      )}
    </div>
  );
}
