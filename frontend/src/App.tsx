// src/frontend/src/App.tsx
import { useState, useEffect, useId } from 'react'
import { useAuthStore } from './lib/store'
import { Snackbar } from './components/Snackbar'
import './App.css'

function App() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [isSignUp, setIsSignUp] = useState<boolean>(false)

  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()

  const { user, isLoading, signIn, signUp, signOut, checkSession } = useAuthStore()

  // 初回レンダリング時にセッションを確認
  useEffect(() => {
    checkSession()
  }, [checkSession])

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
        <button type="button" onClick={signOut} className="mt-4 rounded bg-red-600 px-4 py-2 text-black hover:bg-red-700">
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-8 w-full p-6">
      <div className="mb-6 flex items-center justify-center">
        <span className={`mr-3 font-medium ${!isSignUp ? 'text-blue-600' : 'text-gray-500'}`}>Sign In</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isSignUp}
            onChange={(e) => setIsSignUp(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
        </label>
        <span className={`ml-3 font-medium ${isSignUp ? 'text-blue-600' : 'text-gray-500'}`}>Sign Up</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center">
          {/* Name (サインアップ時のみ表示) */}
          {isSignUp && (
            <>
              <label htmlFor={nameId} className="mr-2 font-medium">
                Name
              </label>
              <input
                id={nameId}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mr-6 w-48 rounded border border-gray-300 p-2"
                required={isSignUp}
              />
            </>
          )}

          {/* Email */}
          <label htmlFor={emailId} className="mr-2 font-medium">
            Email
          </label>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-48 rounded border border-gray-300 p-2"
            required
          />

          {/* Password */}
          <label htmlFor={passwordId} className="mr-2 ml-6 font-medium">
            Password
          </label>
          <input
            id={passwordId}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-48 rounded border border-gray-300 p-2"
            required
          />
        </div>

        {/* Button */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            className="rounded-lg bg-gray-100 px-10 py-2 text-gray-800 text-lg shadow-sm hover:bg-gray-200"
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
