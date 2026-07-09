export const filterUsers =
  (
    users: any[],
    searchTerm: string
  ) => {
    return users.filter(
      (u) =>
        u.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        u.email
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          ) ||
        u._id
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          )
    );
  };

// sort users

export const sortUsers =
  (
    users: any[],
    currentUserId?: string
  ) => {
    return [
      ...users,
    ].sort((a, b) => {
      // current user first

      if (
        currentUserId
      ) {
        if (
          a._id ===
          currentUserId
        )
          return -1;

        if (
          b._id ===
          currentUserId
        )
          return 1;
      }

      // role ordering

      const roleOrder = (
        user: any
      ) => {
        if (
          user.role ===
          'superadmin'
        )
          return 1;

        if (
          user.role ===
          'admin'
        )
          return 2;

        return 3;
      };

      if (
        roleOrder(a) !==
        roleOrder(b)
      ) {
        return (
          roleOrder(a) -
          roleOrder(b)
        );
      }

      // alphabetical

      return a.name.localeCompare(
        b.name
      );
    });
  };