import { useState } from 'react';
import {
  refreshNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../utils/notificationUtils';

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const refresh = async () => {
    await refreshNotifications(setNotifications);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationRead(notificationId, notifications, setNotifications);
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsRead(notifications, setNotifications);
  };

  return {
    notifications,
    setNotifications,
    refresh,
    handleMarkAsRead,
    handleMarkAllAsRead,
  };
}