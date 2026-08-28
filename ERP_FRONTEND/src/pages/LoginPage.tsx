import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import { Input, Button, Card } from '@components/ui'
import { AuthLayout } from '@components/layout'
import { LoginRequest } from '@types'
import { useLogin } from '@hooks/useAuth'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { login, } = useLogin()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginRequest>({
    defaultValues: {
      username: 'admin',
      password: 'admin123',
    }
  })

  // Redirect if already logged in
  if (isAuthenticated()) {
    navigate('/dashboard')
  }

  const onSubmit = async (data: LoginRequest) => {
    try {
      await login(data)
    } catch (error) {
      // Error handling is done in useLogin hook
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <div className="px-8 py-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              ERP
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              placeholder="admin"
              {...register('username', { required: 'Username is required' })}
              error={errors.username?.message}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-gray-600 dark:text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              Sign up
            </Link>
          </p>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">Demo Credentials:</p>
            <p className="text-xs text-blue-800 dark:text-blue-400">Username: <code className="font-mono">admin</code></p>
            <p className="text-xs text-blue-800 dark:text-blue-400">Password: <code className="font-mono">admin123</code></p>
          </div>
        </div>
      </Card>
    </AuthLayout>
  )
}

