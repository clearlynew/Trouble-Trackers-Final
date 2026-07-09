import { api } from '../services/api';

export const logoutUser = async () => {
  try {
    // Force clean the HttpOnly cookie context from browser storage pools
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Failed to notify backend about logout session cleanup:', err);
  } finally {
    // Always wipe client-side local tokens regardless of network state success
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');

    // Route the visitor back to your authentication landing gateway
    window.location.href = '/';
  }
};

export const getCurrentAuth = () => {
  return {
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    userRole: localStorage.getItem('userRole'),
  };
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const hasRole = (allowedRoles: string[]) => {
  const role = localStorage.getItem('userRole');
  return !!role && allowedRoles.includes(role);
};