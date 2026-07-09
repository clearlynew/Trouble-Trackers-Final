import React, {
  useEffect,
  useState,
} from 'react';

import {
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  User,
  Tag,
} from 'lucide-react';

import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

import userService from '../services/userService';

interface ComplaintImage {
  fileId: string;
  id: string;
  url: string;
  _id: string;
}

interface Complaint {
  _id: string;

  title: string;

  description: string;

  status: string;

  submittedBy: string;

  createdAt: string;

  domain: string;

  assignedTo?: string | null;

  votedBy?: string[];

  votes?: number;

  images?: ComplaintImage[];
}

interface ComplaintCardProps {
  complaint: Complaint;

  currentUserId: string;

  currentUserRole?:
    | 'student'
    | 'admin'
    | 'superadmin';

  showAdminControls?: boolean;

  showDeleteControl?: boolean;

  onVote?: (
    id: string
  ) => void;

  onStatusChange?: (
    id: string,
    status: string
  ) => void;

  onDelete?: (
    id: string
  ) => void;

  onAssign?: (
    id: string
  ) => void;
}

const ComplaintCard: React.FC<
  ComplaintCardProps
> = ({
  complaint,
  currentUserId,
  currentUserRole,
  showAdminControls = false,
  showDeleteControl = false,
  onVote,
  onStatusChange,
  onDelete,
  onAssign,
}) => {
  const [
    submittedByName,
    setSubmittedByName,
  ] = useState(
    'Unknown'
  );

  const [
    assignedAdminName,
    setAssignedAdminName,
  ] = useState<
    string | null
  >(null);

  const [
    isLoadingUser,
    setIsLoadingUser,
  ] = useState(true);

  const [
    isLoadingAdmin,
    setIsLoadingAdmin,
  ] = useState(false);

  useEffect(() => {
    const fetchUserNames =
      async () => {
        setIsLoadingUser(
          true
        );

        setIsLoadingAdmin(
          !!complaint.assignedTo
        );

        try {
          // submitted user

          const submitter =
            await userService.getById(
              complaint.submittedBy
            );

          setSubmittedByName(
            submitter.name
          );

          // assigned admin

          if (
            complaint.assignedTo
          ) {
            const admin =
              await userService.getById(
                complaint.assignedTo
              );

            setAssignedAdminName(
              admin.name
            );
          } else {
            setAssignedAdminName(
              null
            );
          }
        } catch (err) {
          console.error(
            'Failed to fetch user data:',
            err
          );

          setSubmittedByName(
            'Unknown User'
          );

          setAssignedAdminName(
            'Error Fetching Admin'
          );
        } finally {
          setIsLoadingUser(
            false
          );

          setIsLoadingAdmin(
            false
          );
        }
      };

    fetchUserNames();
  }, [
    complaint.submittedBy,
    complaint.assignedTo,
  ]);

  const isAdmin =
    currentUserRole ===
      'admin' ||
    currentUserRole ===
      'superadmin';

  const isAssigned =
    !!complaint.assignedTo;

  const isClosed =
    complaint.status ===
      'resolved' ||
    complaint.status ===
      'rejected';

  let hasVoted =
    complaint.votedBy?.includes(
      currentUserId
    ) ?? false;

  // admins cannot vote

  if (isAdmin) {
    hasVoted = false;
  }

  // safe date formatter

  const formattedDate =
    complaint.createdAt &&
    !isNaN(
      new Date(
        complaint.createdAt
      ).getTime()
    )
      ? new Date(
          complaint.createdAt
        ).toLocaleDateString()
      : 'Unknown Date';

  const getStatusColor =
    (
      status: string
    ) => {
      switch (status) {
        case 'pending':
          return 'warning';

        case 'in-progress':
          return 'info';

        case 'resolved':
          return 'success';

        case 'rejected':
          return 'danger';

        default:
          return 'default';
      }
    };

  const getStatusIcon =
    (
      status: string
    ) => {
      switch (status) {
        case 'pending':
          return (
            <Clock className="w-4 h-4" />
          );

        case 'in-progress':
          return (
            <AlertCircle className="w-4 h-4" />
          );

        case 'resolved':
          return (
            <CheckCircle className="w-4 h-4" />
          );

        case 'rejected':
          return (
            <XCircle className="w-4 h-4" />
          );

        default:
          return (
            <Clock className="w-4 h-4" />
          );
      }
    };

  return (
    <Card
      hover
      className="overflow-hidden"
    >
      {/* content */}

      <div className="p-6 border-b border-slate-100">
        {/* title */}

        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 flex-1">
            {
              complaint.title
            }
          </h3>

          <div className="flex items-center gap-2 ml-4">
            <Badge
              variant={getStatusColor(
                complaint.status
              )}
            >
              {getStatusIcon(
                complaint.status
              )}

              {complaint.status
                .replace(
                  '-',
                  ' '
                )
                .toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* description */}

        <p className="text-slate-600 mb-4 leading-relaxed">
          {
            complaint.description
          }
        </p>

        {/* images */}

        {complaint.images &&
          complaint.images
            .length >
            0 && (
            <div className="complaint-images mb-4 flex flex-wrap gap-3">
              {complaint.images.map(
                (
                  img,
                  idx
                ) => (
                  <img
                    key={
                      img._id ??
                      idx
                    }
                    src={
                      img.url
                    }
                    alt={`complaint-img-${idx}`}
                    className="w-32 h-24 object-cover rounded-lg border border-slate-200"
                  />
                )
              )}
            </div>
          )}

        {/* meta */}

        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          {/* submitted by */}

          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />

            Submitted By:

            <span className="font-medium text-slate-700">
              {isLoadingUser
                ? 'Loading...'
                : submittedByName}
            </span>
          </span>

          {/* domain */}

          <span className="flex items-center gap-1">
            <Tag className="w-3 h-3" />

            Domain:

            <span className="font-medium text-slate-700">
              {
                complaint.domain
              }
            </span>
          </span>

          {/* date */}

          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />

            Submitted At:

            <span className="font-medium text-slate-700">
              {
                formattedDate
              }
            </span>
          </span>
        </div>

        {/* assigned admin */}

        <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
          <User className="w-4 h-4 text-blue-500" />

          <span className="font-medium">
            Assigned Staff:
          </span>

          {isLoadingAdmin ? (
            <span className="text-sm text-slate-500">
              Loading...
            </span>
          ) : isAssigned &&
            assignedAdminName ? (
            <span className="font-semibold text-blue-600">
              {
                assignedAdminName
              }
            </span>
          ) : (
            <span className="text-yellow-600">
              Unassigned
            </span>
          )}
        </div>
      </div>

      {/* footer */}

      <div className="p-4 bg-slate-50/50 flex items-center justify-between">
        {/* votes */}

        <div className="flex items-center gap-4">
          <Button
            onClick={() =>
              complaint._id &&
              onVote?.(
                complaint._id
              )
            }
            variant={
              hasVoted
                ? 'primary'
                : 'ghost'
            }
            size="sm"
            className={
              hasVoted
                ? 'shadow-md'
                : ''
            }
            disabled={
              isAdmin
            }
          >
            <ThumbsUp className="w-4 h-4" />

            <span className="font-semibold">
              {complaint.votes ??
                0}
            </span>
          </Button>
        </div>

        {/* admin controls */}

        {showAdminControls &&
          isAdmin && (
            <div className="flex items-center gap-2">
              {/* status */}

              <select
                value={
                  complaint.status
                }
                onChange={(
                  e
                ) =>
                  complaint._id &&
                  onStatusChange?.(
                    complaint._id,
                    e.target
                      .value
                  )
                }
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="pending">
                  Pending
                </option>

                <option value="in-progress">
                  In Progress
                </option>

                <option value="resolved">
                  Resolved
                </option>

                <option value="rejected">
                  Rejected
                </option>
              </select>

              {/* assign */}

              {!isClosed && (
                <Button
                  onClick={() =>
                    complaint._id &&
                    onAssign?.(
                      complaint._id
                    )
                  }
                  variant="primary"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />

                  {isAssigned
                    ? 'Reassign Admin'
                    : 'Assign Admin'}
                </Button>
              )}
            </div>
          )}

        {/* delete */}

        {showDeleteControl && (
          <Button
            onClick={() =>
              complaint._id &&
              onDelete?.(
                complaint._id
              )
            }
            variant="danger"
            size="sm"
            className="ml-auto"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ComplaintCard;