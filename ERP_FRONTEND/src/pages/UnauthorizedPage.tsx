import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuthStore } from '@store/authStore'
import { getRoleDisplayName } from '@utils/rolePermissions'

export default function UnauthorizedPage() {
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-2">
          You don't have permission to access this page.
        </p>

        {user && (
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Your role: <span className="font-semibold">{getRoleDisplayName(user.role!)}</span>
          </p>
        )}

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please contact your administrator if you believe this is a mistake.
        </p>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
