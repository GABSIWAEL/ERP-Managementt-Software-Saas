import { Bell, Moon, Sun, Search } from 'lucide-react'
import { useThemeStore } from '@store/themeStore'
import { useState } from 'react'
import { useWebSocketNotifications } from '@hooks/useWebSocketNotifications'
import { useAuthStore } from '@store/authStore'
import { NotificationDTO } from '@api/notifications'

export function Navbar() {
  const { isDark, toggle } = useThemeStore()
  const { user } = useAuthStore()
  const { unreadCount, notifications, markAsRead, isConnected } = useWebSocketNotifications()
  const [showDropdown, setShowDropdown] = useState(false)
  const [displayedNotifications, setDisplayedNotifications] = useState<NotificationDTO[]>([])

  // Show new notifications as they arrive
  const [previousCount, setPreviousCount] = useState(unreadCount)
  
  if (unreadCount > previousCount && user && ['HR', 'MANAGER', 'EMPLOYEE', 'ADMIN', 'ACCOUNTANT'].includes(user.role)) {
    const newNotifications = notifications.filter(n => !n.isRead).slice(0, unreadCount - previousCount)
    setDisplayedNotifications(prev => [...newNotifications, ...prev].slice(0, 3))
    setPreviousCount(unreadCount)
  }

  const handleNotificationDismiss = (id: number) => {
    setDisplayedNotifications(prev => prev.filter(n => n.id !== id))
  }

  const shouldShowNotifications = user && ['HR', 'MANAGER', 'EMPLOYEE', 'ADMIN', 'ACCOUNTANT'].includes(user.role)

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search employees, departments..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        {shouldShowNotifications && (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                  {unreadCount > 0 && <p className="text-xs text-gray-500 dark:text-gray-400">{unreadCount} unread</p>}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {notifications && notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`border-b border-gray-100 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                          !notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => {
                          if (!notif.isRead) {
                            markAsRead(notif.id)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {notif.title}
                              {!notif.isRead && <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              {new Date(notif.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      No notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggle}
          className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium cursor-pointer hover:opacity-80 transition-opacity">
          {user?.username?.[0]?.toUpperCase() || 'A'}
        </div>
      </div>

      {/* Notification Popups - Slide in from right */}
      <div className="fixed top-20 right-4 space-y-3 pointer-events-none">
        {displayedNotifications.map((notif, idx) => (
          <div
            key={notif.id}
            className="max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border-l-4 border-blue-500 p-4 animate-slide-in pointer-events-auto dark:text-gray-100"
            style={{
              animation: `slideInRight 0.3s ease-out ${idx * 0.1}s`
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <Bell className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{notif.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {new Date(notif.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationDismiss(notif.id)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </header>
  )
}
