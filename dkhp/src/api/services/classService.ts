import { apiClient } from '../config/axiosConfig';
import type { 
  CourseClass, 
  CreateClassRequest, 
  UpdateClassRequest,
  ClassEnrollment 
} from '../types/class.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const classService = {
  // Class management
  getAllClasses: (params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<CourseClass>>>('/classes', { params }),
    
  getClassById: (id: string) => 
    apiClient.get<ApiResponse<CourseClass>>(`/classes/${id}`),
    
  createClass: (data: CreateClassRequest) => 
    apiClient.post<ApiResponse<CourseClass>>('/classes', data),
    
  updateClass: (id: string, data: UpdateClassRequest) => 
    apiClient.put<ApiResponse<CourseClass>>(`/classes/${id}`, data),
    
  deleteClass: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/classes/${id}`),

  // Enrollment management
  getClassEnrollments: (classId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<ClassEnrollment>>>(
      `/classes/${classId}/enrollments`,
      { params }
    ),
    
  enrollStudent: (classId: string, studentId: string) => 
    apiClient.post<ApiResponse<ClassEnrollment>>(`/classes/${classId}/enroll`, { studentId }),
    
  withdrawStudent: (classId: string, studentId: string) => 
    apiClient.post<ApiResponse<ClassEnrollment>>(`/classes/${classId}/withdraw`, { studentId }),

  // Filtered queries
  getClassesByModule: (moduleId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<CourseClass>>>(
      `/modules/${moduleId}/classes`,
      { params }
    ),
    
  getClassesByTeacher: (teacherId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<CourseClass>>>(
      `/teachers/${teacherId}/classes`,
      { params }
    ),
    
  getClassesBySemester: (semester: string, academicYear: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<CourseClass>>>('/classes/semester', {
      params: { semester, academicYear, ...params }
    }),

  // Schedule management
  getClassSchedule: (classId: string) => 
    apiClient.get<ApiResponse<CourseClass>>(`/classes/${classId}/schedule`),
    
  updateClassSchedule: (classId: string, schedule: CourseClass['schedule']) => 
    apiClient.put<ApiResponse<CourseClass>>(`/classes/${classId}/schedule`, { schedule })
};