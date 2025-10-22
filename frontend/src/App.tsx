// src/frontend/src/App.tsx
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/store'
import { Snackbar } from './components/Snackbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { OrganizationPage } from './pages/OrganizationPage'
import './App.css'

function App() {
  const { checkSession } = useAuthStore()

  // 初回レンダリング時にセッションを確認
  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/organizations"
          element={
            <ProtectedRoute>
              <OrganizationPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <Snackbar />
    </BrowserRouter>
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
