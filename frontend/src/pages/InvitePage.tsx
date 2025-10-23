import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { authClient } from '../lib/auth'
import { useAuthStore } from '../lib/store'
import type { InviteForm } from '../types/auth'

export function InvitePage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteForm['role']>('member')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const emailId = useId()
  const roleId = useId()

  const { addNotification } = useAuthStore()
  
  // Better Authのリアクティブフック
  const { data: activeOrganization } = authClient.useActiveOrganization()

  // 招待送信
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activeOrganization) {
      addNotification('Select Active Organization', 'error')
      return
    }

    setIsLoading(true)
    
    try {
      const { data, error } = await authClient.organization.inviteMember({
        email,
        role,
        resend: true,
        organizationId: activeOrganization.id
      })

      if (error) {
        addNotification(`招待の送信に失敗しました: ${error.message}`, 'error')
        return
      }

      if (data) {
        addNotification(`${email} に招待を送信しました`, 'success')
        setEmail('')
        setRole('member')
      }
    } catch (error) {
      console.error('Error sending invitation:', error)
      addNotification('招待の送信に失敗しました', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link 
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h2 className="mb-6 font-bold text-2xl">Send Invitation</h2>

      {/* アクティブ組織表示 */}
      <div className="mb-8">
        {activeOrganization ? (
          <div className="rounded border bg-blue-50 p-4">
            <h3 className="font-semibold text-lg mb-2">Inviting to Organization</h3>
            <p className="text-blue-700">
              <strong>{activeOrganization.name}</strong> ({activeOrganization.slug})
            </p>
          </div>
        ) : (
          <div className="rounded border bg-yellow-50 p-4">
            <p className="text-yellow-700">
              ⚠️ You don't have an active organization.
              <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 underline ml-1">
                Choose one on the dashboard.
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* 招待フォーム */}
      <div className="mb-6">
        <h3 className="mb-4 font-semibold text-xl">Send New Invitation</h3>
        <form onSubmit={handleInviteSubmit} className="space-y-4">
        <div>
          <label htmlFor={emailId} className="block mb-1 font-medium text-sm">
            Email Address
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-gray-300 p-2"
            required
            placeholder="user@example.com"
            disabled={!activeOrganization}
          />
        </div>

        <div>
          <label htmlFor={roleId} className="block mb-1 font-medium text-sm">
            Role
          </label>
          <select
            id={roleId}
            value={role}
            onChange={(e) => setRole(e.target.value as 'member' | 'admin' | 'owner')}
            className="w-full rounded border border-gray-300 p-2"
            disabled={!activeOrganization}
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
        </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isLoading || !activeOrganization}
              className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
            
            <Link
              to="/dashboard"
              className="rounded-lg bg-gray-100 px-6 py-2 text-gray-800 font-medium hover:bg-gray-200 transition-colors border border-gray-300 inline-block"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}