import { useState, useEffect } from 'react';
import complaintService from '../services/complaintService';
import * as userService from '../services/userService';

export interface UserData {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'student' | 'superadmin';
  category?: string | null;
  room?: string | null;
  status: 'active' | 'inactive';
}

interface UseDashboardDataOptions {
  requiredRole: 'admin' | 'student' | 'superadmin';
  loadUsers?: boolean;
}

export function useDashboardData({
  requiredRole,
  loadUsers = false,
}: UseDashboardDataOptions) {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  
  // Paginated states for complaints
  const [complaints, setComplaints] = useState<any[]>([]);
  const [complaintsPage, setComplaintsPage] = useState(1);
  const [complaintsLimit] = useState(20);
  const [complaintsTotal, setComplaintsTotal] = useState(0);
  const [complaintsTotalPages, setComplaintsTotalPages] = useState(1);

  // Paginated states for users
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit] = useState(20);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);

  const [usersLoading, setUsersLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Effect to authenticate and initialize user data on mount
  useEffect(() => {
    const initUser = async () => {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        window.location.href = '/';
        return;
      }

      try {
        const user = await userService.getById(userId);

        if (user.role !== requiredRole) {
          alert('Access denied');
          window.location.href = '/';
          return;
        }

        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to authenticate user:', err);
        window.location.href = '/';
      }
    };

    initUser();
  }, [requiredRole]);

  // Effect to fetch complaints whenever the current page changes
  useEffect(() => {
    // Only fetch if user session is established
    if (!currentUser) return;

    const fetchComplaints = async () => {
      try {
        const res = await complaintService.getAll({ page: complaintsPage, limit: complaintsLimit });
        
        // Handle both standard paginated object wrappers and legacy arrays fallback
        if (res && res.complaints) {
          setComplaints(res.complaints);
          setComplaintsTotal(res.total);
          setComplaintsTotalPages(res.totalPages);
        } else if (Array.isArray(res)) {
          setComplaints(res);
        }
      } catch (err) {
        console.error('Failed to load complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [currentUser, complaintsPage, complaintsLimit]);

  // Effect to fetch users whenever the user page changes (if loadUsers flag is true)
  useEffect(() => {
    if (!currentUser || !loadUsers) {
      setUsersLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await userService.getAll({ page: usersPage, limit: usersLimit });

        // Handle both standard paginated object wrappers and legacy arrays fallback
        if (res && res.users) {
          setUsers(res.users);
          setUsersTotal(res.total);
          setUsersTotalPages(res.totalPages);
        } else if (Array.isArray(res)) {
          setUsers(res);
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser, loadUsers, usersPage, usersLimit]);

  return {
    currentUser,
    
    // Complaints Pagination API
    complaints,
    setComplaints,
    complaintsPage,
    setComplaintsPage,
    complaintsTotal,
    complaintsTotalPages,
    
    // Users Pagination API
    users,
    setUsers,
    usersPage,
    setUsersPage,
    usersTotal,
    usersTotalPages,

    usersLoading,
    loading,
  };
}