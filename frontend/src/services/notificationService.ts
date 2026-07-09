import axios from 'axios';

const API_BASE_URL =
  'http://localhost:5000/api';

const NOTIFICATION_API_URL =
  `${API_BASE_URL}/notifications`;

const COMPLAINT_API_URL =
  `${API_BASE_URL}/complaints`;

// axios instance

const api = axios.create({
  baseURL: API_BASE_URL,
});

// attach auth token

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'token'
      );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);

const NotificationService = {
  // get notifications

  getNotificationsByUser:
    async (
    ) => {
      const res =
        await api.get(
          `/notifications/my-notifications`
        );

      return res.data;
    },

  // send single notification

  send: async (
    notification: any
  ) => {
      if (
        !notification.recipient
      ) {
        throw new Error(
          'recipient is required to send a notification'
        );
      }

      const res =
        await api.post(
          '/notifications',
          notification
        );

      return res.data;
    },

  // send to multiple users

  sendToUsers:
    async (
      notification: any,
      userIds: string[]
    ) => {
      if (
        !userIds ||
        userIds.length ===
          0
      ) {
        throw new Error(
          'At least one userId is required'
        );
      }

      const res =
        await api.post(
          '/notifications/send-multiple',
          {
            notification,
            userIds,
          }
        );

      return res.data;
    },

  // bulk system notification

  sendSystemNotificationBulk:
  async (
    notificationPayload: {
      type: string;

      title: string;

      message: string;

      recipients: string[];
    }
  ) => {
    const {
      recipients,
      ...notification
    } = notificationPayload;

    if (
      !recipients ||
      recipients.length === 0
    ) {
      throw new Error(
        'Recipients array is required.'
      );
    }

    const res =
      await api.post(
        '/notifications/send-multiple',
        {
          notification,
          recipientIds:
            recipients,
        }
      );

    return res.data;
  },

  // mark one as read

  markAsRead:
    async (
      id: string
    ) => {
      const res =
        await api.put(
          `/notifications/${id}/mark-read`
        );

      return res.data;
    },

  // mark all as read

  markAllAsRead:
    async (

    ) => {
      const res =
        await api.put(
          '/notifications/mark-all-read',
        );

      return res.data;
    },

  // delete notification

  delete: async (
    id: string
  ) => {
      const res =
        await api.delete(
          `/notifications/${id}`
        );

      return res.data;
    },
};

// named exports

export const getNotificationsByUser =
  NotificationService.getNotificationsByUser;

export const sendSystemNotification =
  NotificationService.sendSystemNotificationBulk;

export const sendSystemNotificationToUsers =
  NotificationService.sendToUsers;

export const markNotificationAsRead =
  NotificationService.markAsRead;

export const markAllNotificationsAsRead =
  NotificationService.markAllAsRead;

export const removeNotification =
  NotificationService.delete;

export default NotificationService;