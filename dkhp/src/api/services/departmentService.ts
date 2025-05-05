import { apiClient } from '../config/axiosConfig';
import type { 
  Department,
  DepartmentStats,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentSchedule
} from '../types/department.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const departmentService = {
  // Basic CRUD operations
  getAllDepartments: (params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Department>>>('/departments', { params }),
    
  getDepartmentById: (id: string) => 
    apiClient.get<ApiResponse<Department>>(`/departments/${id}`),
    
  createDepartment: (data: CreateDepartmentDto) => 
    apiClient.post<ApiResponse<Department>>('/departments', data),
    
  updateDepartment: (id: string, data: UpdateDepartmentDto) => 
    apiClient.put<ApiResponse<Department>>(`/departments/${id}`, data),
    
  deleteDepartment: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/departments/${id}`),

  // Department statistics
  getDepartmentStats: (id: string) => 
    apiClient.get<ApiResponse<DepartmentStats>>(`/departments/${id}/stats`),
    
  getDepartmentTeacherCount: (id: string) => 
    apiClient.get<ApiResponse<{ count: number }>>(`/departments/${id}/teacher-count`),
    
  getDepartmentStudentCount: (id: string) => 
    apiClient.get<ApiResponse<{ count: number }>>(`/departments/${id}/student-count`),

  // Schedule management
  getDepartmentSchedule: (
    id: string, 
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<DepartmentSchedule>>(
      `/departments/${id}/schedule`,
      { params: { semester, academicYear } }
    ),

  // Resource management
  getAvailableRooms: (
    departmentId: string,
    timeSlot: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  ) => 
    apiClient.get<ApiResponse<Array<{
      roomId: string;
      roomName: string;
      capacity: number;
    }>>>(
      `/departments/${departmentId}/available-rooms`,
      { params: timeSlot }
    ),

  // Search and filters
  searchDepartments: (query: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Department>>>(
      '/departments/search',
      { params: { query, ...params } }
    ),

  // Department relations
  assignHeadOfDepartment: (departmentId: string, teacherId: string) => 
    apiClient.put<ApiResponse<Department>>(
      `/departments/${departmentId}/head`,
      { teacherId }
    ),
    
  removeHeadOfDepartment: (departmentId: string) => 
    apiClient.delete<ApiResponse<Department>>(
      `/departments/${departmentId}/head`
    ),

  // Analytics
  getDepartmentAnalytics: (
    departmentId: string,
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<{
      classesCount: number;
      activeTeachers: number;
      enrolledStudents: number;
      averageClassSize: number;
      roomUtilization: number;
    }>>(
      `/departments/${departmentId}/analytics`,
      { params: { semester, academicYear } }
    )
};