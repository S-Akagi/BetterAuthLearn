import { create } from 'zustand';
import { authClient } from './auth';

// ========================================
// 型定義
// ========================================
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
  // 状態
  user: User | null;
  isLoading: boolean;
  notifications: Notification[];
  
  // 通知アクション
  addNotification: (message: string, type: 'success' | 'error') => void;
  removeNotification: (id: string) => void;
  
  // 認証アクション
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  
  // 内部アクション
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

// ========================================
// ヘルパー関数
// ========================================
// 通知作成
const createNotification = (message: string, type: 'success' | 'error'): Notification => ({
  id: Date.now().toString(),
  message,
  type,
});

// 認証成功ハンドリング
const handleAuthSuccess = (user: User, message: string, set: any) => {
  set({ user });
  useAuthStore.getState().addNotification(message, 'success');
};

// 認証エラーハンドリング
const handleAuthError = (error: any, fallbackMessage: string) => {
  const errorMessage = error?.message || fallbackMessage;
  useAuthStore.getState().addNotification(errorMessage, 'error');
  throw new Error(errorMessage);
};

// ========================================
// Zustand ストア
// ========================================
export const useAuthStore = create<AuthState>((set) => ({
  // 初期状態
  user: null,
  isLoading: true,
  notifications: [],

  // ========================================
  // 通知管理
  // ========================================
  addNotification: (message, type) => {
    const notification = createNotification(message, type);
    
    set((state) => ({
      notifications: [...state.notifications, notification]
    }));
    
    // 3秒後に自動削除
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== notification.id)
      }));
    }, 3000);
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },

  // ========================================
  // 認証処理
  // ========================================

  // サインイン
  signIn: async (email, password) => {
    const { data, error } = await authClient.signIn.email({
      email,
      password,
      rememberMe: true,
    });
    
    console.log("Sign-in response:", { data, error });
    
    if (error) {
      handleAuthError(error, 'サインインに失敗しました');
      return;
    }
    
    if (data?.user) {
      handleAuthSuccess(data.user, 'サインインしました', set);
    }
  },

  // サインアップ
  signUp: async (email, password, name) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    });
    
    console.log("Sign-up response:", { data, error });
    
    if (error) {
      handleAuthError(error, 'アカウント作成に失敗しました');
      return;
    }
    
    if (data?.user) {
      handleAuthSuccess(data.user, 'アカウントを作成しました', set);
    }
  },

  // サインアウト
  signOut: async () => {
    const { data, error } = await authClient.signOut();
    
    console.log("Sign-out response:", { data, error });
    
    if (error) {
      handleAuthError(error, 'サインアウトに失敗しました');
      return;
    }
    
    set({ user: null });
    useAuthStore.getState().addNotification('サインアウトしました', 'success');
  },

  // セッション確認
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

  // ========================================
  // 内部アクション
  // ========================================
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));