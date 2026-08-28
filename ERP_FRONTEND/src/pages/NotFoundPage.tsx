import { Link } from 'react-router-dom'
import { Button } from '@components/ui'
import { HomeIcon } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <p className="text-2xl text-white/90 mb-6">Page not found</p>
        <p className="text-white/70 mb-8 max-w-md">Sorry, the page you're looking for doesn't exist or has been moved.</p>
        
        <Link to="/dashboard">
          <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
            <HomeIcon size={20} />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
