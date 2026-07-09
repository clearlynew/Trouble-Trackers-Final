import { api } from './api';

// login handler
const login = async (email: string, password: string) => {
  try {
    const res = await api.post('/auth/login', { email, password });
    const data = res.data;

    // FIX: Extract backend 'accessToken' mapping field correctly
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);

      if (data.user?._id) {
        localStorage.setItem('userId', data.user._id);
      }

      if (data.user?.role) {
        localStorage.setItem('userRole', data.user.role);
      }
    }

    return data;
  } catch (error: any) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('An unexpected error occurred. Please try again later.');
  }
};

// logout handler
const logout = async () => {
  try {
    // Notify server to safely destroy httpOnly cookies
    await api.post('/auth/logout');
  } catch (err) {
    console.error('Failed to clear cookie session on backend.', err);
  } finally {
    // Always wipe client data profiles regardless of network response
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
  }
};

// current user getter
const getCurrentUser = () => {
  return {
    token: localStorage.getItem('token'),
    userId: localStorage.getItem('userId'),
    role: localStorage.getItem('userRole'),
  };
};

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;