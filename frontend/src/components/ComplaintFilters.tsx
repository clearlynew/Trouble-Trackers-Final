import React from 'react';

import {
  Search,
  TrendingUp,
  Clock,
  List,
} from 'lucide-react';

import type {
  SortType,
  StatusFilterType,
} from '../utils/complaintUtils';

interface ComplaintFiltersProps {
  searchTerm: string;

  setSearchTerm: (
    value: string
  ) => void;

  statusFilter: StatusFilterType;

  setStatusFilter: (
    value: StatusFilterType
  ) => void;

  sortType: SortType;

  setSortType: (
    value: SortType
  ) => void;
}

const ComplaintFilters: React.FC<
  ComplaintFiltersProps
> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  sortType,
  setSortType,
}) => {
  const renderSortIcon =
    () => {
      switch (
        sortType
      ) {
        case 'votes':
          return (
            <TrendingUp className="w-4 h-4" />
          );

        case 'newest':
          return (
            <Clock className="w-4 h-4" />
          );

        case 'oldest':
          return (
            <List className="w-4 h-4" />
          );

        default:
          return (
            <List className="w-4 h-4" />
          );
      }
    };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border mb-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* search */}

        <div className="relative">
          <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

          <input
            type="text"
            placeholder="Search complaints..."
            value={
              searchTerm
            }
            onChange={(
              e
            ) =>
              setSearchTerm(
                e.target
                  .value
              )
            }
            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* status */}

        <select
          value={
            statusFilter
          }
          onChange={(
            e
          ) =>
            setStatusFilter(
              e.target
                .value as StatusFilterType
            )
          }
          className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">
            All Status
          </option>

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

        {/* sort */}

        <button
          onClick={() => {
            const nextSortType: SortType =
              sortType === 'votes'
                ? 'newest'
                : sortType === 'newest'
                ? 'oldest'
                : 'votes';

            setSortType(nextSortType);
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          {renderSortIcon()}

          <span className="capitalize">
            Sort:{' '}
            {sortType}
          </span>
        </button>
      </div>
    </div>
  );
};

export default ComplaintFilters;