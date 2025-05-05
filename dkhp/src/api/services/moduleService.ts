import { apiClient } from '../config/axiosConfig';
import type { 
  Module, 
  CreateModuleRequest, 
  UpdateModuleRequest,
  ModuleResponse 
} from '../types/module.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const moduleService = {
  // Get all modules with pagination
  getAllModules: (params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Module>>>('/modules', { params }),
    
  // Get a single module by ID
  getModuleById: (id: string) => 
    apiClient.get<ApiResponse<Module>>(`/modules/${id}`),
    
  // Create a new module
  createModule: (data: CreateModuleRequest) => 
    apiClient.post<ModuleResponse>('/modules', data),
    
  // Update an existing module
  updateModule: (id: string, data: UpdateModuleRequest) => 
    apiClient.put<ModuleResponse>(`/modules/${id}`, data),
    
  // Delete a module
  deleteModule: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/modules/${id}`),
    
  // Get all prerequisite modules for a specific module
  getPrerequisites: (moduleId: string) => 
    apiClient.get<ApiResponse<Module[]>>(`/modules/${moduleId}/prerequisites`),
    
  // Search modules
  searchModules: (query: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Module>>>('/modules/search', {
      params: { query, ...params }
    }),
    
  // Get modules by department
  getModulesByDepartment: (departmentId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Module>>>(`/departments/${departmentId}/modules`, {
      params
    })
};