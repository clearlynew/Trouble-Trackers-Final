export const logoutUser =
  () => {
    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'userId'
    );

    localStorage.removeItem(
      'userRole'
    );

    window.location.href =
      '/';
  };

export const getCurrentAuth =
  () => {
    return {
      token:
        localStorage.getItem(
          'token'
        ),

      userId:
        localStorage.getItem(
          'userId'
        ),

      userRole:
        localStorage.getItem(
          'userRole'
        ),
    };
  };

export const isAuthenticated =
  () => {
    return !!localStorage.getItem(
      'token'
    );
  };

export const hasRole =
  (
    allowedRoles: string[]
  ) => {
    const role =
      localStorage.getItem(
        'userRole'
      );

    return (
      !!role &&
      allowedRoles.includes(
        role
      )
    );
  };