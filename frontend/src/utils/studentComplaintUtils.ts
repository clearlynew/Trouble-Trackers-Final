export const filterStudentComplaints =
  ({
    complaints,
    statusFilter,
    domainFilter,
    currentUserId,
  }: any) => {
    const filtered =
      complaints.filter(
        (c: any) =>
          (statusFilter ===
            'all' ||
            c.status ===
              statusFilter) &&
          (domainFilter ===
            'all' ||
            c.domain ===
              domainFilter)
      );

    return {
      ownComplaints:
        filtered.filter(
          (c: any) =>
            c.submittedBy ===
            currentUserId
        ),

      communityComplaints:
        filtered.filter(
          (c: any) =>
            c.submittedBy !==
            currentUserId
        ),
    };
  };