import React, {
  useState,
  useEffect,
} from 'react';

import {
  X,
  Send,
  User,
} from 'lucide-react';

import * as notificationService from '../services/notificationService';

interface UserData {
  _id?: string;

  name: string;

  email: string;

  role:
    | 'admin'
    | 'student'
    | 'superadmin';

  category?: string | null;

  room?: string | null;

  status?:
    | 'active'
    | 'inactive';
}
interface SystemNotificationModalProps {
  isOpen: boolean;

  onClose: () => void;

  onSend: (
    notificationData: any
  ) => void;

  users: UserData[];
}

const SystemNotificationModal: React.FC<
  SystemNotificationModalProps
> = ({
  isOpen,
  onClose,
  onSend,
  users,
}) => {
  const [title, setTitle] =
    useState('');

  const [message, setMessage] =
    useState('');

  const [type, setType] =
    useState<
      | 'info'
      | 'success'
      | 'warning'
      | 'error'
    >('info');

  const [
    selectedRecipients,
    setSelectedRecipients,
  ] = useState<string[]>(
    []
  );

  const ADMIN_CATEGORIES =
    [
      'Maintenance',
      'Cleanliness',
      'Food',
      'Internet',
      'Security',
    ];

  useEffect(() => {
    if (isOpen) {
      setTitle('');

      setMessage('');

      setType('info');

      setSelectedRecipients(
        []
      );
    }
  }, [isOpen]);

  const recipientOptions =
    [
      {
        label:
          'All Students',

        value:
          'student',
      },

      {
        label:
          'All Admins',

        value: 'admin',
      },

      {
        label:
          'All Super Admins',

        value:
          'superadmin',
      },

      ...ADMIN_CATEGORIES.map(
        (
          category
        ) => ({
          label: `${category} Staff`,

          value:
            category,
        })
      ),
    ];

  const handleRecipientChange =
    (value: string) => {
      setSelectedRecipients(
        (prev) =>
          prev.includes(
            value
          )
            ? prev.filter(
                (v) =>
                  v !==
                  value
              )
            : [
                ...prev,
                value,
              ]
      );
    };

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !title ||
        !message ||
        selectedRecipients.length ===
          0
      ) {
        return alert(
          'Please fill all fields and select at least one recipient.'
        );
      }

      let recipientIds =
        new Set<string>();

      selectedRecipients.forEach(
        (r) => {
          // all students

          if (
            r ===
            'student'
          ) {
            users
              .filter(
                (u) =>
                  u.role ===
                  'student'
              )

              .forEach(
                (u) =>
                  recipientIds.add(
                    u._id
                  )
              );
          }

          // all admins

          else if (
            r === 'admin'
          ) {
            users
              .filter(
                (u) =>
                  u.role ===
                  'admin'
              )

              .forEach(
                (u) =>
                  recipientIds.add(
                    u._id
                  )
              );
          }

          // all superadmins

          else if (
            r ===
            'superadmin'
          ) {
            users
              .filter(
                (u) =>
                  u.role ===
                  'superadmin'
              )

              .forEach(
                (u) =>
                  recipientIds.add(
                    u._id
                  )
              );
          }

          // category admins

          else {
            users
              .filter(
                (u) =>
                  u.role ===
                    'admin' &&
                  u.category ===
                    r
              )

              .forEach(
                (u) =>
                  recipientIds.add(
                    u._id
                  )
              );
          }
        }
      );

      const uniqueRecipientIds =
        Array.from(
          recipientIds
        );

      if (
        uniqueRecipientIds.length ===
        0
      ) {
        return alert(
          'No users found matching the selected recipient criteria.'
        );
      }

      const notificationPayload =
        {
          type,

          title,

          message,

          recipients:
            uniqueRecipientIds,
        };

      try {
        await notificationService.sendSystemNotification(
          notificationPayload
        );

        onSend?.(
          notificationPayload
        );

        onClose();
      } catch (err) {
        console.error(
          'Failed to send notification:',
          err
        );

        alert(
          'Failed to send notification. Check console for details.'
        );
      }
    };

  if (!isOpen)
    return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-6 bg-white w-full max-w-lg mx-auto rounded-xl shadow-2xl">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <Send className="w-6 h-6 text-orange-600" />

            Send System
            Notification
          </h3>

          <button
            onClick={
              onClose
            }
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-4"
        >
          {/* type */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification
              Type
            </label>

            <select
              value={type}
              onChange={(
                e
              ) =>
                setType(
                  e.target
                    .value as
                    | 'info'
                    | 'success'
                    | 'warning'
                    | 'error'
                )
              }
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">
                Info
                (Blue)
              </option>

              <option value="success">
                Success
                (Green)
              </option>

              <option value="warning">
                Warning
                (Yellow)
              </option>

              <option value="error">
                Error
                (Red)
              </option>
            </select>
          </div>

          {/* title */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(
                e
              ) =>
                setTitle(
                  e.target
                    .value
                )
              }
              placeholder="Maintenance Alert"
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* message */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>

            <textarea
              value={message}
              onChange={(
                e
              ) =>
                setMessage(
                  e.target
                    .value
                )
              }
              rows={3}
              placeholder="The water supply will be temporarily shut off..."
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* recipients */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="w-4 h-4 mr-1" />

              Select
              Recipients
            </label>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg bg-gray-50">
              {recipientOptions.map(
                (
                  option
                ) => (
                  <label
                    key={
                      option.value
                    }
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(
                        option.value
                      )}
                      onChange={() =>
                        handleRecipientChange(
                          option.value
                        )
                      }
                      className="form-checkbox text-blue-600 rounded"
                    />

                    <span>
                      {
                        option.label
                      }
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 bg-orange-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              <Send className="w-5 h-5" />

              Send
              Notification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemNotificationModal;