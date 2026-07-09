import complaintService
  from '../services/complaintService';

export const voteComplaint =
  async ({
    complaintId,
    userId,
    complaints,
    setComplaints,
  }: any) => {
    const currentComplaint =
      complaints.find(
        (c: any) =>
          c._id ===
          complaintId
      );

    const votedByArray =
      currentComplaint?.votedBy ||
      [];

    const hasVoted =
      votedByArray.includes(
        userId
      );

    try {
      await complaintService.voteComplaint(
        complaintId,
        userId
      );

      setComplaints(
        (prev: any[]) =>
          prev.map(
            (c: any) => {
              if (
                c._id !==
                complaintId
              )
                return c;

              return {
                ...c,

                votes:
                  (
                    c.votes ||
                    0
                  ) +
                  (hasVoted
                    ? -1
                    : 1),

                votedBy:
                  hasVoted
                    ? (
                        c.votedBy ||
                        []
                      ).filter(
                        (
                          voterId: string
                        ) =>
                          voterId !==
                          userId
                      )
                    : [
                        ...(c.votedBy ||
                          []),
                        userId,
                      ],
              };
            }
          )
      );

      return true;
    } catch (err) {
      console.error(
        'Failed to register vote:',
        err
      );

      return false;
    }
  };