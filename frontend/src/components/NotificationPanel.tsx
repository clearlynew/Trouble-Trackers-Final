import React, {
  useEffect,
  useState,
} from 'react';

import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

import notificationService from '../services/notificationService';

import Button from './ui/Button';

interface Notification {
  _id?: string;

  recipient: string;

  title: string;

  message: string;

  type:
    | 'success'
    | 'info'
    | 'warning'
    | 'error';

  isRead: boolean;

  createdAt?: string;
}

interface NotificationPanelProps {
  notifications: Notification[];

  currentUserId?: string;

  onMarkAsRead?: (
    id: string
  ) => void;

  onMarkAllAsRead?: () => void;
}

const NotificationPanel: React.FC<
  NotificationPanelProps
> = ({
  notifications,
  currentUserId,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [
    localNotifications,
    setLocalNotifications,
  ] = useState<
    Notification[]
  >([]);

  const [
    loadingStates,
    setLoadingStates,
  ] = useState<
    Record<
      string,
      boolean
    >
  >({});

  useEffect(() => {
    setLocalNotifications(
      notifications
    );
  }, [notifications]);

  const unreadNotifications =
    localNotifications.filter(
      (n) => !n.isRead
    );

  const unreadCount =
    unreadNotifications.length;

  const getNotificationIcon =
    (
      type: Notification['type']
    ) => {
      switch (type) {
        case 'success':
          return (
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          );

        case 'warning':
          return (
            <AlertCircle className="w-5 h-5 text-amber-600" />
          );

        case 'error':
          return (
            <AlertCircle className="w-5 h-5 text-red-600" />
          );

        default:
          return (
            <Info className="w-5 h-5 text-purple-600" />
          );
      }
    };

  const getNotificationBorder =
    (
      type: Notification['type']
    ) => {
      switch (type) {
        case 'success':
          return 'border-l-emerald-500';

        case 'warning':
          return 'border-l-amber-500';

        case 'error':
          return 'border-l-red-500';

        default:
          return 'border-l-purple-500';
      }
    };

  const getNotificationBg =
    (
      type: Notification['type']
    ) => {
      switch (type) {
        case 'success':
          return 'bg-emerald-50';

        case 'warning':
          return 'bg-amber-50';

        case 'error':
          return 'bg-red-50';

        default:
          return 'bg-purple-50';
      }
    };

  const handleMarkAsReadClick =
    async (
      notificationId: string
    ) => {
      if (
        !currentUserId ||
        !notificationId
      ) {
        console.error(
          'Missing currentUserId or notificationId'
        );

        return;
      }

      setLoadingStates(
        (prev) => ({
          ...prev,

          [notificationId]:
            true,
        })
      );

      try {
        setLocalNotifications(
          (prev) =>
            prev.map((n) =>
              n._id ===
              notificationId
                ? {
                    ...n,

                    isRead: true,
                  }
                : n
            )
        );

        onMarkAsRead?.(
          notificationId
        );

        await notificationService.markAsRead(
          notificationId
        );
      } catch (error) {
        console.error(
          'Failed to mark notification as read:',
          error
        );

        setLocalNotifications(
          (prev) =>
            prev.map((n) =>
              n._id ===
              notificationId
                ? {
                    ...n,

                    isRead: false,
                  }
                : n
            )
        );

        alert(
          'Failed to mark notification as read.'
        );
      } finally {
        setLoadingStates(
          (prev) => ({
            ...prev,

            [notificationId]:
              false,
          })
        );
      }
    };

  const handleMarkAllClick =
    async () => {
      if (
        !currentUserId
      ) {
        console.error(
          'Missing currentUserId'
        );

        return;
      }

      setLoadingStates(
        (prev) => ({
          ...prev,

          markAll: true,
        })
      );

      try {
        setLocalNotifications(
          (prev) =>
            prev.map((n) => ({
              ...n,

              isRead: true,
            }))
        );

        onMarkAllAsRead?.();

        await notificationService.markAllAsRead();
      } catch (error) {
        console.error(
          'Failed to mark all notifications as read:',
          error
        );

        setLocalNotifications(
          notifications
        );

        alert(
          'Failed to mark all notifications as read.'
        );
      } finally {
        setLoadingStates(
          (prev) => ({
            ...prev,

            markAll: false,
          })
        );
      }
    };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* header */}

      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-2 rounded-xl shadow-md">
            <Bell className="w-5 h-5 text-white" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Notifications
            </h2>

            <p className="text-sm text-gray-500">
              {unreadCount}{' '}
              unread
            </p>
          </div>
        </div>

        {unreadCount >
          0 && (
          <Button
            onClick={
              handleMarkAllClick
            }
            disabled={
              loadingStates.markAll
            }
            size="sm"
            variant="primary"
          >
            {loadingStates.markAll
              ? 'Marking...'
              : `Mark All As Read`}
          </Button>
        )}
      </div>

      {/* content */}

      <div className="max-h-96 overflow-y-auto">
        {unreadNotifications.length ===
        0 ? (
          <div className="text-center py-12 px-6">
            <div className="text-5xl mb-3">
              🔔
            </div>

            <p className="text-gray-500 font-medium">
              All caught up!
            </p>

            <p className="text-gray-400 text-sm mt-1">
              No unread
              notifications
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {unreadNotifications.map(
              (
                notification
              ) => (
                <div
                  key={
                    notification._id ||
                    notification.createdAt
                  }
                  className={`p-4 border-l-4 ${getNotificationBorder(
                    notification.type
                  )} ${getNotificationBg(
                    notification.type
                  )} rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200`}
                >
                  <div className="flex items-start gap-3 justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 mb-1">
                          {notification.title ||
                            'Notification'}
                        </p>

                        <p className="text-sm text-gray-700 leading-relaxed mb-2">
                          {
                            notification.message
                          }
                        </p>

                        <p className="text-xs text-gray-400">
                          {notification.createdAt
                            ? new Date(
                                notification.createdAt
                              ).toLocaleString()
                            : ''}
                        </p>
                      </div>
                    </div>

                    {/* mark read */}

                    <Button
                      onClick={() =>
                        handleMarkAsReadClick(
                          notification._id!
                        )
                      }
                      disabled={
                        loadingStates[
                          notification._id!
                        ]
                      }
                      size="sm"
                      variant="primary"
                    >
                      {loadingStates[
                        notification._id!
                      ]
                        ? 'Reading...'
                        : 'Mark Read'}
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;