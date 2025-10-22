import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../lib/store'

export function DashboardPage() {
  const { user, organizations, signOut } = useAuthStore()
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOrgId(e.target.value)
    // 必要なら他の処理もここで行う
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Name, {user?.name}!</p>
        <p>Email: {user?.email}</p>
        <p>Verified: {user?.emailVerified ? 'Yes' : 'No'}</p>
      </div>

      {/* 組織情報 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Organizations</h2>
        {organizations && organizations.length > 0 ? (
          <select 
            className="mb-4 rounded border border-gray-300 p-2" 
            value={selectedOrgId} 
            onChange={handleSelect}
          >
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
        <p>Active Org: </p>
      </div>

      {/* ナビゲーション */}
      <div className="mb-6">
        <Link 
          to="/organizations"
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md inline-block"
        >
          Manage Organizations
        </Link>
      </div>

      {/* サインアウト */}
      <button 
        type="button" 
        onClick={signOut} 
        className="rounded-lg bg-rose-600 px-6 py-2 text-white font-medium hover:bg-rose-700 transition-colors shadow-md"
      >
        Sign Out
      </button>
    </div>
  )
}