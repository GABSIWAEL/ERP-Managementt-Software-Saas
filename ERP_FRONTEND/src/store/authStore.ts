import { create } from 'zustand'
import { authApi } from '@api/auth'
import { User, UserRole } from '@types'

interface AuthState {
  token: string | null
  user: User | null
  isLoading: boolean
  error: string | null
  passwordChangeRequired: boolean
  
  setToken: (token: string) => void
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setPasswordChangeRequired: (required: boolean) => void
  login: (token: string, user: User, passwordChangeRequired?: boolean) => void
  logout: () => void
  isAuthenticated: () => boolean
  hasRole: (roles: UserRole | UserRole[]) => boolean
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: false,
  error: null,
  passwordChangeRequired: false,

  setToken: (token: string) => {
    // Token is stored in httpOnly cookie by backend, don't store in localStorage
    set({ token })
  },

  setUser: (user: User) => {
    set({ user })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  setPasswordChangeRequired: (required: boolean) => {
    set({ passwordChangeRequired: required })
  },

  login: (token: string, user: User, passwordChangeRequired = false) => {
    // Token is stored in httpOnly cookie by backend, don't store in localStorage
    set({
      token,
      user,
      error: null,
      passwordChangeRequired,
    })
  },

  logout: () => {
    // Logout handled by backend which clears httpOnly cookie
    set({
      token: null,
      user: null,
      error: null,
      passwordChangeRequired: false,
    })
  },

  // Initialize auth state by verifying with backend
  initializeAuth: async () => {
    set({ isLoading: true })
    try {
      const user = await authApi.getCurrentUser()
      
      // User is still authenticated (httpOnly cookie is valid)
      set({
        user,
        token: 'authenticated', // Mark as authenticated even though token is in httpOnly cookie
        error: null,
        isLoading: false,
      })
    } catch (error) {
      // User is not authenticated
      set({
        token: null,
        user: null,
        error: null,
        isLoading: false,
      })
    }
  },

  isAuthenticated: () => {
    const { token, user } = get()
    return !!token && !!user
  },

  hasRole: (roles: UserRole | UserRole[]) => {
    const { user } = get()
    if (!user) return false
    
    const roleArray = Array.isArray(roles) ? roles : [roles]
    
    // Check both user.role (single) and user.roles (array) from backend
    if (user.role && roleArray.includes(user.role)) return true
    if (user.roles && user.roles.some(r => roleArray.includes(r))) return true
    
    return false
  },
}))

