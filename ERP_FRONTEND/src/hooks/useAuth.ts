import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { authApi } from '@api/auth'
import { LoginRequest, RegisterRequest, User } from '@types'

export const useLogin = () => {
  const navigate = useNavigate()
  const { login: storeLogin, setError, setLoading, initializeAuth } = useAuthStore()

  const login = async (credentials: LoginRequest) => {
    try {
      setLoading(true)
      setError(null)
      const response = await authApi.login(credentials)
      
      // Backend returns: { token, username, role, type, passwordChangeRequired? }
      // Create user object with the role from backend
      const user: User = {
        username: response.username,
        role: response.role,
      }
      
      console.log('Login Response:', response)
      console.log('User Object:', user)
      console.log('Password Change Required:', response.passwordChangeRequired)
      
      storeLogin(response.token, user, response.passwordChangeRequired || false)
      
      // Immediately fetch the full user data including ID from /api/auth/me
      // This is necessary for operations like leave requests that need the employee ID
      try {
        await initializeAuth()
      } catch (err) {
        console.warn('Failed to fetch user details:', err)
      }
      
      // If password change is required, show modal instead of navigating to dashboard
      if (response.passwordChangeRequired) {
        navigate('/change-password', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Login failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { login }
}

export const useRegister = () => {
  const navigate = useNavigate()
  const { setError, setLoading } = useAuthStore()

  const register = async (data: RegisterRequest) => {
    try {
      setLoading(true)
      setError(null)
      const user = await authApi.register(data)
      navigate('/login')
      return user
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Registration failed'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { register }
}

export const useLogout = () => {
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear httpOnly cookie
      await authApi.logout()
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API call fails
    } finally {
      logout()
      navigate('/login')
    }
  }

  return { logout: handleLogout }
}

