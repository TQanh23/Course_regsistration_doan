import { apiClient } from '../config/axiosConfig';
import type { 
  RegistrationPeriod,
  CreateRegistrationPeriodDto,
  UpdateRegistrationPeriodDto 
} from '../types/registration.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const registrationService = {
  // Registration period management
  getAllPeriods: (params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<RegistrationPeriod>>>(
      '/registration-periods',
      { params }
    ),
    
  getCurrentPeriod: () => 
    apiClient.get<ApiResponse<RegistrationPeriod | null>>(
      '/registration-periods/current'
    ),
    
  getPeriodById: (id: string) => 
    apiClient.get<ApiResponse<RegistrationPeriod>>(`/registration-periods/${id}`),
    
  createPeriod: (data: CreateRegistrationPeriodDto) => 
    apiClient.post<ApiResponse<RegistrationPeriod>>(
      '/registration-periods',
      data
    ),
    
  updatePeriod: (id: string, data: UpdateRegistrationPeriodDto) => 
    apiClient.put<ApiResponse<RegistrationPeriod>>(
      `/registration-periods/${id}`,
      data
    ),
    
  deletePeriod: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/registration-periods/${id}`),

  // Student eligibility
  checkStudentEligibility: (studentId: string) => 
    apiClient.get<ApiResponse<{
      eligible: boolean;
      currentPeriod?: RegistrationPeriod;
      reason?: string;
    }>>(
      `/registration-periods/check-eligibility/${studentId}`
    ),

  // Period status management
  activatePeriod: (id: string) => 
    apiClient.post<ApiResponse<RegistrationPeriod>>(
      `/registration-periods/${id}/activate`
    ),
    
  endPeriod: (id: string) => 
    apiClient.post<ApiResponse<RegistrationPeriod>>(
      `/registration-periods/${id}/end`
    ),

  // Schedule management
  getUpcomingPeriods: () => 
    apiClient.get<ApiResponse<RegistrationPeriod[]>>(
      '/registration-periods/upcoming'
    ),
    
  getPeriodsByAcademicYear: (academicYear: string) => 
    apiClient.get<ApiResponse<RegistrationPeriod[]>>(
      `/registration-periods/academic-year/${academicYear}`
    ),

  // Student group management
  addStudentGroup: (
    periodId: string,
    group: RegistrationPeriod['studentGroups'][0]
  ) => 
    apiClient.post<ApiResponse<RegistrationPeriod>>(
      `/registration-periods/${periodId}/student-groups`,
      group
    ),
    
  removeStudentGroup: (
    periodId: string,
    groupIndex: number
  ) => 
    apiClient.delete<ApiResponse<RegistrationPeriod>>(
      `/registration-periods/${periodId}/student-groups/${groupIndex}`
    ),

  // Utility functions
  checkPeriodOverlap: (startDate: string, endDate: string) => 
    apiClient.post<ApiResponse<{
      overlaps: boolean;
      overlappingPeriods?: RegistrationPeriod[];
    }>>(
      '/registration-periods/check-overlap',
      { startDate, endDate }
    )
};