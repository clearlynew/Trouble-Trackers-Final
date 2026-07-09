import React, { useState, useEffect } from 'react';
import { Users, Settings } from 'lucide-react';

import ComplaintCard from '../components/ComplaintCard';
import NotificationPanel from '../components/NotificationPanel';
import DashboardHeader from '../components/DashboardHeader';
import ComplaintStatsSection from '../components/ComplaintStatsSection';
import SystemNotificationModal from '../components/SystemNotificationModal';
import AssignAdmin from '../components/AssignAdmin';
import ViewUserManagementModel from '../components/ViewUserManagementModel';
import UserManagementModal from '../components/UserManagementModal';

import complaintService from '../services/complaintService';
import * as userService from '../services/userService';

import type { SortType, StatusFilterType } from '../utils/complaintUtils';
import { logoutUser } from '../utils/authUtils';
import { filterUsers } from '../utils/userUtils';

import { useDashboardData, type UserData } from '../hooks/useDashboardData';
import { useNotifications } from '../hooks/useNotifications';
import { useAssignModal } from '../hooks/useAssignModal';
import { useComplaintFilters } from '../hooks/useComplaintFilters';

const SuperAdminDashboard: React.FC = () => {
  const {
    currentUser,
    complaints,
    setComplaints,
    users: allUsers,
    setUsers: setAllUsers,
    usersLoading,
  } = useDashboardData({ requiredRole: 'superadmin', loadUsers: true });

  const { notifications, refresh, handleMarkAsRead, handleMarkAllAsRead } = useNotifications();

  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortType,
    setSortType,
    sortedComplaints,
  } = useComplaintFilters(complaints, currentUser);

  const { isOpen, complaintToAssign, assignedAdminId, open, close, handleAssign } = useAssignModal({
    assignFn: complaintService.assign,
    onAssignSuccess: (updated) =>
      setComplaints((prev) => prev.map((c) => (c._id === updated._id ? updated : c))),
  });

  const [activeTab, setActiveTab] = useState<'complaints' | 'users'>('complaints');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserData | null>(null);

  useEffect(() => {
    if (currentUser) refresh();
  }, [currentUser]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await complaintService.updateStatus(id, status);
      setComplaints((prev) => prev.map((c) => (c._id === id ? updated : c)));
      await refresh();
    } catch {
      alert('Failed to update complaint status.');
    }
  };

  const openEditUserModal = (user: UserData) => {
    setUserToEdit(user);
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setUserToEdit(null);
  };

  const openDeleteConfirmation = (user: UserData) => {
    const confirmed = window.confirm(`Delete ${user.name}?`);
    if (confirmed) handleDeleteUser(user);
  };

  const handleDeleteUser = async (user: UserData) => {
    try {
      await userService.deleteUser(user._id!);
      setAllUsers((prev) => prev.filter((u) => u._id !== user._id));
    } catch {
      alert('Failed to delete user.');
    }
  };

  const handleSaveUser = async (updatedUser: UserData) => {
    let saved;

    if (updatedUser._id) {
      saved = await userService.updateUser(updatedUser._id, updatedUser);
      setAllUsers((prev) => prev.map((u) => (u._id === saved._id ? saved : u)));
    } else {
      saved = await userService.createUser(updatedUser);
      setAllUsers((prev) => [saved, ...prev]);
    }

    return saved;
  };

  const filteredUsers = filterUsers(allUsers, userSearchTerm);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/40">
      {/* header */}
      <DashboardHeader
        title="Super Admin Dashboard"
        subtitle="Global management of complaints, users, and admins"
        user={currentUser ? { role: currentUser.role, category: currentUser.category ?? undefined } : null}
        onLogout={logoutUser}
        onOpenNotificationModal={() => setShowNotificationModal(true)}
      />

      {/* body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        {/* main */}
        <div className="lg:col-span-2 space-y-6">
          {/* stats */}
          <ComplaintStatsSection
            complaints={complaints}
            colors={{
              total: 'from-slate-500 to-indigo-600',
              pending: 'from-yellow-500 to-orange-500',
              inProgress: 'from-cyan-500 to-blue-500',
              resolved: 'from-green-500 to-emerald-600',
              rejected: 'from-red-500 to-pink-600',
            }}
          />

          {/* tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('complaints')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'complaints'
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Settings className="w-4 h-4" />
                  Complaints
                </div>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
                  activeTab === 'users'
                    ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Users
                </div>
              </button>
            </div>

            {/* complaints tab */}
            {activeTab === 'complaints' && (
              <div className="p-6 space-y-6">
                {/* filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search complaints..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>

                  <select
                    value={sortType}
                    onChange={(e) => setSortType(e.target.value as SortType)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="votes">Highest Votes</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>

                {/* complaint cards */}
                <div className="space-y-4">
                  {sortedComplaints.length > 0 ? (
                    sortedComplaints.map((complaint) => (
                      <ComplaintCard
                        key={complaint._id}
                        complaint={complaint}
                        currentUserId={currentUser?._id ?? ''}
                        currentUserRole={currentUser?.role}
                        showAdminControls
                        onStatusChange={handleStatusChange}
                        onAssign={() => open(complaint)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-gray-500">No complaints found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* users tab */}
            {activeTab === 'users' && (
              <div className="p-6">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  />
                </div>

                <ViewUserManagementModel
                  users={filteredUsers}
                  complaints={complaints}
                  loading={usersLoading}
                  currentUserId={currentUser?._id}
                  currentUserRole={currentUser?.role}
                  onEdit={openEditUserModal}
                  onDelete={openDeleteConfirmation}
                  onAddUser={() => {
                    setUserToEdit(null);
                    setShowUserModal(true);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* notifications */}
        <div className="lg:col-span-1">
          <div className="sticky top-28">
            <NotificationPanel
              notifications={notifications}
              currentUserId={currentUser?._id}
              onMarkAsRead={handleMarkAsRead}
              onMarkAllAsRead={handleMarkAllAsRead}
            />
          </div>
        </div>
      </div>

      {/* notification modal */}
      <SystemNotificationModal
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSend={refresh}
        users={allUsers}
      />

      {/* assign admin */}
      <AssignAdmin
        isOpen={isOpen}
        onClose={close}
        onAssign={handleAssign}
        currentAssigned={assignedAdminId}
        complaintDomain={complaintToAssign?.domain || ''}
      />

      {/* user management modal */}
      <UserManagementModal
        isOpen={showUserModal}
        onClose={closeUserModal}
        userToEdit={userToEdit}
        onSaveUser={handleSaveUser}
      />
    </div>
  );
};

export default SuperAdminDashboard;