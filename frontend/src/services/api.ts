import axios from 'axios';

// Single authoritative Axios instance for the entire application
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Crucial: Transmits httpOnly cookies securely over cross-origins
});

// Request Interceptor: Automatically inject access tokens to outgoing traffic
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Intercept 401s, fetch a fresh access token, and transparently retry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Run retry only if it's a 401 Unauthorized error and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Block infinite execution loops if refresh token is dead

      try {
        // Execute refresh using standard axios to sidestep circular request logic hooks
        const refreshResponse = await axios.post(
          'http://localhost:5000/api/auth/refresh',
          {},
          { withCredentials: true }
        );

        const { accessToken } = refreshResponse.data;

        if (accessToken) {
          // 1. Sync updated credential into storage
          localStorage.setItem('token', accessToken);

          // 2. Patch authorization context for the deferred transaction
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // 3. Retry the request with the shared configured instance
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Refresh token expired or invalid. Evicting active session.');
        
        // Clear broken local storage profiles to sync app auth states instantly
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);