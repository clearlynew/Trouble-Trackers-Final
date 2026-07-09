export interface ComplaintData {
  _id: string;

  title: string;

  description: string;

  domain: string;

  status: string;

  votes: number;

  assignedTo?: string | null;

  submittedBy: string;

  createdAt: string;

  votedBy?: string[];

  images?: string[];
}

export interface UserData {
  _id: string;

  name: string;

  email: string;

  role:
    | 'admin'
    | 'student'
    | 'superadmin';

  category?: string | null;
}

export type SortType =
  | 'votes'
  | 'newest'
  | 'oldest';

export type StatusFilterType =
  | 'all'
  | 'pending'
  | 'in-progress'
  | 'resolved'
  | 'rejected';

// filter complaints

export const filterComplaints =
  (
    complaints: ComplaintData[],
    options: {
      searchTerm?: string;

      statusFilter?: StatusFilterType;

      currentUser?: UserData | null;
    }
  ) => {
    const {
      searchTerm = '',
      statusFilter = 'all',
      currentUser,
    } = options;

    return complaints.filter(
      (complaint) => {
        // admin sees only own category

        if (
          currentUser?.role ===
            'admin' &&
          currentUser.category
        ) {
          if (
            complaint.domain !==
            currentUser.category
          ) {
            return false;
          }
        }

        // status filter

        const matchesStatus =
          statusFilter ===
            'all' ||
          complaint.status ===
            statusFilter;

        if (
          !matchesStatus
        ) {
          return false;
        }

        // search

        const search =
          searchTerm.toLowerCase();

        return (
          complaint.title
            .toLowerCase()
            .includes(
              search
            ) ||
          complaint.description
            .toLowerCase()
            .includes(
              search
            ) ||
          complaint.domain
            .toLowerCase()
            .includes(
              search
            )
        );
      }
    );
  };

// sort complaints

export const sortComplaints =
  (
    complaints: ComplaintData[],
    sortType: SortType
  ) => {
    return [
      ...complaints,
    ].sort((a, b) => {
      const votesA =
        a.votes ?? 0;

      const votesB =
        b.votes ?? 0;

      const dateA =
        new Date(
          a.createdAt
        ).getTime();

      const dateB =
        new Date(
          b.createdAt
        ).getTime();

      if (
        sortType ===
        'votes'
      ) {
        if (
          votesB !==
          votesA
        ) {
          return (
            votesB -
            votesA
          );
        }

        return (
          dateB - dateA
        );
      }

      if (
        sortType ===
        'newest'
      ) {
        return (
          dateB - dateA
        );
      }

      if (
        sortType ===
        'oldest'
      ) {
        return (
          dateA - dateB
        );
      }

      return 0;
    });
  };

// complaint stats

export const getComplaintStats =
  (
    complaints: ComplaintData[]
  ) => {
    return {
      total:
        complaints.length,

      pending:
        complaints.filter(
          (c) =>
            c.status ===
            'pending'
        ).length,

      inProgress:
        complaints.filter(
          (c) =>
            c.status ===
            'in-progress'
        ).length,

      resolved:
        complaints.filter(
          (c) =>
            c.status ===
            'resolved'
        ).length,

      rejected:
        complaints.filter(
          (c) =>
            c.status ===
            'rejected'
        ).length,
    };
  };