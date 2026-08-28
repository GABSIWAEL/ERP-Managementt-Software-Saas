import React, { useEffect, useState } from 'react';
import { X, Bell } from 'lucide-react';
import { NotificationDTO } from '../api/notifications';

interface NotificationPopupProps {
  notification: NotificationDTO;
  onClose: () => void;
  onMarkAsRead?: (id: number) => void;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  notification,
  onClose,
  onMarkAsRead,
}) => {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      if (onMarkAsRead && !notification.isRead) {
        onMarkAsRead(notification.id);
      }
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose, onMarkAsRead]);

  return (
    <div className="fixed top-20 right-4 max-w-sm bg-white rounded-lg shadow-xl border-l-4 border-blue-500 p-4 animate-slide-in z-50">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Bell className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{notification.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(notification.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
