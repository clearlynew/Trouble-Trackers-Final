import { api } from './api';

interface UserPayload {
  name?: string;
  email?: string;
  role?: 'admin' | 'student' | 'superadmin';
  category?: string;
  room?: string;
  password?: string;
}

const UserService = {
  // get all users
  getAll: async () => {
    const res = await api.get('/users');
    return res.data;
  },

  // get user by id
  getById: async (id: string) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  // add user
  add: async (user: UserPayload) => {
    const res = await api.post('/users', user);
    return res.data;
  },

  // update user
  update: async (id: string, user: UserPayload) => {
    const res = await api.patch(`/users/${id}`, user);
    return res.data;
  },

  // delete user
  delete: async (id: string) => {
    await api.delete(`/users/${id}`);
    return true;
  },

  // toggle active status
  updateStatus: async (id: string) => {
    const res = await api.patch(`/users/${id}/toggle-status`);
    return res.data;
  },
};

export default UserService;

// Preserve downstream functional imports mappings
export const addUser = UserService.add;
export const getAll = UserService.getAll;
export const getById = UserService.getById;
export const updateUser = UserService.update;
export const deleteUser = UserService.delete;
export const updateUserStatus = UserService.updateStatus;
export const createUser = UserService.add;