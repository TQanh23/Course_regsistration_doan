export interface ClassSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
}

export interface CourseClass {
  id: string;
  moduleId: string;
  teacherId: string;
  semester: string;
  academicYear: string;
  maxStudents: number;
  enrolledStudents: number;
  schedule: ClassSchedule[];
  status: 'active' | 'cancelled' | 'completed';
}

export interface CreateClassRequest {
  moduleId: string;
  teacherId: string;
  semester: string;
  academicYear: string;
  maxStudents: number;
  schedule: ClassSchedule[];
}

export interface UpdateClassRequest {
  moduleId?: string;
  teacherId?: string;
  maxStudents?: number;
  schedule?: ClassSchedule[];
  status?: 'active' | 'cancelled' | 'completed';
}

export interface ClassEnrollment {
  classId: string;
  studentId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'withdrawn' | 'completed';
}