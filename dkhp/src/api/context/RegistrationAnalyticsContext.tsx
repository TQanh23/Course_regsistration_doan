import React, { createContext, useContext, useState, useCallback } from 'react';
import { registrationAnalyticsService } from '../services/registrationAnalyticsService';
import { useRegistration } from './RegistrationContext';
import { useStudent } from './StudentContext';
import { useDepartment } from './DepartmentContext';

interface AnalyticsContextState {
  registrationStats: any | null;
  liveMetrics: any | null;
  studentPatterns: any | null;
  departmentAnalytics: any | null;
  loading: boolean;
  error: string | null;
}

interface AnalyticsContextType extends AnalyticsContextState {
  fetchRegistrationStats: (periodId: string) => Promise<void>;
  fetchLiveMetrics: () => Promise<void>;
  fetchStudentPatterns: (studentId: string) => Promise<void>;
  fetchDepartmentAnalytics: (departmentId: string) => Promise<void>;
  exportData: (format: 'csv' | 'json' | 'excel') => Promise<Blob>;
}

const RegistrationAnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const RegistrationAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AnalyticsContextState>({
    registrationStats: null,
    liveMetrics: null,
    studentPatterns: null,
    departmentAnalytics: null,
    loading: false,
    error: null,
  });

  const { currentPeriod } = useRegistration();
  const { student } = useStudent();
  const { selectedDepartment } = useDepartment();

  const fetchRegistrationStats = useCallback(async (periodId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await registrationAnalyticsService.getPeriodStats(periodId);
      setState(prev => ({
        ...prev,
        registrationStats: response.data.data,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to fetch registration statistics',
      }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchLiveMetrics = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await registrationAnalyticsService.getLiveMetrics();
      setState(prev => ({
        ...prev,
        liveMetrics: response.data.data,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to fetch live metrics',
      }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchStudentPatterns = useCallback(async (studentId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await registrationAnalyticsService.getStudentPatterns(studentId);
      setState(prev => ({
        ...prev,
        studentPatterns: response.data.data,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to fetch student patterns',
      }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const fetchDepartmentAnalytics = useCallback(async (departmentId: string) => {
    if (!currentPeriod?.id) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await registrationAnalyticsService.getDepartmentAnalytics(
        departmentId,
        currentPeriod.id
      );
      setState(prev => ({
        ...prev,
        departmentAnalytics: response.data.data,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to fetch department analytics',
      }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [currentPeriod?.id]);

  const exportData = useCallback(async (format: 'csv' | 'json' | 'excel') => {
    if (!currentPeriod?.id) {
      throw new Error('No active registration period');
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await registrationAnalyticsService.exportRegistrationData(
        currentPeriod.id,
        format
      );
      return response.data;
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        error: err.message || 'Failed to export registration data',
      }));
      throw err;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [currentPeriod?.id]);

  // Set up periodic refresh of live metrics
  React.useEffect(() => {
    if (!currentPeriod?.id) return;

    const refreshInterval = setInterval(fetchLiveMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(refreshInterval);
  }, [currentPeriod?.id, fetchLiveMetrics]);

  // Auto-fetch relevant analytics when context dependencies change
  React.useEffect(() => {
    if (currentPeriod?.id) {
      fetchRegistrationStats(currentPeriod.id);
    }
  }, [currentPeriod?.id, fetchRegistrationStats]);

  React.useEffect(() => {
    if (student?.id) {
      fetchStudentPatterns(student.id);
    }
  }, [student?.id, fetchStudentPatterns]);

  React.useEffect(() => {
    if (selectedDepartment?.id) {
      fetchDepartmentAnalytics(selectedDepartment.id);
    }
  }, [selectedDepartment?.id, fetchDepartmentAnalytics]);

  return (
    <RegistrationAnalyticsContext.Provider
      value={{
        ...state,
        fetchRegistrationStats,
        fetchLiveMetrics,
        fetchStudentPatterns,
        fetchDepartmentAnalytics,
        exportData,
      }}
    >
      {children}
    </RegistrationAnalyticsContext.Provider>
  );
};

export const useRegistrationAnalytics = () => {
  const context = useContext(RegistrationAnalyticsContext);
  if (context === undefined) {
    throw new Error('useRegistrationAnalytics must be used within a RegistrationAnalyticsProvider');
  }
  return context;
};