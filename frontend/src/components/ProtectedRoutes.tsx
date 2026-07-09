import React from 'react';

import {
  Navigate,
  Outlet,
} from 'react-router-dom';

const ProtectedRoute = ({
  allowedRoles,
}) => {
  // authentication

  const token =
    localStorage.getItem(
      'token'
    );

  // authorization

  const userRole =
    localStorage.getItem(
      'userRole'
    );

  // not logged in

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // logged in but wrong role

  if (
    allowedRoles &&
    !allowedRoles.includes(
      userRole
    )
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  // authenticated + authorized

  return <Outlet />;
};

export default ProtectedRoute;