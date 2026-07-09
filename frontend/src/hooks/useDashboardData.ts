import { useState, useEffect } from 'react';
import complaintService from '../services/complaintService';
// FIX: Clean import to match the unified default service object layout structure
import userService from '../services/userService';

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

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  // Validate authentication state locally on initial render hook bindings
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') as any;
    const userId = localStorage.getItem('userId');

    if (!token || role !== requiredRole) {
      // If unauthorized, the interceptor or routing views handle forcing logout redirections
      setLoading(false);
      setUsersLoading(false);
      return;
    }

    // Mock an active local profile metadata state mapping container framework cleanly
    setCurrentUser({
      _id: userId || '',
      name: 'Logged In User',
      email: '',
      role: role,
      status: 'active',
    });
  }, [requiredRole]);

  // Effect to fetch complaints whenever the credentials or selected complaint page transitions
  useEffect(() => {
    if (!currentUser) return;

    const fetchComplaints = async () => {
      setLoading(true);
      try {
        // Aligns cleanly with the centralized shared API instance
        const res = await complaintService.getAll();

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
        // FIX: Removed the object payload argument from .getAll() to match the refactored service method signature
        const res = await userService.getAll();

        // Handle both standard paginated object wrappers and legacy arrays fallback cleanly
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

    // Global Network Loading Status Flags
    loading,
    usersLoading,
  };
}