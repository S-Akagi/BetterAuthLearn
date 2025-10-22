import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../lib/store'
import { authClient } from '../lib/auth'

export function DashboardPage() {
  const { user, organizations, signOut } = useAuthStore()
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  // Better Authフック
  const { data: activeOrganization } = authClient.useActiveOrganization()

  const handleSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value
    setSelectedOrgId(orgId)

    try {
      if (orgId) {
        await authClient.organization.setActive({ organizationId: orgId })
      } else {
        await authClient.organization.setActive({ organizationId: null })
      }
    } catch (error) {
      console.error('Error setting active organization:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="mb-4 font-bold text-2xl">Dashboard</h2>
        <p>Name, {user?.name}!</p>
        <p>Email: {user?.email}</p>
        <p>Verified: {user?.emailVerified ? 'Yes' : 'No'}</p>
      </div>

      {/* 組織情報 */}
      <div className="mb-6">
        <h2 className="mb-2 font-semibold text-xl">Organizations</h2>
        {organizations && organizations.length > 0 ? (
          <select className="mb-4 rounded border border-gray-300 p-2" value={selectedOrgId} onChange={handleSelect}>
            <option value="">Select an organization</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name} (Slug: {org.slug})
              </option>
            ))}
          </select>
        ) : (
          <p className="text-gray-500">No organizations found.</p>
        )}
        <div className="mt-2 rounded border bg-blue-50 p-2">
          <p className="text-blue-700 text-sm">
            <strong>Active:</strong> {activeOrganization?.name} ({activeOrganization?.slug})
          </p>
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="mb-6">
        <Link
          to="/organizations"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-indigo-700"
        >
          Manage Organizations
        </Link>
      </div>

      {/* サインアウト */}
      <button
        type="button"
        onClick={signOut}
        className="rounded-lg bg-rose-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-rose-700"
      >
        Sign Out
      </button>
    </div>
  )
}
