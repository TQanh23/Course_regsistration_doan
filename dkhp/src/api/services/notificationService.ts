import { apiClient } from '../config/axiosConfig';
import type { 
  Notification, 
  CreateNotificationDto, 
  UpdateNotificationDto 
} from '../types/notification.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const notificationService = {
  // Get user notifications with pagination
  getUserNotifications: (userId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(`/users/${userId}/notifications`, {
      params
    }),

  // Get unread notifications count
  getUnreadCount: (userId: string) => 
    apiClient.get<ApiResponse<{ count: number }>>(`/users/${userId}/notifications/unread`),

  // Mark notification as read
  markAsRead: (notificationId: string) => 
    apiClient.put<ApiResponse<Notification>>(`/notifications/${notificationId}`, {
      isRead: true
    } as UpdateNotificationDto),

  // Mark all notifications as read
  markAllAsRead: (userId: string) => 
    apiClient.put<ApiResponse<{ count: number }>>(`/users/${userId}/notifications/mark-all-read`),

  // Delete a notification
  deleteNotification: (notificationId: string) => 
    apiClient.delete<ApiResponse<null>>(`/notifications/${notificationId}`),

  // Delete all read notifications
  deleteReadNotifications: (userId: string) => 
    apiClient.delete<ApiResponse<{ count: number }>>(`/users/${userId}/notifications/read`),

  // Create a notification (admin/system only)
  createNotification: (data: CreateNotificationDto) => 
    apiClient.post<ApiResponse<Notification>>('/notifications', data),

  // Create bulk notifications (admin/system only)
  createBulkNotifications: (data: CreateNotificationDto[]) => 
    apiClient.post<ApiResponse<{ count: number }>>('/notifications/bulk', { notifications: data }),

  // Subscribe to WebSocket notifications (if implemented)
  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => {
    // WebSocket implementation would go here
    // For now, we'll use polling as a fallback
    const pollInterval = setInterval(async () => {
      try {
        const response = await notificationService.getUnreadCount(userId);
        if (response.data.data.count > 0) {
          const notifications = await notificationService.getUserNotifications(userId, {
            page: 1,
            pageSize: response.data.data.count
          });
          notifications.data.data.items.forEach(callback);
        }
      } catch (error) {
        console.error('Failed to poll notifications:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }
};