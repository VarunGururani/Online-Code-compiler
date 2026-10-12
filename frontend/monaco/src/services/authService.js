import { api, getIsDemoMode } from './api';
import { MOCK_USER } from '../utils/mockData';

export const authService = {
  async register(data) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        user: {
          ...MOCK_USER,
          name: data.name || MOCK_USER.name,
          email: data.email,
        },
        message: 'Account created successfully (Sandbox Mode)',
      };
    }
    const res = await api.post('/auth/register', data);
    return res.data;
  },

  async login(credentials) {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 600));
      return {
        user: {
          ...MOCK_USER,
          email: credentials.email || MOCK_USER.email,
        },
        message: 'Signed in successfully (Sandbox Mode)',
      };
    }
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async logout() {
    if (getIsDemoMode()) {
      await new Promise((r) => setTimeout(r, 300));
      return { success: true };
    }
    const res = await api.post('/auth/logout');
    return res.data;
  },

  async getMe() {
    if (getIsDemoMode()) {
      return { user: MOCK_USER };
    }
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export default authService;
