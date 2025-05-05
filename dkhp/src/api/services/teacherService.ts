import { apiClient } from '../config/axiosConfig';
import type { 
  Teacher, 
  CreateTeacherRequest, 
  UpdateTeacherRequest,
  TeacherSchedule 
} from '../types/teacher.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const teacherService = {
  // Basic CRUD operations
  getAllTeachers: (params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Teacher>>>('/teachers', { params }),
    
  getTeacherById: (id: string) => 
    apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`),
    
  createTeacher: (data: CreateTeacherRequest) => 
    apiClient.post<ApiResponse<Teacher>>('/teachers', data),
    
  updateTeacher: (id: string, data: UpdateTeacherRequest) => 
    apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, data),
    
  deleteTeacher: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/teachers/${id}`),

  // Schedule Management
  getTeacherSchedule: (teacherId: string) => 
    apiClient.get<ApiResponse<TeacherSchedule>>(`/teachers/${teacherId}/schedule`),
    
  getTeacherCurrentClasses: (teacherId: string) => 
    apiClient.get<ApiResponse<PaginatedResponse<any>>>(`/teachers/${teacherId}/current-classes`),

  // Department-specific queries
  getTeachersByDepartment: (departmentId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Teacher>>>(`/departments/${departmentId}/teachers`, {
      params
    }),

  // Search and filters
  searchTeachers: (query: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Teacher>>>('/teachers/search', {
      params: { query, ...params }
    }),
    
  getTeachersByStatus: (status: Teacher['status'], params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Teacher>>>('/teachers', {
      params: { status, ...params }
    }),

  // Availability management
  updateTeacherStatus: (teacherId: string, status: Teacher['status']) => 
    apiClient.put<ApiResponse<Teacher>>(`/teachers/${teacherId}/status`, { status }),
    
  checkTeacherAvailability: (teacherId: string, timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => 
    apiClient.post<ApiResponse<{ available: boolean }>>(`/teachers/${teacherId}/check-availability`, timeSlot)
};