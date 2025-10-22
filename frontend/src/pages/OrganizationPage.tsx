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
        <Link to="/dashboard" className="font-medium text-indigo-600 hover:text-indigo-700">
          ← Back to Dashboard
        </Link>
      </div>

      <h2 className="mb-6 font-bold text-2xl">Organization Management</h2>

      {/* 組織一覧 */}
      <div className="mb-8">
        <h2 className="mb-4 font-semibold text-xl">Your Organizations</h2>
        {organizations && organizations.length > 0 ? (
          <div className="space-y-2">
            {organizations.map((org) => (
              <div key={org.id} className="rounded border bg-gray-50 p-4">
                <h3 className="font-medium">{org.name}</h3>
                <p className="text-gray-600 text-sm">Slug: {org.slug}</p>
                <p className="text-gray-600 text-sm">ID: {org.id}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No organizations found. Create one below!</p>
        )}
      </div>

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
