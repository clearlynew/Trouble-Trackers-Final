import complaintService
  from '../services/complaintService';

import {
  refreshNotifications,
} from './notificationUtils';

// update complaint status

export const updateComplaintStatus =
  async ({
    id,
    status,
    complaints,
    setComplaints,
    currentUserId,
    setNotifications,
  }: any) => {
    try {
      const updatedComplaint =
        await complaintService.updateStatus(
          id,
          status
        );

      setComplaints(
        complaints.map(
          (c: any) =>
            c._id === id
              ? updatedComplaint
              : c
        )
      );

      if (
        currentUserId
      ) {
        await refreshNotifications(
          setNotifications
        );
      }

      return true;
    } catch (err) {
      console.error(
        'Failed to update complaint status:',
        err
      );

      return false;
    }
  };

// assign complaint

export const assignComplaint =
  async ({
    complaintId,
    adminId,
    complaints,
    setComplaints,
    currentUserId,
    setNotifications,
  }: any) => {
    try {
      const updatedComplaint =
        await complaintService.assign(
          complaintId,
          adminId
        );

      setComplaints(
        complaints.map(
          (c: any) =>
            c._id ===
            complaintId
              ? updatedComplaint
              : c
        )
      );

      if (
        currentUserId
      ) {
        await refreshNotifications(
          setNotifications
        );
      }

      return true;
    } catch (err) {
      console.error(
        'Failed to assign complaint:',
        err
      );

      return false;
    }
  };