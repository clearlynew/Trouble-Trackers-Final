import { useState } from 'react';
import { filterComplaints, sortComplaints } from '../utils/complaintUtils';
import type { ComplaintData, SortType, StatusFilterType } from '../utils/complaintUtils';
import type { UserData } from './useDashboardData';

export function useComplaintFilters(complaints: ComplaintData[], currentUser: UserData | null) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [sortType, setSortType] = useState<SortType>('votes');

  const filtered = filterComplaints(complaints, { searchTerm, statusFilter, currentUser });
  const sorted = sortComplaints(filtered, sortType);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortType,
    setSortType,
    sortedComplaints: sorted,
  };
}