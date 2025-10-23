import { authClient } from '../lib/auth'

// Better Authから型推論
export type User = typeof authClient.$Infer.Session.user
export type Session = typeof authClient.$Infer.Session
export type Member = typeof authClient.$Infer.Member
export type Organization = typeof authClient.$Infer.Organization
export type BaseInvitation = typeof authClient.$Infer.Invitation

// APIレスポンスで拡張される型
export type InvitationWithDetails = BaseInvitation & {
  organizationName: string
  organizationSlug: string
  inviterEmail: string
}

// listMembers APIのレスポンス型
export type MembersResponse = {
  members: Array<{
    user: {
      id: string
      name: string
      email: string
      image: string | null | undefined
    }
    id: string
    organizationId: string
    userId: string
    role: string
    createdAt: Date
  }>
  total: number
}

// 共通のフォーム型
export interface LoginForm {
  email: string
  password: string
}

export interface SignUpForm extends LoginForm {
  name: string
}

export interface OrganizationForm {
  name: string
  slug: string
  logo?: string
  metadata?: Record<string, unknown>
}

export interface InviteForm {
  email: string
  role: 'member' | 'admin' | 'owner'
}

// 通知システム
export interface Notification {
  id: string
  message: string
  type: 'success' | 'error'
}