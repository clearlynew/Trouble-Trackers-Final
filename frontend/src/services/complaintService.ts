import { api } from './api';
import axios from 'axios';

const ComplaintService = {
  // get complaints
  getAll: async () => {
    const res = await api.get('/complaints');
    return res.data;
  },

  // submit complaint
  submitComplaint: async (complaint: any) => {
    try {
      const res = await api.post('/complaints', complaint);
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;

        if (status === 429) {
          throw new Error(message || 'You have reached your daily complaint limit.');
        }

        if (status === 409) {
          throw new Error(message || 'A very similar complaint was recently submitted.');
        }

        if (message) {
          throw new Error(message);
        }
      }
      throw new Error('Failed to submit complaint due to an unknown error.');
    }
  },

  // update status
  updateStatus: async (id: string, status: string) => {
    const res = await api.put(`/complaints/${id}/status`, { status });
    return res.data;
  },

  // assign admin
  assign: async (id: string, assignee: string) => {
    const res = await api.put(`/complaints/${id}/assign`, { assignee });
    return res.data;
  },

  // delete complaint
  delete: async (id: string) => {
    await api.delete(`/complaints/${id}`);
    return true;
  },

  // vote complaint
  voteComplaint: async (id: string, userId: string) => {
    const res = await api.patch(`/complaints/${id}/vote`, { userId });
    return res.data;
  },
};

export default ComplaintService;

// Preserve exact named structural exports
export const { submitComplaint, voteComplaint } = ComplaintService;