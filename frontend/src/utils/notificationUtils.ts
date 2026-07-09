import * as notificationService
  from '../services/notificationService';

// refresh notifications

export const refreshNotifications =
  async (
    setNotifications: Function
  ) => {
    try {
      const updatedNotifications =
        await notificationService.getNotificationsByUser();

      setNotifications(
        updatedNotifications
      );
    } catch (err) {
      console.error(
        'Failed to refresh notifications:',
        err
      );
    }
  };

// mark one notification

export const markNotificationRead =
  async (
    notificationId: string,
    notifications: any[],
    setNotifications: Function
  ) => {
    try {
      await notificationService.markNotificationAsRead(
        notificationId
      );

      setNotifications(
        notifications.map(
          (n) =>
            n._id ===
            notificationId
              ? {
                  ...n,
                  isRead: true,
                }
              : n
        )
      );
    } catch (err) {
      console.error(
        'Failed to mark notification:',
        err
      );
    }
  };

// mark all notifications

export const markAllNotificationsRead =
  async (
    notifications: any[],
    setNotifications: Function
  ) => {
    try {
      await notificationService.markAllNotificationsAsRead(
      );

      setNotifications(
        notifications.map(
          (n) => ({
            ...n,
            isRead: true,
          })
        )
      );
    } catch (err) {
      console.error(
        'Failed to mark all notifications:',
        err
      );
    }
  };

// unread count

export const getUnreadCount =
  (
    notifications: any[]
  ) => {
    return notifications.filter(
      (n) => !n.isRead
    ).length;
  };