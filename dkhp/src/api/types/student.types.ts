export interface Student {
  id: string;
  userId: string;
  studentCode: string;
  class: string;
  major: string;
  enrollmentYear: number;
  creditsDone: number;
  gpa: number;
  status: 'active' | 'graduated' | 'suspended' | 'withdrawn';
}

export interface StudentEnrollment {
  studentId: string;
  moduleId: string;
  classId: string;
  semester: string;
  academicYear: string;
  enrollmentDate: string;
  grade?: number;
  status: 'enrolled' | 'completed' | 'withdrawn' | 'failed';
}

export interface UpdateStudentDto {
  class?: string;
  major?: string;
  status?: Student['status'];
}

export interface StudentTranscript {
  studentId: string;
  enrollments: Array<{
    moduleCode: string;
    moduleName: string;
    credits: number;
    grade?: number;
    semester: string;
    academicYear: string;
    status: StudentEnrollment['status'];
  }>;
  summary: {
    totalCredits: number;
    completedCredits: number;
    gpa: number;
  };
}

export interface StudentSchedule {
  studentId: string;
  semester: string;
  academicYear: string;
  classes: Array<{
    classId: string;
    moduleCode: string;
    moduleName: string;
    schedule: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room: string;
    }>;
    teacher: {
      id: string;
      name: string;
    };
  }>;
}