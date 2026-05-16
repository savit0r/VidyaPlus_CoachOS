import { create } from 'zustand';
import type { AuthUser } from '@coachos/ui';
import api from '../lib/api';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  instituteName: string;
  photoUrl: string | null;
}

interface StudentAuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  sendLoginOtp: (email: string) => Promise<void>;
  verifyLoginOtp: (email: string, otp: string) => Promise<{ type: 'authenticated' | 'select_profile', profiles?: UserProfile[], sessionToken?: string }>;
  selectProfile: (sessionToken: string, userId: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<StudentAuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  sendLoginOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/otp/send-login', { email, portal: 'student' });
      set({ isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to send OTP';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyLoginOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/otp/verify-login', { email, otp, portal: 'student' });
      const result = data.data;

      if (result.type === 'authenticated') {
        const { accessToken, refreshToken, user } = result;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
        return { type: 'authenticated' };
      }

      set({ isLoading: false });
      return {
        type: 'select_profile',
        profiles: result.profiles,
        sessionToken: result.sessionToken,
      };
    } catch (err: any) {
      const message = err.response?.data?.error || 'Invalid OTP';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  selectProfile: async (sessionToken, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/otp/select-profile', { sessionToken, userId });
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to select profile';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
