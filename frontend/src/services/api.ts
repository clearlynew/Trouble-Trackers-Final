import axios from 'axios';

// Single authoritative Axios instance for the entire application
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  withCredentials: true,
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically inject access tokens to outgoing traffic
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', `Bearer ${token}`);
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        if (accessToken) {
          localStorage.setItem('token', accessToken);

          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === 'function') {
              originalRequest.headers.set(
                'Authorization',
                `Bearer ${accessToken}`
              );
            } else {
              originalRequest.headers.Authorization =
                `Bearer ${accessToken}`;
            }
          }

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error(
          'Refresh token expired or invalid. Evicting active session.'
        );

        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');

        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }

    return Promise.reject(error);
  }
);