import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';

import ComplaintSubmissionModal from '../components/ComplaintSubmissionModal';
import NotificationPanel from '../components/NotificationPanel';
import DashboardHeader from '../components/DashboardHeader';
import ComplaintSection from '../components/ComplaintSection';
import ComplaintStatsSection from '../components/ComplaintStatsSection';

import complaintService from '../services/complaintService';

import { sortComplaints } from '../utils/complaintUtils';
import type { SortType, StatusFilterType } from '../utils/complaintUtils';
import { logoutUser } from '../utils/authUtils';
import { voteComplaint } from '../utils/voteUtils';
import { filterStudentComplaints } from '../utils/studentComplaintUtils';

import { useDashboardData } from '../hooks/useDashboardData';
import { useNotifications } from '../hooks/useNotifications';

const DOMAIN_OPTIONS = [
  'all',
  'Maintenance',
  'Cleanliness',
  'Food',
  'Internet',
  'Security',
] as const;

type DomainFilterType = typeof DOMAIN_OPTIONS[number];

const StudentDashboard = () => {
  const {
    currentUser,
    complaints: allComplaints,
    setComplaints: setAllComplaints,
  } = useDashboardData({ requiredRole: 'student' });

  const { notifications, refresh, handleMarkAsRead, handleMarkAllAsRead } = useNotifications();

  useEffect(() => {
    if (currentUser) refresh();
  }, [currentUser]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortType, setSortType] = useState<SortType>('votes');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  const [domainFilter, setDomainFilter] = useState<DomainFilterType>('all');

  const fetchComplaints = async () => {
    try {
      const complaints = await complaintService.getAll();
      setAllComplaints(complaints);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    }
  };

  const handleComplaintSubmitted = () => {
    setIsModalOpen(false);
    fetchComplaints();
  };

  const handleVote = async (id: string) => {
    if (!currentUser) return;

    const success = await voteComplaint({
      complaintId: id,
      userId: currentUser._id,
      complaints: allComplaints,
      setComplaints: setAllComplaints,
    });

    if (!success) alert('Voting failed. Please try again.');
  };

  const { ownComplaints, communityComplaints } = filterStudentComplaints({
    complaints: allComplaints,
    statusFilter,
    domainFilter,
    currentUserId: currentUser?._id,
  });

  const sortedOwnComplaints = sortComplaints(ownComplaints, sortType);
  const sortedOtherComplaints = sortComplaints(communityComplaints, sortType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* header */}
      <DashboardHeader
        title="Student Dashboard"
        subtitle="Track and manage your complaints"
        user={currentUser}
        onLogout={logoutUser}
      />

      {/* body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid lg:grid-cols-3 gap-8">
        {/* left */}
        <div className="lg:col-span-2 space-y-6">
          {/* submit button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Submit Complaint
          </button>

          {/* stats */}
          <ComplaintStatsSection
            complaints={allComplaints}
            colors={{
              total: 'from-blue-500 to-indigo-600',
              pending: 'from-yellow-500 to-orange-500',
              inProgress: 'from-cyan-500 to-blue-500',
              resolved: 'from-green-500 to-emerald-600',
              rejected: 'from-red-500 to-pink-600',
            }}
          />

          {/* filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value as DomainFilterType)}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="all">All Domains</option>
              {DOMAIN_OPTIONS.filter((d) => d !== 'all').map((domain) => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
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
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              <option value="votes">Highest Votes</option>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* own complaints */}
          <ComplaintSection
            title="Your Complaints"
            count={sortedOwnComplaints.length}
            complaints={sortedOwnComplaints}
            currentUserId={currentUser?._id}
            onVote={handleVote}
            badgeColor="bg-emerald-100 text-emerald-700"
            emptyEmoji="📝"
            emptyTitle="No complaints found"
            emptySubtitle="Submit a complaint or adjust filters"
          />

          {/* community complaints */}
          <ComplaintSection
            title="Community Complaints"
            count={sortedOtherComplaints.length}
            complaints={sortedOtherComplaints}
            currentUserId={currentUser?._id}
            onVote={handleVote}
            badgeColor="bg-blue-100 text-blue-700"
            emptyEmoji="📭"
            emptyTitle="No community complaints"
            emptySubtitle="Check back later"
          />
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

      {/* submit modal */}
      <ComplaintSubmissionModal
        isOpen={isModalOpen}
        onClose={handleComplaintSubmitted}
      />
    </div>
  );
};

export default StudentDashboard;