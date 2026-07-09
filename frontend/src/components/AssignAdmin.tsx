import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

import Button from './ui/Button';

import { getAll } from '../services/userService';

interface User {
  _id: string;

  name: string;

  role:
    | 'admin'
    | 'student'
    | 'superadmin';

  category?: string | null;
}

interface AssignAdminProps {
  isOpen: boolean;

  onClose: () => void;

  onAssign: (
    adminId: string
  ) => void;

  currentAssigned?: string;

  // complaint domain/category

  complaintDomain: string;
}

const AssignAdmin: React.FC<
  AssignAdminProps
> = ({
  isOpen,
  onClose,
  onAssign,
  currentAssigned,
  complaintDomain,
}) => {
  const [admins, setAdmins] =
    useState<User[]>([]);

  // selectedAdmin stores MongoDB ObjectId

  const [
    selectedAdmin,
    setSelectedAdmin,
  ] = useState<string>('');

  const [loading, setLoading] =
    useState(false);

  // basic ObjectId validator

  const isObjectId = (
    str: string
  ) =>
    /^[0-9a-fA-F]{24}$/.test(
      str
    );

  useEffect(() => {
    // reset when modal closes

    if (!isOpen) {
      setAdmins([]);

      setSelectedAdmin('');

      return;
    }

    const fetchAdmins =
      async () => {
        setLoading(true);

        try {
          const users =
            await getAll();

          // filter matching admins

          const adminUsers: User[] =
            users
              .filter(
                (u: any) =>
                  u.role ===
                    'admin' &&
                  u._id &&
                  u.category ===
                    complaintDomain
              )

              .map((u: any) => ({
                ...u,

                _id: String(
                  u._id
                ),
              }));

          setAdmins(adminUsers);

          // defensive selection logic

          let idToSelect =
            '';

          // prefer existing assigned admin

          if (
            currentAssigned &&
            isObjectId(
              currentAssigned
            ) &&
            adminUsers.some(
              (u) =>
                u._id ===
                currentAssigned
            )
          ) {
            idToSelect =
              currentAssigned;
          }

          // otherwise choose first admin

          else if (
            adminUsers.length >
              0 &&
            adminUsers[0]._id
          ) {
            idToSelect =
              adminUsers[0]._id;
          }

          setSelectedAdmin(
            idToSelect
          );
        } catch (err) {
          console.error(
            'Failed to fetch admins:',
            err
          );

          setAdmins([]);

          setSelectedAdmin('');
        } finally {
          setLoading(false);
        }
      };

    fetchAdmins();
  }, [
    isOpen,
    currentAssigned,
    complaintDomain,
  ]);

  const handleAssignment =
    () => {
      if (!selectedAdmin) {
        alert(
          'Select a staff member to assign the complaint.'
        );

        return;
      }

      if (
        !isObjectId(
          selectedAdmin
        )
      ) {
        console.error(
          'CRITICAL ERROR: selectedAdmin is not a valid ObjectId:',
          selectedAdmin
        );

        alert(
          'Cannot assign. Internal error: Selected staff member data is corrupted.'
        );

        return;
      }

      onAssign(selectedAdmin);
    };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700 transition duration-150 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">
          Assign Staff Member (
          {complaintDomain})
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-4 text-gray-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />

            <p>
              Loading staff...
            </p>
          </div>
        ) : admins.length ===
          0 ? (
          <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            ⚠️ No admin staff
            found for the
            <strong>
              {' '}
              {
                complaintDomain
              }{' '}
            </strong>
            department.
          </p>
        ) : (
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-6 transition duration-150"
            value={
              selectedAdmin
            }
            onChange={(e) =>
              setSelectedAdmin(
                e.target.value
              )
            }
          >
            <option
              value=""
              disabled
            >
              -- Select a Staff
              Member --
            </option>

            {admins.map(
              (user) => (
                <option
                  key={
                    user._id
                  }
                  value={
                    user._id
                  }
                >
                  {user.name} (
                  {
                    user.category
                  }
                  )
                </option>
              )
            )}
          </select>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={
              handleAssignment
            }
            disabled={
              !selectedAdmin ||
              loading ||
              admins.length === 0
            }
          >
            {loading
              ? 'Loading...'
              : 'Assign'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignAdmin;