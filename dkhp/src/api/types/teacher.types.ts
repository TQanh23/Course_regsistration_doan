export interface Teacher {
  id: string;
  userId: string;
  title?: string;
  department: string;
  specialization?: string;
  contactInfo?: {
    phone?: string;
    office?: string;
    officeHours?: string;
  };
  courses: string[]; // Array of course IDs
  status: 'active' | 'inactive' | 'on_leave';
}

export interface CreateTeacherRequest {
  userId: string;
  title?: string;
  department: string;
  specialization?: string;
  contactInfo?: {
    phone?: string;
    office?: string;
    officeHours?: string;
  };
}

export interface UpdateTeacherRequest {
  title?: string;
  department?: string;
  specialization?: string;
  contactInfo?: {
    phone?: string;
    office?: string;
    officeHours?: string;
  };
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface TeacherSchedule {
  teacherId: string;
  schedule: {
    courseClassId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    room: string;
  }[];
}