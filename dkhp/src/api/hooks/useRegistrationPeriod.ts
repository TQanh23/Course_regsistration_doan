import { useState, useEffect, useCallback } from 'react';
import { RegistrationPeriodService } from '../services/registrationPeriod';

interface UseRegistrationPeriodReturn {
  activePeriods: any[];
  upcomingPeriods: any[];
  studentWindows: any[];
  canRegisterForCourse: (courseGroupId: string) => { canRegister: boolean; reason?: string };
  createRegistrationPeriod: (period: any) => string;
  createRegistrationWindow: (params: {
    periodId: string;
    studentId: string;
    startTime: Date;
    endTime: Date;
  }) => boolean;
  updatePeriod: (id: string, updates: any) => boolean;
  deletePeriod: (id: string) => boolean;
  refreshStatus: () => void;
}

export const useRegistrationPeriod = (studentId?: string): UseRegistrationPeriodReturn => {
  const [activePeriods, setActivePeriods] = useState<any[]>([]);
  const [upcomingPeriods, setUpcomingPeriods] = useState<any[]>([]);
  const [studentWindows, setStudentWindows] = useState<any[]>([]);

  const registrationService = RegistrationPeriodService.getInstance();

  const refreshPeriods = useCallback(() => {
    registrationService.refreshRegistrationStatus();
    setActivePeriods(registrationService.getActiveRegistrationPeriods());
    setUpcomingPeriods(registrationService.getUpcomingRegistrationPeriods());
    if (studentId) {
      setStudentWindows(registrationService.getStudentRegistrationWindows(studentId));
    }
  }, [studentId]);

  useEffect(() => {
    refreshPeriods();
    // Set up periodic refresh
    const intervalId = setInterval(refreshPeriods, 60000); // Refresh every minute

    return () => clearInterval(intervalId);
  }, [refreshPeriods]);

  const canRegisterForCourse = useCallback(
    (courseGroupId: string) => {
      if (!studentId) {
        return { canRegister: false, reason: 'No student ID provided' };
      }
      return registrationService.canStudentRegister(studentId, courseGroupId);
    },
    [studentId]
  );

  const createRegistrationPeriod = useCallback(
    (period: any) => {
      const id = registrationService.createRegistrationPeriod(period);
      refreshPeriods();
      return id;
    },
    [refreshPeriods]
  );

  const createRegistrationWindow = useCallback(
    (params: {
      periodId: string;
      studentId: string;
      startTime: Date;
      endTime: Date;
    }) => {
      const success = registrationService.createRegistrationWindow(
        params.periodId,
        params.studentId,
        params.startTime,
        params.endTime
      );
      if (success) {
        refreshPeriods();
      }
      return success;
    },
    [refreshPeriods]
  );

  const updatePeriod = useCallback(
    (id: string, updates: any) => {
      const success = registrationService.updateRegistrationPeriod(id, updates);
      if (success) {
        refreshPeriods();
      }
      return success;
    },
    [refreshPeriods]
  );

  const deletePeriod = useCallback(
    (id: string) => {
      const success = registrationService.deleteRegistrationPeriod(id);
      if (success) {
        refreshPeriods();
      }
      return success;
    },
    [refreshPeriods]
  );

  return {
    activePeriods,
    upcomingPeriods,
    studentWindows,
    canRegisterForCourse,
    createRegistrationPeriod,
    createRegistrationWindow,
    updatePeriod,
    deletePeriod,
    refreshStatus: refreshPeriods
  };
};