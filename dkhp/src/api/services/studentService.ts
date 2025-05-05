import { apiClient } from '../config/axiosConfig';
import type { 
  Student,
  StudentEnrollment,
  UpdateStudentDto,
  StudentTranscript,
  StudentSchedule
} from '../types/student.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const studentService = {
  // Basic student operations
  getStudent: (studentId: string) => 
    apiClient.get<ApiResponse<Student>>(`/students/${studentId}`),
    
  updateStudent: (studentId: string, data: UpdateStudentDto) => 
    apiClient.put<ApiResponse<Student>>(`/students/${studentId}`, data),

  // Enrollment operations
  getStudentEnrollments: (studentId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<StudentEnrollment>>>(
      `/students/${studentId}/enrollments`,
      { params }
    ),
    
  getCurrentEnrollments: (studentId: string) => 
    apiClient.get<ApiResponse<StudentEnrollment[]>>(
      `/students/${studentId}/enrollments/current`
    ),

  // Academic records
  getTranscript: (studentId: string) => 
    apiClient.get<ApiResponse<StudentTranscript>>(`/students/${studentId}/transcript`),
    
  getGradesBySemester: (
    studentId: string,
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<StudentEnrollment[]>>(
      `/students/${studentId}/grades/${academicYear}/${semester}`
    ),

  // Schedule management
  getSchedule: (
    studentId: string,
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<StudentSchedule>>(
      `/students/${studentId}/schedule`,
      { params: { semester, academicYear } }
    ),
    
  getCurrentSchedule: (studentId: string) => 
    apiClient.get<ApiResponse<StudentSchedule>>(
      `/students/${studentId}/schedule/current`
    ),

  // Registration eligibility
  checkPrerequisites: (studentId: string, moduleId: string) => 
    apiClient.get<ApiResponse<{ eligible: boolean; missingPrerequisites?: string[] }>>(
      `/students/${studentId}/check-prerequisites/${moduleId}`
    ),
    
  checkCreditLimit: (studentId: string) => 
    apiClient.get<ApiResponse<{
      currentCredits: number;
      maxCredits: number;
      remainingCredits: number;
    }>>(
      `/students/${studentId}/credit-limit`
    ),

  // Registration operations
  registerForClass: (studentId: string, classId: string) => 
    apiClient.post<ApiResponse<StudentEnrollment>>(
      `/students/${studentId}/register`,
      { classId }
    ),
    
  withdrawFromClass: (studentId: string, classId: string) => 
    apiClient.post<ApiResponse<StudentEnrollment>>(
      `/students/${studentId}/withdraw`,
      { classId }
    ),

  // Batch operations
  registerMultipleClasses: (studentId: string, classIds: string[]) => 
    apiClient.post<ApiResponse<{
      successful: StudentEnrollment[];
      failed: Array<{ classId: string; reason: string }>;
    }>>(
      `/students/${studentId}/register-multiple`,
      { classIds }
    ),

  // Analytics
  getProgressReport: (studentId: string) => 
    apiClient.get<ApiResponse<{
      totalCreditsRequired: number;
      creditsDone: number;
      creditsInProgress: number;
      remainingCredits: number;
      estimatedGraduationDate: string;
    }>>(
      `/students/${studentId}/progress`
    ),
};