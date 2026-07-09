import { useState } from 'react';
import type { ComplaintData } from '../utils/complaintUtils';

interface UseAssignModalOptions {
  onAssignSuccess: (updatedComplaint: ComplaintData) => void;
  assignFn: (complaintId: string, adminId: string) => Promise<ComplaintData>;
}

export function useAssignModal({ onAssignSuccess, assignFn }: UseAssignModalOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [complaintToAssign, setComplaintToAssign] = useState<ComplaintData | null>(null);
  const [assignedAdminId, setAssignedAdminId] = useState<string | undefined>(undefined);

  const open = (complaint: ComplaintData) => {
    setComplaintToAssign(complaint);
    setAssignedAdminId(complaint.assignedTo || undefined);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setComplaintToAssign(null);
    setAssignedAdminId(undefined);
  };

  const handleAssign = async (adminId: string) => {
    if (!complaintToAssign?._id) return;

    try {
      const updated = await assignFn(complaintToAssign._id, adminId);
      onAssignSuccess(updated);
      close();
    } catch (err) {
      console.error('Failed to assign admin:', err);
      alert('Failed to assign admin.');
    }
  };

  return {
    isOpen,
    complaintToAssign,
    assignedAdminId,
    open,
    close,
    handleAssign,
  };
}