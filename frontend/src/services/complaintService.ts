import axios from 'axios';

const API_URL =
  'http://localhost:5000/api/complaints';

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

const ComplaintService = {
  // get complaints

  getAll: async () => {
    const res =
      await api.get('/');

    return res.data;
  },

  // submit complaint

  submitComplaint: async (
    complaint: any
  ) => {
    try {
      const res =
        await api.post(
          '/',
          complaint
        );

      return res.data;
    } catch (error) {
      if (
        axios.isAxiosError(
          error
        ) &&
        error.response
      ) {
        const status =
          error.response
            .status;

        const message =
          error.response
            .data
            ?.message;

        // daily limit

        if (
          status === 429
        ) {
          throw new Error(
            message ||
              'You have reached your daily complaint limit.'
          );
        }

        // duplicate complaint

        if (
          status === 409
        ) {
          throw new Error(
            message ||
              'A very similar complaint was recently submitted.'
          );
        }

        // other backend errors

        if (message) {
          throw new Error(
            message
          );
        }
      }

      throw new Error(
        'Failed to submit complaint due to an unknown error.'
      );
    }
  },

  // update status

  updateStatus:
    async (
      id: string,
      status: string
    ) => {
      const res =
        await api.put(
          `/${id}/status`,
          {
            status,
          }
        );

      return res.data;
    },

  // assign admin

  assign: async (
    id: string,
    assignee: string
  ) => {
    const res =
      await api.put(
        `/${id}/assign`,
        {
          assignee,
        }
      );

    return res.data;
  },

  // delete complaint

  delete: async (
    id: string
  ) => {
    await api.delete(
      `/${id}`
    );

    return true;
  },

  // vote complaint

  voteComplaint:
    async (
      id: string,
      userId: string
    ) => {
      const res =
        await api.patch(
          `/${id}/vote`,
          { userId }
        );

      return res.data;
    },
};

export default ComplaintService;

// named exports

export const {
  submitComplaint,
  voteComplaint,
} = ComplaintService;