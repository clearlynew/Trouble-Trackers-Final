// src/components/ComplaintSection.tsx

import React from 'react';

import ComplaintCard from './ComplaintCard';

interface ComplaintSectionProps {
  title: string;

  count: number;

  complaints: any[];

  currentUserId?: string;

  onVote?: (
    id: string
  ) => void;

  emptyTitle?: string;

  emptySubtitle?: string;

  emptyEmoji?: string;

  badgeColor?: string;
}

const ComplaintSection: React.FC<
  ComplaintSectionProps
> = ({
  title,
  count,
  complaints,
  currentUserId = '',
  onVote,
  emptyTitle = 'No complaints found',
  emptySubtitle = 'Try adjusting filters',
  emptyEmoji = '📝',
  badgeColor = 'bg-blue-100 text-blue-700',
}) => {
  return (
    <div>
      {/* section header */}

      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span>
          {title}
        </span>

        <span
          className={`text-sm font-semibold px-3 py-1 rounded-full ${badgeColor}`}
        >
          {count}
        </span>
      </h2>

      {/* content */}

      <div className="space-y-4">
        {complaints.length ===
        0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-3">
              {emptyEmoji}
            </div>

            <p className="text-gray-500 text-lg mb-2">
              {emptyTitle}
            </p>

            <p className="text-gray-400 text-sm">
              {
                emptySubtitle
              }
            </p>
          </div>
        ) : (
          complaints.map(
            (
              complaint
            ) => (
              <ComplaintCard
                key={
                  complaint._id
                }
                complaint={
                  complaint
                }
                currentUserId={
                  currentUserId
                }
                onVote={
                  onVote
                }
              />
            )
          )
        )}
      </div>
    </div>
  );
};

export default ComplaintSection;