import axios from 'axios';

const API_URL =
  'http://localhost:5000/api/auth';

// axios instance

const api = axios.create({
  baseURL: API_URL,
});

// attach token automatically

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        'token'
      );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// login

const login = async (
  email: string,
  password: string
) => {
  try {
    const res =
      await api.post(
        '/login',
        {
          email,
          password,
        }
      );

    const data =
      res.data;

    // store auth consistently

    if (data.token) {
      localStorage.setItem(
        'token',
        data.token
      );

      if (
        data.user?._id
      ) {
        localStorage.setItem(
          'userId',
          data.user._id
        );
      }

      if (
        data.user?.role
      ) {
        localStorage.setItem(
          'userRole',
          data.user.role
        );
      }
    }

    return data;
  } catch (error: any) {
    if (
      error.response &&
      error.response.data &&
      error.response.data.message
    ) {
      throw new Error(
        error.response
          .data.message
      );
    }

    throw new Error(
      'An unexpected error occurred. Please try again later.'
    );
  }
};

// logout

const logout = () => {
  localStorage.removeItem(
    'token'
  );

  localStorage.removeItem(
    'userId'
  );

  localStorage.removeItem(
    'userRole'
  );
};

// current user

const getCurrentUser =
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

      role:
        localStorage.getItem(
          'userRole'
        ),
    };
  };

const authService = {
  login,
  logout,
  getCurrentUser,
};

export default authService;