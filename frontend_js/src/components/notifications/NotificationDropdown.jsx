'use client';

import { useState, useEffect } from 'react';
import { X, CheckCheck, Briefcase, Calendar, Users, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import notificationService from '../../lib/notificationService';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationDropdown({ userId, onClose, onMarkAllRead }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return;
      
      const result = await notificationService.getUserNotifications(userId);
      if (result.success) {
        setNotifications(result.data);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [userId]);

  const handleMarkAsRead = async (notificationId) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    onMarkAllRead();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'job_application':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'event_registration':
        return <Calendar className="w-4 h-4 text-green-600" />;
      case 'connection_request':
        return <Users className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[32rem] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </p>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t bg-gray-50">
            <Button
              variant="ghost"
              className="w-full text-sm text-blue-600 hover:text-blue-700"
              onClick={() => {
                window.location.href = '/notifications';
                onClose();
              }}
            >
              View All Notifications
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
