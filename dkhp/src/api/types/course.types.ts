export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  description?: string;
}

export interface CourseClass {
  id: string;
  courseId: string;
  teacherId: string;
  semester: string;
  year: number;
  maxStudents: number;
  currentStudents: number;
  schedule: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  department: string;
}

export interface RegisterCourseRequest {
  courseClassId: string;
  studentId: string;
}

export interface UnregisterCourseRequest {
  courseClassId: string;
  studentId: string;
}