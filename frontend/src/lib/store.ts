import { create } from 'zustand'
import { authClient } from './auth'
import type { User, Organization, Notification, OrganizationForm } from '../types/auth'

interface AuthState {
  // 状態
  user: User | null
  organizations?: Organization[] | null
  isLoading: boolean
  notifications: Notification[]

  // 通知アクション
  addNotification: (message: string, type: 'success' | 'error') => void
  removeNotification: (id: string) => void

  // 認証アクション
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  checkSession: () => Promise<void>

  // 組織アクション
  createOrg: (form: Omit<OrganizationForm, 'logo' | 'metadata'> & Partial<Pick<OrganizationForm, 'logo' | 'metadata'>>, keepCurrentActiveOrganization?: boolean) => Promise<void>

  // 内部アクション
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

// ========================================
// ヘルパー関数
// ========================================
// 通知作成
const createNotification = (message: string, type: 'success' | 'error'): Notification => ({
  id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  message,
  type,
})

// 認証成功ハンドリング
const handleAuthSuccess = (user: User, message: string, set: (state: Partial<AuthState>) => void) => {
  set({ user })
  useAuthStore.getState().addNotification(message, 'success')
}

// 認証エラーハンドリング
const handleAuthError = (error: Error | { message?: string }, fallbackMessage: string) => {
  const errorMessage = error?.message || fallbackMessage
  useAuthStore.getState().addNotification(errorMessage, 'error')
  throw new Error(errorMessage)
}

// 組織一覧取得
const fetchOrganizations = async (set: (state: Partial<AuthState>) => void) => {
  const { data, error } = await authClient.organization.list()
  if (error) {
    handleAuthError(error, '組織情報の取得に失敗しました')
    return
  }
  set({ organizations: data || null })
}

// ========================================
// Zustand ストア
// ========================================
export const useAuthStore = create<AuthState>((set) => ({
  // 初期状態
  user: null,
  organizations: null,
  isLoading: true,
  notifications: [],

  // ========================================
  // 通知管理
  // ========================================
  addNotification: (message, type) => {
    const notification = createNotification(message, type)

    set((state) => ({
      notifications: [...state.notifications, notification],
    }))

    // 3秒後に自動削除
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== notification.id),
      }))
    }, 3000)
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
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
    })

    console.log('Sign-in response:', { data, error })

    if (error) {
      handleAuthError(error, 'サインインに失敗しました')
      return
    }

    if (data?.user) {
      handleAuthSuccess(data.user, 'サインインしました', set)
      fetchOrganizations(set)
    }
  },

  // サインアップ
  signUp: async (email, password, name) => {
    const { data, error } = await authClient.signUp.email({
      email,
      password,
      name,
    })

    console.log('Sign-up response:', { data, error })

    if (error) {
      handleAuthError(error, 'アカウント作成に失敗しました')
      return
    }

    if (data?.user) {
      handleAuthSuccess(data.user, 'アカウントを作成しました', set)
    }
  },

  // サインアウト
  signOut: async () => {
    const { data, error } = await authClient.signOut()

    console.log('Sign-out response:', { data, error })

    if (error) {
      handleAuthError(error, 'サインアウトに失敗しました')
      return
    }

    set({ user: null })
    useAuthStore.getState().addNotification('サインアウトしました', 'success')
  },

  // 組織アクション
  // 組織作成
  createOrg: async (form, keepCurrentActiveOrganization?) => {
    const { data, error } = await authClient.organization.create({
      ...form,
      keepCurrentActiveOrganization,
    })

    console.log('Create-Org response:', { data, error })

    if (error) {
      handleAuthError(error, '組織作成に失敗しました')
      return
    }

    if (data) {
      useAuthStore.getState().addNotification(`組織「${data.name}」を作成しました`, 'success')
      console.log('Created organization:', data)
      fetchOrganizations(set)
    }
  },

  // セッション確認
  checkSession: async () => {
    try {
      const { data } = await authClient.getSession()

      if (data?.user) {
        set({ user: data.user })
        fetchOrganizations(set)
      }
    } catch (error) {
      console.error('Error checking session:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  // ========================================
  // 内部アクション
  // ========================================
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}))
