import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { registrationService } from '../services/registrationService';
import type { RegistrationPeriod } from '../types/registration.types';
import { useAuth } from './AuthContext';
import { useStudent } from './StudentContext';
import { useNotification } from './NotificationContext';

interface RegistrationContextType {
  currentPeriod: RegistrationPeriod | null;
  isEligible: boolean;
  registrationError: string | null;
  loading: boolean;
  checkEligibility: () => Promise<boolean>;
  refreshCurrentPeriod: () => Promise<void>;
  waitForNextPeriod: () => Promise<void>;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export const RegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPeriod, setCurrentPeriod] = useState<RegistrationPeriod | null>(null);
  const [isEligible, setIsEligible] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { student } = useStudent();
  const { fetchNotifications } = useNotification();

  const checkEligibility = useCallback(async () => {
    if (!student?.id) return false;
    
    setLoading(true);
    setRegistrationError(null);
    try {
      const response = await registrationService.checkStudentEligibility(student.id);
      const { eligible, currentPeriod: newPeriod, reason } = response.data.data;
      
      setIsEligible(eligible);
      if (newPeriod) {
        setCurrentPeriod(newPeriod);
      }
      if (!eligible && reason) {
        setRegistrationError(reason);
      }
      
      return eligible;
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to check registration eligibility');
      return false;
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  const refreshCurrentPeriod = useCallback(async () => {
    setLoading(true);
    setRegistrationError(null);
    try {
      const response = await registrationService.getCurrentPeriod();
      const period = response.data.data;
      setCurrentPeriod(period);
      
      if (period && student?.id) {
        await checkEligibility();
      }
    } catch (err: any) {
      setRegistrationError(err.message || 'Failed to fetch current registration period');
    } finally {
      setLoading(false);
    }
  }, [student?.id, checkEligibility]);

  const waitForNextPeriod = useCallback(async () => {
    try {
      const response = await registrationService.getUpcomingPeriods();
      const upcomingPeriods = response.data.data;
      
      if (upcomingPeriods.length > 0) {
        const nextPeriod = upcomingPeriods[0];
        const startDate = new Date(nextPeriod.startDate);
        const now = new Date();
        
        if (startDate > now) {
          const timeUntilStart = startDate.getTime() - now.getTime();
          setTimeout(() => {
            refreshCurrentPeriod();
            fetchNotifications();
          }, timeUntilStart);
        }
      }
    } catch (err: any) {
      console.error('Failed to check upcoming periods:', err);
    }
  }, [refreshCurrentPeriod, fetchNotifications]);

  // Initialize registration period and eligibility check
  useEffect(() => {
    if (user?.id && student?.id) {
      refreshCurrentPeriod();
    }
  }, [user?.id, student?.id, refreshCurrentPeriod]);

  // Set up polling for registration period updates
  useEffect(() => {
    if (!user?.id || !student?.id) return;

    const pollInterval = setInterval(refreshCurrentPeriod, 5 * 60 * 1000); // Poll every 5 minutes
    
    return () => clearInterval(pollInterval);
  }, [user?.id, student?.id, refreshCurrentPeriod]);

  // Set up waiting for next period if current period is not active
  useEffect(() => {
    if (!currentPeriod) {
      waitForNextPeriod();
    }
  }, [currentPeriod, waitForNextPeriod]);

  return (
    <RegistrationContext.Provider
      value={{
        currentPeriod,
        isEligible,
        registrationError,
        loading,
        checkEligibility,
        refreshCurrentPeriod,
        waitForNextPeriod,
      }}
    >
      {children}
    </RegistrationContext.Provider>
  );
};

export const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (context === undefined) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
};