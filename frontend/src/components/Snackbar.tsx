import { useAuthStore } from '../lib/store'

export const Snackbar = () => {
  const { notifications, removeNotification } = useAuthStore()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`min-w-64 max-w-96 transform rounded-lg px-4 py-3 text-white shadow-lg transition-all duration-300 ease-in-out ${notification.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{notification.message}</span>
            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              className="ml-3 font-bold text-gray-500 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
