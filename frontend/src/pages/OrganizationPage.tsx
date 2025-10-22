import { useState, useId } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../lib/store'

export function OrganizationPage() {
  const [orgName, setOrgName] = useState<string>('')
  const [orgSlug, setOrgSlug] = useState<string>('')
  const [showOrgForm, setShowOrgForm] = useState<boolean>(false)

  const orgNameId = useId()
  const orgSlugId = useId()

  const { organizations, createOrg } = useAuthStore()

  // 組織作成フォーム送信
  const handleOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createOrg(orgName, orgSlug)
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
      <div className="mb-6">
        <Link 
          to="/dashboard"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">Organization Management</h1>

      {/* 組織一覧 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Organizations</h2>
        {organizations && organizations.length > 0 ? (
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="border rounded p-4 bg-gray-50">
                <h3 className="font-medium">{org.name}</h3>
                <p className="text-sm text-gray-600">Slug: {org.slug}</p>
                <p className="text-sm text-gray-600">ID: {org.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No organizations found. Create one below!</p>
        )}
      </div>

      {/* 組織作成セクション */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Create New Organization</h2>
        {!showOrgForm ? (
          <button 
            type="button" 
            onClick={() => setShowOrgForm(true)}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md"
          >
            Create Organization
          </button>
        ) : (
          <div className="border rounded p-4 bg-gray-50">
            <h3 className="mb-4 font-medium text-lg">Create New Organization</h3>
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <div>
                <label htmlFor={orgNameId} className="block mb-1 font-medium text-sm">
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
                <label htmlFor={orgSlugId} className="block mb-1 font-medium text-sm">
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
                  className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-medium hover:bg-emerald-700 transition-colors shadow-md"
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
                  className="rounded-lg bg-gray-100 px-6 py-2 text-gray-800 font-medium hover:bg-gray-200 transition-colors border border-gray-300"
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