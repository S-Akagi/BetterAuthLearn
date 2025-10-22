import { organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:3000',
  plugins: [organizationClient()],
})
