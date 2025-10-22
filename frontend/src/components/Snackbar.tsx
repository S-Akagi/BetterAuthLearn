import { useAuthStore } from '../lib/store'

export const Snackbar = () => {
  const { notifications, removeNotification } = useAuthStore()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            px-4 py-3 rounded-lg shadow-lg text-white min-w-64 max-w-96
            transform transition-all duration-300 ease-in-out
            ${notification.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 text-gray-500 text-lg font-bold"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
