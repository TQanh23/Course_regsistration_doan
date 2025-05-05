export type NotificationType = 
  | 'registration_open'
  | 'registration_closing'
  | 'class_cancelled'
  | 'class_full'
  | 'registration_successful'
  | 'registration_failed'
  | 'schedule_change'
  | 'teacher_change'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    courseId?: string;
    classId?: string;
    teacherId?: string;
    registrationPeriod?: {
      startDate: string;
      endDate: string;
    };
  };
  isRead: boolean;
  createdAt: string;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Notification['data'];
}

export interface UpdateNotificationDto {
  isRead?: boolean;
}