import { apiClient } from '../config/axiosConfig';
import type { ApiResponse } from '../types/common.types';

interface RegistrationStats {
  totalRegistrations: number;
  successfulRegistrations: number;
  failedRegistrations: number;
  averageRegistrationTime: number;
  peakRegistrationTimes: Array<{
    hour: number;
    count: number;
  }>;
  popularModules: Array<{
    moduleId: string;
    moduleName: string;
    registrationCount: number;
  }>;
  registrationsByDepartment: Array<{
    departmentId: string;
    departmentName: string;
    count: number;
  }>;
}

interface ModulePopularity {
  moduleId: string;
  registrationCount: number;
  waitlistCount: number;
  fillRate: number;
  historicalDemand: Array<{
    semester: string;
    academicYear: string;
    demand: number;
  }>;
}

export const registrationAnalyticsService = {
  // Get registration statistics for a specific period
  getPeriodStats: (periodId: string) => 
    apiClient.get<ApiResponse<RegistrationStats>>(
      `/analytics/registration-periods/${periodId}/stats`
    ),

  // Get real-time registration metrics
  getLiveMetrics: () => 
    apiClient.get<ApiResponse<{
      activeUsers: number;
      pendingRegistrations: number;
      registrationsPerMinute: number;
      systemLoad: number;
    }>>(
      '/analytics/registration/live'
    ),

  // Get module popularity metrics
  getModulePopularity: (moduleId: string) => 
    apiClient.get<ApiResponse<ModulePopularity>>(
      `/analytics/modules/${moduleId}/popularity`
    ),

  // Get registration success rate by time slot
  getSuccessRateByTime: (periodId: string) => 
    apiClient.get<ApiResponse<Array<{
      timeSlot: string;
      totalAttempts: number;
      successfulAttempts: number;
      successRate: number;
    }>>>(
      `/analytics/registration-periods/${periodId}/success-rate`
    ),

  // Get student registration patterns
  getStudentPatterns: (studentId: string) => 
    apiClient.get<ApiResponse<{
      averageRegistrationSpeed: number;
      preferredTimeSlots: string[];
      successRate: number;
      commonErrors: Array<{
        error: string;
        count: number;
      }>;
    }>>(
      `/analytics/students/${studentId}/registration-patterns`
    ),

  // Get department-wide registration analytics
  getDepartmentAnalytics: (departmentId: string, periodId: string) => 
    apiClient.get<ApiResponse<{
      totalStudents: number;
      registeredStudents: number;
      averageCredits: number;
      courseDistribution: Array<{
        courseLevel: string;
        count: number;
      }>;
    }>>(
      `/analytics/departments/${departmentId}/registration-analytics`,
      { params: { periodId } }
    ),

  // Get system performance metrics during registration
  getSystemMetrics: (periodId: string) => 
    apiClient.get<ApiResponse<{
      averageResponseTime: number;
      peakConcurrentUsers: number;
      systemErrors: number;
      serverLoad: Array<{
        timestamp: string;
        cpuUsage: number;
        memoryUsage: number;
        activeConnections: number;
      }>;
    }>>(
      `/analytics/system/registration-metrics/${periodId}`
    ),

  // Export registration data for analysis
  exportRegistrationData: (periodId: string, format: 'csv' | 'json' | 'excel') => 
    apiClient.get<Blob>(
      `/analytics/export/registration-data/${periodId}`,
      {
        params: { format },
        responseType: 'blob'
      }
    )
};