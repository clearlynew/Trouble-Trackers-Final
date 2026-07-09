import axios from 'axios';

const API_URL =
  'http://localhost:5000/api/users';

// user payload

interface UserPayload {
  name?: string;

  email?: string;

  role?:
    | 'admin'
    | 'student'
    | 'superadmin';

  category?: string;

  room?: string;

  password?: string;
}

// axios instance

const api = axios.create({
  baseURL: API_URL,
});

// attach auth token

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

  (error) =>
    Promise.reject(error)
);

const UserService = {
  // get all users

  getAll: async () => {
    const res =
      await api.get('/');

    return res.data;
  },

  // get user by id

  getById: async (
    id: string
  ) => {
    const res =
      await api.get(
        `/${id}`
      );

    return res.data;
  },

  // add user

  add: async (
    user: UserPayload
  ) => {
    const res =
      await api.post(
        '/',
        user
      );

    return res.data;
  },

  // update user

  update: async (
    id: string,
    user: UserPayload
  ) => {
    const res =
      await api.patch(
        `/${id}`,
        user
      );

    return res.data;
  },

  // delete user

  delete: async (
    id: string
  ) => {
    await api.delete(
      `/${id}`
    );

    return true;
  },

  // toggle active status

  updateStatus:
    async (
      id: string
    ) => {
      const res =
        await api.patch(
          `/${id}/toggle-status`
        );

      return res.data;
    },
};

export default UserService;

// named exports

export const addUser =
  UserService.add;

export const getAll =
  UserService.getAll;

export const getById =
  UserService.getById;

export const updateUser =
  UserService.update;

export const deleteUser =
  UserService.delete;

export const updateUserStatus =
  UserService.updateStatus;

export const createUser =
  UserService.add;