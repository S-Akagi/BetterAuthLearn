import { useState, useId, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../lib/store'
import { authClient } from '../lib/auth'
import type { OrganizationForm, BaseInvitation, MembersResponse } from '../types/auth'

type MemberData = MembersResponse['members'][0]

export function OrganizationPage() {
  const [orgName, setOrgName] = useState<string>('')
  const [orgSlug, setOrgSlug] = useState<string>('')
  const [showOrgForm, setShowOrgForm] = useState<boolean>(false)
  const [invitations, setInvitations] = useState<BaseInvitation[]>([])
  const [members, setMembers] = useState<MemberData[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const orgNameId = useId()
  const orgSlugId = useId()

  const { organizations, createOrg, addNotification, user } = useAuthStore()
  
  // Better Authのリアクティブフック
  const { data: activeOrganization } = authClient.useActiveOrganization()

  // 招待一覧取得
  const fetchInvitations = async (organizationId: string) => {
    try {
      const { data, error } = await authClient.organization.listInvitations({
        query: { organizationId }
      })

      if (error) {
        addNotification(`Failed to load invitations: ${error.message}`, 'error')
        return
      }

      if (data) {
        setInvitations(data)
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
      addNotification('Failed to load invitations', 'error')
    }
  }

  // メンバー一覧取得
  const fetchMembers = async (organizationId: string) => {
    try {
      const { data, error } = await authClient.organization.listMembers({
        query: {
          organizationId,
          limit: 100,
          sortBy: 'createdAt',
          sortDirection: 'desc'
        }
      }) as { data: MembersResponse | null, error: any }

      if (error) {
        addNotification(`Failed to load members: ${error.message}`, 'error')
        return
      }

      if (data?.members) {
        setMembers(data.members)
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      addNotification('Failed to load members', 'error')
    }
  }

  // 招待取り消し
  const handleRevokeInvitation = async (invitationId: string) => {
    if (!activeOrganization?.id) return

    try {
      await authClient.organization.cancelInvitation({
        invitationId
      })
      addNotification('Invitation revoked successfully', 'success')
      // 招待一覧を再取得
      fetchInvitations(activeOrganization.id)
    } catch (error) {
      console.error('Error revoking invitation:', error)
      addNotification('Failed to revoke invitation', 'error')
    }
  }

  // メンバー削除
  const handleRemoveMember = async (memberEmail: string) => {
    if (!activeOrganization?.id) return

    try {
      const { data, error } = await authClient.organization.removeMember({
        memberIdOrEmail: memberEmail,
        organizationId: activeOrganization.id
      })

      if (error) {
        addNotification(`Failed to remove member: ${error.message}`, 'error')
        return
      }

      addNotification('Member removed successfully', 'success')
      // メンバー一覧を再取得
      fetchMembers(activeOrganization.id)
    } catch (error) {
      console.error('Error removing member:', error)
      addNotification('Failed to remove member', 'error')
    }
  }

  // 組織を離れる
  const handleLeaveOrganization = async () => {
    if (!activeOrganization?.id) return

    try {
      await authClient.organization.leave({
        organizationId: activeOrganization.id
      })
      addNotification('Left organization successfully', 'success')
      // 組織一覧とアクティブ組織を更新
      window.location.reload() // 簡単なリフレッシュでデータを更新
    } catch (error) {
      console.error('Error leaving organization:', error)
      addNotification('Failed to leave organization', 'error')
    }
  }

  // メンバーロール変更
  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!activeOrganization?.id) return

    try {
      const { data, error } = await authClient.organization.updateMemberRole({
        role: [newRole],
        memberId: memberId,
        organizationId: activeOrganization.id
      })

      if (error) {
        addNotification(`Failed to update member role: ${error.message}`, 'error')
        return
      }

      addNotification('Member role updated successfully', 'success')
      // メンバー一覧を再取得
      fetchMembers(activeOrganization.id)
    } catch (error) {
      console.error('Error updating member role:', error)
      addNotification('Failed to update member role', 'error')
    }
  }

  // アクティブ組織変更時に招待一覧とメンバー一覧を取得
  useEffect(() => {
    if (activeOrganization?.id) {
      setSelectedOrgId(activeOrganization.id)
      fetchInvitations(activeOrganization.id)
      fetchMembers(activeOrganization.id)
    }
  }, [activeOrganization])

  // 組織作成フォーム送信
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const form: Pick<OrganizationForm, 'name' | 'slug'> = {
        name: orgName,
        slug: orgSlug
      }
      await createOrg(form)
      // フォームをクリア
      setOrgName('')
      setOrgSlug('')
      setShowOrgForm(false)
    } catch (error) {
      console.error('Error creating organization:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to Dashboard
        </Link>
        <div className="flex gap-2">
          <Link
            to="/invite"
            className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-green-700 text-sm"
          >
            Send Invitation
          </Link>
          {activeOrganization && (
            <button
              type="button"
              onClick={handleLeaveOrganization}
              className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white shadow-md transition-colors hover:bg-red-700 text-sm"
            >
              Leave Organization
            </button>
          )}
        </div>
      </div>

      <h2 className="mb-6 font-bold text-2xl">Organization Management</h2>

      {/* 組織一覧 */}
      <div className="mb-8">
        <h2 className="mb-4 font-semibold text-xl">Your Organizations</h2>
        {organizations && organizations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Slug</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{org.name}</td>
                    <td className="px-4 py-2 text-gray-600">{org.slug}</td>
                    <td className="px-4 py-2 text-gray-500 text-sm font-mono">
                      {org.id.substring(0, 12)}...
                    </td>
                    <td className="px-4 py-2">
                      {activeOrganization?.id === org.id ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No organizations found. Create one below!</p>
        )}
      </div>

      {/* アクティブ組織の招待一覧 */}
      {activeOrganization && (
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-xl">Invitations for {activeOrganization.name}</h2>
          {invitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Expires</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{invitation.email}</td>
                      <td className="px-4 py-2">
                        <span className="capitalize text-gray-600">{invitation.role}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          invitation.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : invitation.status === 'accepted'
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {invitation.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600 text-sm">
                        {new Date(invitation.expiresAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-sm font-mono">
                        {invitation.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2 text-right">
                        {invitation.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No invitations found for this organization.</p>
          )}
        </div>
      )}

      {/* アクティブ組織のメンバー一覧 */}
      {activeOrganization && (
        <div className="mb-8">
          <h2 className="mb-4 font-semibold text-xl">Members of {activeOrganization.name}</h2>
          {members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Role</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Joined</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Member ID</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{member.user.name}</td>
                      <td className="px-4 py-2 text-gray-600">{member.user.email}</td>
                      <td className="px-4 py-2">
                        {(() => {
                          // 現在のユーザーの権限を取得
                          const currentUserMember = members.find(m => m.user.email === user?.email)
                          const currentUserRole = currentUserMember?.role || 'member'
                          
                          // ownerの数をカウント
                          const ownerCount = members.filter(m => m.role === 'owner').length
                          
                          // 権限変更可能かどうかの判定（Better Authデフォルト権限に基づく）
                          const canChangeRole = () => {
                            // memberは権限変更不可（データ読み取りのみ）
                            if (currentUserRole === 'member') return false
                            
                            // adminの場合
                            if (currentUserRole === 'admin') {
                              // ownerの権限は変更できない（adminはowner変更不可）
                              if (member.role === 'owner') return false
                              // adminとmemberの権限は変更可能（member update権限あり）
                              return true
                            }
                            
                            // ownerの場合（全ての権限変更可能）
                            if (currentUserRole === 'owner') {
                              return true
                            }
                            
                            return false
                          }

                          // 利用可能な権限オプションを決定（Better Auth仕様に基づく）
                          const getAvailableRoles = () => {
                            const roles = ['member']
                            
                            if (currentUserRole === 'admin') {
                              // adminはowner変更不可だが、adminまでは設定可能
                              roles.push('admin')
                            } else if (currentUserRole === 'owner') {
                              // ownerは全ての権限を設定可能
                              roles.push('admin', 'owner')
                            }
                            
                            return roles
                          }

                          if (!canChangeRole()) {
                            // 権限変更不可の場合はバッジ表示
                            return (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                member.role === 'owner' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : member.role === 'admin'
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.role}
                              </span>
                            )
                          }

                          // 権限変更可能な場合はセレクト表示
                          return (
                            <select
                              value={member.role}
                              onChange={(e) => handleUpdateMemberRole(member.id, e.target.value)}
                              className="text-xs font-medium rounded border border-gray-300 px-2 py-1 bg-white"
                            >
                              {getAvailableRoles().map(role => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-2 text-gray-600 text-sm">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-sm font-mono">
                        {member.id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-2 text-right">
                        {member.user.email !== user?.email && member.role !== 'owner' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.user.email)}
                            className="inline-flex items-center rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No members found for this organization.</p>
          )}
        </div>
      )}

      {/* 組織作成セクション */}
      <div className="mb-6">
        <h2 className="mb-4 font-semibold text-xl">Create New Organization</h2>
        {!showOrgForm ? (
          <button
            type="button"
            onClick={() => setShowOrgForm(true)}
            className="rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-indigo-700"
          >
            Create Organization
          </button>
        ) : (
          <div className="rounded border bg-gray-50 p-4">
            <h3 className="mb-4 font-medium text-lg">Create New Organization</h3>
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <div>
                <label htmlFor={orgNameId} className="mb-1 block font-medium text-sm">
                  Organization Name
                </label>
                <input
                  id={orgNameId}
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                  placeholder="My Company"
                />
              </div>
              <div>
                <label htmlFor={orgSlugId} className="mb-1 block font-medium text-sm">
                  Organization Slug
                </label>
                <input
                  id={orgSlugId}
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2"
                  required
                  placeholder="my-company"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-emerald-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOrgForm(false)
                    setOrgName('')
                    setOrgSlug('')
                  }}
                  className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
