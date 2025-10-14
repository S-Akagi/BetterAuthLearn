import { create } from 'zustand';
import { authClient } from './auth';

interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  signIn: async (email, password) => {
    try {
      const response = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });
      console.log("Sign-in response:", response.data);
      if (response.data?.user) {
        set({ user: response.data.user });
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  },

  signUp: async (email, password, name) => {
    try {
      const response = await authClient.signUp.email({
        email,
        password,
        name,
      });
      console.log("Sign-up response:", response.data);
      if (response.data?.user) {
        set({ user: response.data.user });
      }
    } catch (error) {
      console.error("Error during sign-up:", error);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await authClient.signOut();
      set({ user: null });
      console.log("Signed out successfully");
    } catch (error) {
      console.error("Error during sign-out:", error);
      throw error;
    }
  },

  checkSession: async () => {
    try {
      const { data } = await authClient.getSession();
      if (data?.user) {
        set({ user: data.user });
      }
    } catch (error) {
      console.error("Error checking session:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));