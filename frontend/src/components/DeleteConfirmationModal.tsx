import React from 'react';

import {
  Trash2,
} from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;

  userName: string;

  userRole: string;

  onClose: () => void;

  onConfirm: () => void;
}

const DeleteConfirmationModal: React.FC<
  DeleteConfirmationModalProps
> = ({
  isOpen,
  userName,
  userRole,
  onClose,
  onConfirm,
}) => {
  if (!isOpen)
    return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-6">
        {/* header */}

        <h3 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <Trash2 className="w-6 h-6" />

          Confirm
          Deletion
        </h3>

        {/* body */}

        <p className="text-gray-700">
          Are you sure
          you want to
          delete user{' '}
          <span className="font-semibold text-gray-900">
            {userName}
          </span>{' '}
          (
          <span className="font-semibold text-gray-900">
            {userRole}
          </span>
          )?
          <br />
          <br />
          This action
          cannot be
          undone.
        </p>

        {/* actions */}

        <div className="flex justify-end gap-3">
          <button
            onClick={
              onClose
            }
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>

          <button
            onClick={
              onConfirm
            }
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Delete
            User
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;