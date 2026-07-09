import React, {
  useState,
  useEffect,
} from 'react';

import {
  X,
  UserPlus,
  Shield,
  User,
  Eye,
  EyeOff,
  Edit,
  Loader2,
} from 'lucide-react';

interface UserData {
  _id?: string;

  name: string;

  email: string;

  role:
    | 'admin'
    | 'student'
    | 'superadmin';

  category?: string;

  room?: string;

  password?: string;
}

interface UserManagementModalProps {
  isOpen: boolean;

  onClose: () => void;

  userToEdit?: UserData | null;
  onSaveUser: (
    user: UserData
  ) => Promise<UserData>;
}

const UserManagementModal: React.FC<
  UserManagementModalProps
> = ({
  isOpen,
  onClose,
  userToEdit,
  onSaveUser,
}) => {
  const isEditMode =
    !!userToEdit?._id;

  const [activeTab, setActiveTab] =
    useState<
      | 'admin'
      | 'student'
      | 'superadmin'
    >('admin');

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [category, setCategory] =
    useState('');

  const [room, setRoom] =
    useState('');

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const adminCategories = [
    'Maintenance',
    'Cleanliness',
    'Food',
    'Internet',
    'Security',
  ];

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);

      if (userToEdit) {
        setName(
          userToEdit.name
        );

        setEmail(
          userToEdit.email
        );

        const role =
          userToEdit.role ||
          'admin';

        setActiveTab(
          role
        );

        setPassword('');

        if (
          role ===
            'admin' ||
          role ===
            'superadmin'
        ) {
          setCategory(
            userToEdit.category ||
              ''
          );

          setRoom('');
        } else {
          setRoom(
            userToEdit.room ||
              ''
          );

          setCategory('');
        }
      } else {
        setName('');

        setEmail('');

        setPassword('');

        setCategory('');

        setRoom('');

        setActiveTab(
          'admin'
        );
      }
    } else {
      setIsLoading(false);
    }
  }, [
    isOpen,
    userToEdit,
  ]);

  const handleSubmit =
    async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      setErrorMessage(null);

      if (
        !name.trim() ||
        !email.trim()
      ) {
        setErrorMessage(
          'Name and Email are required.'
        );

        return;
      }

      if (
        !isEditMode &&
        !password.trim()
      ) {
        setErrorMessage(
          'Password is required for new users.'
        );

        return;
      }

      if (
        activeTab ===
          'admin' &&
        !category
      ) {
        setErrorMessage(
          'Admin Category is required.'
        );

        return;
      }

      if (
        activeTab ===
          'student' &&
        !room
      ) {
        setErrorMessage(
          'Room Number is required for students.'
        );

        return;
      }

      setIsLoading(true);

      let userPayload: Partial<UserData> =
        {
          name,
          email,
        };

      if (
        password.trim()
      ) {
        userPayload.password =
          password;
      }

      // admin

      if (
        activeTab ===
        'admin'
      ) {
        userPayload.role =
          'admin';

        userPayload.category =
          category;

        userPayload.room =
          undefined;
      }

      // superadmin

      else if (
        activeTab ===
        'superadmin'
      ) {
        userPayload.role =
          'superadmin';

        userPayload.category =
          undefined;

        userPayload.room =
          undefined;
      }

      // student

      else {
        userPayload.role =
          'student';

        userPayload.room =
          room;

        userPayload.category =
          undefined;
      }

      if (
        isEditMode &&
        userToEdit?._id
      ) {
        userPayload._id =
          userToEdit._id;
      }

      try {
        await onSaveUser(
          userPayload as UserData
        );

        setName('');

        setEmail('');

        setPassword('');

        setCategory('');

        setRoom('');

        setShowPassword(
          false
        );

        onClose();
      } catch (err) {
        console.error(
          `Failed to ${
            isEditMode
              ? 'edit'
              : 'add'
          } user:`,
          err
        );

        setErrorMessage(
          `Failed to ${
            isEditMode
              ? 'edit'
              : 'add'
          } user. Check the console for details.`
        );
      } finally {
        setIsLoading(false);
      }
    };

  if (!isOpen)
    return null;

  const saveButtonText =
    isEditMode
      ? isLoading
        ? 'Saving...'
        : 'Save Changes'
      : isLoading
      ? 'Adding...'
      : `Add ${
          activeTab ===
          'student'
            ? 'Student'
            : activeTab ===
              'superadmin'
            ? 'Super Admin'
            : 'Admin'
        }`;

  const iconColorClass =
    activeTab ===
    'student'
      ? 'text-green-600'
      : 'text-blue-600';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all scale-100 ease-out duration-300">
        {/* header */}

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {isEditMode ? (
              <Edit
                className={`w-6 h-6 ${iconColorClass}`}
              />
            ) : (
              <UserPlus
                className={`w-6 h-6 ${iconColorClass}`}
              />
            )}

            {isEditMode
              ? 'Edit User Details'
              : 'Add New User'}
          </h2>

          <button
            onClick={
              onClose
            }
            disabled={
              isLoading
            }
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* errors */}

        {errorMessage && (
          <div
            className="p-4 mx-6 mt-4 text-sm text-red-800 bg-red-100 rounded-lg border border-red-300 transition-opacity duration-300"
            role="alert"
          >
            <span className="font-semibold mr-1">
              Error:
            </span>

            {
              errorMessage
            }
          </div>
        )}

        {/* tabs */}

        <div className="flex border-b border-gray-200 mx-6 mt-4 rounded-t-lg overflow-hidden">
          {/* admin */}

          <button
            onClick={() =>
              setActiveTab(
                'admin'
              )
            }
            disabled={
              isEditMode ||
              isLoading
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab ===
              'admin'
                ? 'text-white border-b-2 border-blue-600 bg-blue-600 shadow-md'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50 bg-white'
            } ${
              isEditMode &&
              'opacity-60 cursor-not-allowed'
            }`}
          >
            <Shield className="w-4 h-4" />

            Admin
          </button>

          {/* superadmin */}

          <button
            onClick={() =>
              setActiveTab(
                'superadmin'
              )
            }
            disabled={
              isEditMode ||
              isLoading
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab ===
              'superadmin'
                ? 'text-white border-b-2 border-purple-600 bg-purple-600 shadow-md'
                : 'text-gray-600 hover:text-purple-600 hover:bg-gray-50 bg-white'
            } ${
              isEditMode &&
              'opacity-60 cursor-not-allowed'
            }`}
          >
            <Shield className="w-4 h-4" />

            Super Admin
          </button>

          {/* student */}

          <button
            onClick={() =>
              setActiveTab(
                'student'
              )
            }
            disabled={
              isEditMode ||
              isLoading
            }
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab ===
              'student'
                ? 'text-white border-b-2 border-green-600 bg-green-600 shadow-md'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50 bg-white'
            } ${
              isEditMode &&
              'opacity-60 cursor-not-allowed'
            }`}
          >
            <User className="w-4 h-4" />

            Student
          </button>
        </div>

        {/* form */}

        <form
          onSubmit={
            handleSubmit
          }
          className="p-6 space-y-4"
        >
          {/* name */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="text"
              value={name}
              onChange={(
                e
              ) =>
                setName(
                  e.target
                    .value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
              placeholder="Enter full name"
              required
              disabled={
                isLoading
              }
            />
          </div>

          {/* email */}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address{' '}
              <span className="text-red-500">
                *
              </span>
            </label>

            <input
              type="email"
              value={email}
              onChange={(
                e
              ) =>
                setEmail(
                  e.target
                    .value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
              placeholder="Enter email address"
              required
              disabled={
                isEditMode ||
                isLoading
              }
            />

            {isEditMode && (
              <p className="mt-1 text-xs text-gray-500">
                Email
                addresses
                cannot be
                changed
                after
                creation.
              </p>
            )}
          </div>

          {/* password */}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password{' '}

              {isEditMode ? (
                '(Leave blank to keep existing)'
              ) : (
                <span className="text-red-500">
                  *
                </span>
              )}
            </label>

            <input
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={
                password
              }
              onChange={(
                e
              ) =>
                setPassword(
                  e.target
                    .value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10 disabled:bg-gray-50"
              placeholder={
                isEditMode
                  ? 'New password (optional)'
                  : 'Enter password'
              }
              required={
                !isEditMode
              }
              disabled={
                isLoading
              }
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(
                  (
                    prev
                  ) =>
                    !prev
                )
              }
              className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-3 text-gray-500 hover:text-gray-700 p-1"
              disabled={
                isLoading
              }
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* admin category */}

          {activeTab ===
          'admin' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin
                Category{' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                value={
                  category
                }
                onChange={(
                  e
                ) =>
                  setCategory(
                    e.target
                      .value
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-50"
                required
                disabled={
                  isLoading
                }
              >
                <option value="">
                  Select
                  category
                </option>

                {adminCategories.map(
                  (
                    cat
                  ) => (
                    <option
                      key={
                        cat
                      }
                      value={
                        cat
                      }
                    >
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>
          ) : activeTab ===
            'student' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number{' '}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                type="text"
                value={room}
                onChange={(
                  e
                ) =>
                  setRoom(
                    e.target
                      .value
                  )
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-50"
                placeholder="e.g., 204"
                required
                disabled={
                  isLoading
                }
              />
            </div>
          ) : null}

          {/* actions */}

          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={
                onClose
              }
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              disabled={
                isLoading
              }
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isLoading
              }
              className={`px-6 py-2 text-white rounded-lg transition-all flex items-center justify-center gap-2 font-semibold shadow-md ${
                activeTab ===
                'student'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : activeTab ===
                    'superadmin'
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              } disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditMode ? (
                <Edit className="w-4 h-4" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}

              {
                saveButtonText
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagementModal;