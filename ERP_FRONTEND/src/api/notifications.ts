import client from './client';
import { ApiResponse } from '../types/api';

export interface NotificationDTO {
  id: number;
  title: string;
  message: string;
  recipientRole: string;
  recipientId?: number;
  type: string;
  relatedEntityId?: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

const notificationsApi = {
  getAll: async () => {
    const response = await client.get<ApiResponse<NotificationDTO[]>>('/api/notifications');
    const notifications = response.data.data || response.data;
    return Array.isArray(notifications) ? { content: notifications } : notifications;
  },

  getUnread: async () => {
    const response = await client.get<ApiResponse<NotificationDTO[]>>('/api/notifications/unread');
    const notifications = response.data.data || response.data;
    return Array.isArray(notifications) ? { content: notifications } : notifications;
  },

  getUnreadCount: async () => {
    const response = await client.get<ApiResponse<number>>('/api/notifications/unread/count');
    return response.data.data !== undefined ? response.data.data : response.data;
  },

  markAsRead: async (id: number) => {
    const response = await client.put<ApiResponse<NotificationDTO>>(`/api/notifications/${id}/read`);
    return response.data.data || response.data;
  },

  deleteNotification: async (id: number) => {
    await client.delete(`/api/notifications/${id}`);
  },
};

export default notificationsApi;
