import { apiClient } from './client';

export interface AppNotification {
  _id: string;
  userId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  type: 'order_update' | 'offer' | 'coupon' | 'price_drop' | 'system' | 'back_in_stock';
  channel: 'in_app' | 'email' | 'sms' | 'push';
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export const notificationsApi = {
  /**
   * Fetch current user's in-app notifications
   */
  getMyNotifications: async (params?: { page?: number; limit?: number; isRead?: boolean; type?: string }): Promise<NotificationsResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.isRead !== undefined) query.append('isRead', params.isRead.toString());
    if (params?.type) query.append('type', params.type);

    const queryString = query.toString();
    return apiClient.get<NotificationsResponse>(`/notifications/my${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * Fetch count of unread notifications
   */
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    return apiClient.get<{ unreadCount: number }>('/notifications/my/unread-count');
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (id: string): Promise<AppNotification> => {
    return apiClient.patch<AppNotification>(`/notifications/my/${id}/read`, {});
  },

  /**
   * Mark all unread notifications as read
   */
  markAllAsRead: async (): Promise<{ modifiedCount: number }> => {
    return apiClient.patch<{ modifiedCount: number }>('/notifications/my/read-all', {});
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/notifications/my/${id}`);
  },

  /**
   * Update notification channel preferences (email, sms, push)
   */
  updateNotificationPreferences: async (preferences: NotificationPreferences): Promise<any> => {
    return apiClient.patch('/users/profile/notifications', preferences);
  },

  /**
   * Send test push notification
   */
  testPushNotification: async (): Promise<{ success: boolean; message: string; notification: AppNotification; pushEnabled: boolean }> => {
    return apiClient.post('/notifications/test-push', {});
  },

  /**
   * Send test email notification
   */
  testEmailNotification: async (): Promise<{ success: boolean; message: string; notification: AppNotification; emailEnabled: boolean }> => {
    return apiClient.post('/notifications/test-email', {});
  },
};
