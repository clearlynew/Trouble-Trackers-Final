import React from 'react';

import {
  User,
  Edit,
  Trash2,
} from 'lucide-react';

import Button from './ui/Button';

interface UserData {
  _id: string;

  name: string;

  email: string;

  role:
    | 'admin'
    | 'student'
    | 'superadmin';

  category?: string | null;

  room?: string | null;

  status:
    | 'active'
    | 'inactive';
}

interface ComplaintData {
  _id: string;

  submittedBy: any;

  status: string;

  assignedTo?: any;
}

interface ViewUserManagementModelProps {
  users: UserData[];

  complaints: ComplaintData[];

  loading: boolean;

  currentUserId?: string;

  currentUserRole?:
    | 'admin'
    | 'student'
    | 'superadmin';

  onEdit?: (
    user: UserData
  ) => void;

  onDelete?: (
    user: UserData
  ) => void;

  onAddUser?: () => void;
}

// role badge

const RoleBadge = ({
  role,
}: {
  role: string;
}) => {
  let bgColor,
    textColor,
    roleDisplay;

  if (
    role ===
    'superadmin'
  ) {
    roleDisplay =
      'Super Admin';

    bgColor =
      'bg-purple-100';

    textColor =
      'text-purple-800';
  } else if (
    role === 'admin'
  ) {
    roleDisplay =
      'Admin';

    bgColor =
      'bg-blue-100';

    textColor =
      'text-blue-800';
  } else {
    roleDisplay =
      'Student';

    bgColor =
      'bg-green-100';

    textColor =
      'text-green-800';
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {roleDisplay}
    </span>
  );
};

const ViewUserManagementModel: React.FC<
  ViewUserManagementModelProps
> = ({
  users,
  complaints,
  loading,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
  onAddUser,
}) => {
  const isSuperAdmin =
    currentUserRole ===
    'superadmin';

  // sorting

  const sortedUsers = [
    ...users,
  ].sort((a, b) => {
    if (
      currentUserId
    ) {
      if (
        a._id ===
        currentUserId
      )
        return -1;

      if (
        b._id ===
        currentUserId
      )
        return 1;
    }

    const roleOrder = (
      user: UserData
    ) => {
      if (
        user.role ===
        'superadmin'
      )
        return 1;

      if (
        user.role ===
        'admin'
      )
        return 2;

      return 3;
    };

    if (
      roleOrder(a) !==
      roleOrder(b)
    ) {
      return (
        roleOrder(a) -
        roleOrder(b)
      );
    }

    return a.name.localeCompare(
      b.name
    );
  });

  // complaint count

  const getComplaintCount =
    (
      userId: string
    ) => {
      return complaints.filter(
        (
          complaint
        ) =>
          String(
            complaint
              .submittedBy?._id ||
              complaint.submittedBy
          ) ===
          String(userId)
      ).length;
    };

  // loading

  if (loading)
    return (
      <div className="text-center py-10 text-gray-500 flex justify-center items-center gap-2">
        <User className="w-5 h-5 animate-pulse" />

        Loading user
        data...
      </div>
    );

  // empty

  if (
    sortedUsers.length ===
    0
  ) {
    return (
      <p className="text-center text-gray-500 mt-6">
        No users found.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* top bar */}

      {isSuperAdmin && (
        <div className="flex justify-end">
          <Button
            onClick={
              onAddUser
            }
            variant="primary"
          >
            + Add User
          </Button>
        </div>
      )}

      {/* table */}

      <div className="overflow-x-auto shadow border border-gray-100 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          {/* head */}

          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name/Email
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location/Room
              </th>

              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Complaints
              </th>

              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>

              {isSuperAdmin && (
                <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          {/* body */}

          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map(
              (user) => (
                <tr
                  key={
                    user._id
                  }
                  className={
                    user._id ===
                    currentUserId
                      ? 'bg-blue-50/70 border-l-4 border-blue-500'
                      : ''
                  }
                >
                  {/* id */}

                  <td
                    className="px-3 py-4 whitespace-nowrap text-xs text-gray-400 max-w-[100px] truncate"
                    title={
                      user._id
                    }
                  >
                    {user._id.substring(
                      user._id
                        .length -
                        8
                    )}
                    ...
                  </td>

                  {/* name */}

                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}

                    {user._id ===
                      currentUserId && (
                      <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500 text-white">
                        You
                      </span>
                    )}

                    <p className="text-xs text-gray-500 mt-0.5">
                      {
                        user.email
                      }
                    </p>
                  </td>

                  {/* role */}

                  <td className="px-3 py-4 whitespace-nowrap">
                    <RoleBadge
                      role={
                        user.role
                      }
                    />
                  </td>

                  {/* category */}

                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.role ===
                    'superadmin'
                      ? 'Global Access'
                      : user.category ||
                        'N/A'}
                  </td>

                  {/* room */}

                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.room ||
                      'N/A'}
                  </td>

                  {/* complaints */}

                  <td className="px-3 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-700">
                    {getComplaintCount(
                      user._id
                    )}
                  </td>

                  {/* status */}

                  <td className="px-3 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status ===
                        'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {
                        user.status
                      }
                    </span>
                  </td>

                  {/* actions */}

                  {isSuperAdmin && (
                    <td className="px-3 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            onEdit?.(
                              user
                            )
                          }
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          disabled={
                            user._id ===
                            currentUserId
                          }
                          onClick={() =>
                            onDelete?.(
                              user
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewUserManagementModel;