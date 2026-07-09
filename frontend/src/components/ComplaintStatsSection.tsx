import React from 'react';

import StatsGrid
  from './StatsGrid';

interface ComplaintStatsSectionProps {
  complaints: any[];

  colors?: {
    total?: string;

    pending?: string;

    inProgress?: string;

    resolved?: string;

    rejected?: string;
  };
}

const ComplaintStatsSection: React.FC<
  ComplaintStatsSectionProps
> = ({
  complaints,
  colors = {},
}) => {
  const stats = [
    {
      label:
        'Total Complaints',

      value:
        complaints.length,

      color:
        colors.total ||
        'from-blue-500 to-indigo-600',
    },

    {
      label:
        'Pending',

      value:
        complaints.filter(
          (
            c
          ) =>
            c.status ===
            'pending'
        ).length,

      color:
        colors.pending ||
        'from-yellow-500 to-orange-500',
    },

    {
      label:
        'In Progress',

      value:
        complaints.filter(
          (
            c
          ) =>
            c.status ===
            'in-progress'
        ).length,

      color:
        colors.inProgress ||
        'from-cyan-500 to-blue-500',
    },

    {
      label:
        'Resolved',

      value:
        complaints.filter(
          (
            c
          ) =>
            c.status ===
            'resolved'
        ).length,

      color:
        colors.resolved ||
        'from-green-500 to-emerald-600',
    },

    {
      label:
        'Rejected',

      value:
        complaints.filter(
          (
            c
          ) =>
            c.status ===
            'rejected'
        ).length,

      color:
        colors.rejected ||
        'from-red-500 to-pink-600',
    },
  ];

  return (
    <StatsGrid
      stats={stats}
    />
  );
};

export default ComplaintStatsSection;