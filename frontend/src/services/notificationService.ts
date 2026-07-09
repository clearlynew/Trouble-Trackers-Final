import { api } from './api';

const NotificationService = {
  // get notifications
  getNotificationsByUser: async () => {
    const res = await api.get('/notifications/my-notifications');
    return res.data;
  },

  // send single notification
  send: async (notification: any) => {
    if (!notification.recipient) {
      throw new Error('recipient is required to send a notification');
    }
    const res = await api.post('/notifications', notification);
    return res.data;
  },

  // send to multiple users
  sendToUsers: async (notification: any, userIds: string[]) => {
    if (!userIds || userIds.length === 0) {
      throw new Error('At least one userId is required');
    }
    const res = await api.post('/notifications/send-multiple', { notification, userIds });
    return res.data;
  },

  // bulk system notification
  sendSystemNotificationBulk: async (notificationPayload: {
    type: string;
    title: string;
    message: string;
    recipients: string[];
  }) => {
    const { recipients, ...notification } = notificationPayload;

    if (!recipients || recipients.length === 0) {
      throw new Error('Recipients array is required.');
    }

    const res = await api.post('/notifications/send-multiple', {
      notification,
      recipientIds: recipients,
    });
    return res.data;
  },

  // mark one as read
  markAsRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/mark-read`);
    return res.data;
  },

  // mark all as read
  markAllAsRead: async () => {
    const res = await api.put('/notifications/mark-all-read');
    return res.data;
  },

  // delete notification
  delete: async (id: string) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};

// Preserve explicit named hooks
export const getNotificationsByUser = NotificationService.getNotificationsByUser;
export const sendSystemNotification = NotificationService.sendSystemNotificationBulk;
export const sendSystemNotificationToUsers = NotificationService.sendToUsers;
export const markNotificationAsRead = NotificationService.markAsRead;
export const markAllNotificationsAsRead = NotificationService.markAllAsRead;
export const removeNotification = NotificationService.delete;

export default NotificationService;