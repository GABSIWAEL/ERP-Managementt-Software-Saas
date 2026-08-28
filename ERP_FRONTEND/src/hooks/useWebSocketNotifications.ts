import { useEffect, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'
import notificationApi from '@/api/notifications'
import type { NotificationDTO } from '@/types/index'

interface UseWebSocketNotificationsReturn {
  notifications: NotificationDTO[]
  unreadCount: number
  isConnected: boolean
  markAsRead: (id: number) => Promise<void>
  deleteNotification: (id: number) => Promise<void>
}

export const useWebSocketNotifications = (): UseWebSocketNotificationsReturn => {
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<NotificationDTO[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  const fetchInitialNotifications = useCallback(async () => {
    try {
      const data = await notificationApi.getAll()
      const notifArray = Array.isArray(data) ? data : data.content || []
      setNotifications(notifArray)
      
      const unread = await notificationApi.getUnreadCount()
      setUnreadCount(unread)
    } catch (error) {
      console.warn('Failed to fetch initial notifications:', error)
    }
  }, [])

  useEffect(() => {
    // Initial fetch
    fetchInitialNotifications()

    // Connect to WebSocket - use backend URL (8080), not frontend (3000)
    // SockJS handles WebSocket protocol internally, so use http/https not ws/wss
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    const socketUrl = `${protocol}//localhost:8080/ws-notifications`
    
    console.log('Connecting to WebSocket at:', socketUrl)
    
    const socket = new SockJS(socketUrl)
    const stompClient = Stomp.over(socket)
    
    // Disable logging by default
    stompClient.debug = null

    stompClient.connect(
      {},
      () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        
        // Get user role from localStorage
        const userRole = localStorage.getItem('userRole') || 'EMPLOYEE'
        const topic = `/topic/notifications/${userRole}`
        
        console.log(`Subscribing to ${topic}`)
        stompClient.subscribe(topic, (message) => {
          try {
            const notification = JSON.parse(message.body)
            console.log('New notification received:', notification)
            
            setNotifications((prev) => [notification, ...prev])
            setUnreadCount((prev) => prev + 1)
            
            // Invalidate query to refresh data
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
          } catch (error) {
            console.error('Error processing message:', error)
          }
        })
      },
      (error) => {
        console.error('WebSocket error:', error)
        setIsConnected(false)
      }
    )

    // Cleanup on unmount
    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log('WebSocket disconnected')
        })
      }
    }
  }, [queryClient, fetchInitialNotifications])

  const markAsRead = useCallback(
    async (id: number) => {
      try {
        await notificationApi.markAsRead(id)
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    [queryClient]
  )

  const deleteNotification = useCallback(
    async (id: number) => {
      try {
        await notificationApi.deleteNotification(id)
        setNotifications((prev) => prev.filter((notif) => notif.id !== id))
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      } catch (error) {
        console.error('Failed to delete notification:', error)
      }
    },
    [queryClient]
  )

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    deleteNotification,
  }
}
