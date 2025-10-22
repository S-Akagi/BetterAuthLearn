// src/frontend/src/App.tsx
import { useState, useEffect } from 'react'
import { useAuthStore } from './lib/store'
import { Snackbar } from './components/Snackbar'
import './App.css'

function App() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState<boolean>(false)

  const { user, isLoading, signIn, signUp, signOut, checkSession } = useAuthStore()

  // 初回レンダリング時にセッションを確認
  useEffect(() => {
    checkSession()
  }, [])

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isSignUp) {
        await signUp(email, password, name)
      } else {
        await signIn(email, password)
      }
      // フォームをクリア
      setEmail('')
      setPassword('')
      setName('')
    } catch (error) {
      console.error(`Error ${isSignUp ? 'sign-up' : 'sign-in'}:`, error)
    }
  }

  if (isLoading) {
    return <div className="p-8">Loading...</div>
  }

  if (user) {
    return (
      <div className="p-8">
        <p>Name, {user.name}!</p>
        <p>Email: {user.email}</p>
        <p>Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
        <button onClick={signOut} className="mt-4 bg-red-600 text-black py-2 px-4 rounded hover:bg-red-700">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto mt-8 p-6">
      <div className="flex items-center justify-center mb-6">
        <span className={`font-medium mr-3 ${!isSignUp ? 'text-blue-600' : 'text-gray-500'}`}>Sign In</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isSignUp}
            onChange={(e) => setIsSignUp(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
        <span className={`font-medium ml-3 ${isSignUp ? 'text-blue-600' : 'text-gray-500'}`}>Sign Up</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center">
          {/* Name (サインアップ時のみ表示) */}
          {isSignUp && (
            <>
              <label htmlFor="name" className="font-medium mr-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-48 p-2 border border-gray-300 rounded mr-6"
                required={isSignUp}
              />
            </>
          )}

          {/* Email */}
          <label htmlFor="email" className="font-medium mr-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-48 p-2 border border-gray-300 rounded"
            required
          />

          {/* Password */}
          <label htmlFor="password" className="font-medium ml-6 mr-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-48 p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {/* Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="bg-gray-100 text-gray-800 py-2 px-10 text-lg rounded-lg shadow-sm hover:bg-gray-200"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  )
}

const AppWithSnackbar = () => {
  return (
    <>
      <App />
      <Snackbar />
    </>
  )
}

export default AppWithSnackbar
