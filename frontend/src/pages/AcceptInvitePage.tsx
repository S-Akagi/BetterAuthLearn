import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { authClient } from '../lib/auth'
import { useAuthStore } from '../lib/store'
import type { InvitationWithDetails } from '../types/auth'

export function AcceptInvitePage() {
  const { id: invitationId } = useParams<{ id: string }>()
  const [invitation, setInvitation] = useState<InvitationWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const { addNotification, user, isLoading: authLoading } = useAuthStore()

  // Redirect to login if not authenticated (only after auth check is complete)
  useEffect(() => {
    if (!authLoading && !user) {
      const currentPath = `/accept-invitation/${invitationId}`
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [user, authLoading, navigate, invitationId])

  // Fetch invitation information
  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationId) {
        addNotification('Invitation ID not found', 'error')
        setIsLoading(false)
        return
      }

      // Check if user is authenticated first
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await authClient.organization.getInvitation({
          query: { id: invitationId }
        }) as { data: InvitationWithDetails | null, error: any }

        if (error) {
          addNotification(`Failed to load invitation: ${error.message}`, 'error')
          return
        }

        if (data) {
          setInvitation(data)
        }
      } catch (error) {
        console.error('Error fetching invitation:', error)
        addNotification('Failed to load invitation', 'error')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvitation()
  }, [invitationId, user, addNotification])

  // Accept invitation
  const handleAcceptInvitation = async () => {
    if (!invitationId) return

    try {
      const { error } = await authClient.organization.acceptInvitation({
        invitationId
      })

      if (error) {
        addNotification(`Failed to accept invitation: ${error.message}`, 'error')
        return
      }

      addNotification('Invitation accepted successfully!', 'success')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error accepting invitation:', error)
      addNotification('Failed to accept invitation', 'error')
    }
  }

  // Reject invitation
  const handleRejectInvitation = async () => {
    if (!invitationId) return

    try {
      const { error } = await authClient.organization.rejectInvitation({
        invitationId
      })

      if (error) {
        addNotification(`Failed to reject invitation: ${error.message}`, 'error')
        return
      }

      addNotification('Invitation rejected', 'success')
      navigate('/dashboard')
    } catch (error) {
      console.error('Error rejecting invitation:', error)
      addNotification('Failed to reject invitation', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="text-gray-600">Loading invitation...</div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="p-8">
        <div className="mb-6 p-4 bg-red-50 rounded border">
          <p className="text-red-700">❌ Invitation not found or already processed.</p>
        </div>
        <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
          ← Back to Dashboard
        </Link>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="mb-6 p-4 bg-yellow-50 rounded border">
          <p className="text-yellow-700">⚠️ Please log in to accept this invitation.</p>
        </div>
        <Link to="/login" className="rounded-lg bg-indigo-600 px-6 py-2 text-white font-medium hover:bg-indigo-700 transition-colors shadow-md inline-block">
          Log In
        </Link>
      </div>
    )
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

      <h2 className="mb-6 font-bold text-2xl">Organization Invitation</h2>
      
      {/* 招待情報表示 */}
      <div className="mb-8">
        <div className="rounded border bg-blue-50 p-4">
          <h3 className="font-semibold text-lg mb-4">Invitation Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Organization:</span>
              <span>{invitation?.organizationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Role:</span>
              <span className="capitalize">{invitation?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Invited by:</span>
              <span>{invitation?.inviterEmail || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Your email:</span>
              <span>{invitation?.email}</span>
            </div>
          </div>
        </div>
      </div>
  
      {/* アクションボタン */}
      <div className="mb-6 space-x-4">
        <button
          onClick={handleAcceptInvitation}
          className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-emerald-700"
        >
          Accept Invitation
        </button>
        
        <button
          onClick={handleRejectInvitation}
          className="rounded-lg bg-rose-600 px-6 py-2 font-medium text-white shadow-md transition-colors hover:bg-rose-700"
        >
          Reject Invitation
        </button>

        <Link
          to="/dashboard"
          className="rounded-lg border border-gray-300 bg-gray-100 px-6 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-200 inline-block"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}