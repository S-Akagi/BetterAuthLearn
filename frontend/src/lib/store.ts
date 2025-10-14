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

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (message: string, type: 'success' | 'error') => void;
  removeNotification: (id: string) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  notifications: [],

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  addNotification: (message, type) => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 3000);
  },

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  signIn: async (email, password) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    });
    
    console.log("Sign-in response:", { data, error });
    
    if (error) {
      const errorMessage = error.message || 'サインインに失敗しました';
      useAuthStore.getState().addNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    
    if (data?.user) {
      set({ user: data.user });
      useAuthStore.getState().addNotification('サインインしました', 'success');
    }
  },

  signUp: async (email, password, name) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    
    console.log("Sign-up response:", { data, error });
    
    if (error) {
      const errorMessage = error.message || 'アカウント作成に失敗しました';
      useAuthStore.getState().addNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    
    if (data?.user) {
      set({ user: data.user });
      useAuthStore.getState().addNotification('アカウントを作成しました', 'success');
    }
  },

  signOut: async () => {
    const { data, error } = await authClient.signOut();
    
    console.log("Sign-out response:", { data, error });
    
    if (error) {
      const errorMessage = error.message || 'サインアウトに失敗しました';
      useAuthStore.getState().addNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
    
    set({ user: null });
    useAuthStore.getState().addNotification('サインアウトしました', 'success');
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