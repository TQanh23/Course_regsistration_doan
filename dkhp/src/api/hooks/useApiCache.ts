import { useEffect, useCallback } from 'react';
import { ApiCache } from '../utils/cacheUtils';
import { useRegistration } from '../context/RegistrationContext';

export const useApiCache = () => {
  const cache = ApiCache.getInstance();
  const { currentPeriod } = useRegistration();

  // Initialize cache cleanup when the hook is first used
  useEffect(() => {
    cache.startCleanupInterval();
    
    return () => {
      // Clear sensitive data on unmount
      if (currentPeriod?.id) {
        cache.clearPeriodData(currentPeriod.id);
      }
    };
  }, []);

  // Clear period-specific cache when registration period changes
  useEffect(() => {
    if (currentPeriod?.id) {
      cache.clearPeriodData(currentPeriod.id);
    }
  }, [currentPeriod?.id]);

  const getCachedData = useCallback(<T>(key: string): T | null => {
    return cache.get<T>(key);
  }, []);

  const setCachedData = useCallback(<T>(
    key: string,
    data: T,
    expiresIn?: number
  ): void => {
    cache.set(key, data, expiresIn);
  }, []);

  const invalidateCache = useCallback((key: string): void => {
    cache.remove(key);
  }, []);

  const clearAllCache = useCallback((): void => {
    cache.clear();
  }, []);

  // Wrapper for API calls that implements caching
  const withCache = useCallback(async <T>(
    key: string,
    fetchFn: () => Promise<T>,
    expiresIn?: number
  ): Promise<T> => {
    const cachedData = cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    const data = await fetchFn();
    cache.set(key, data, expiresIn);
    return data;
  }, []);

  // Specialized method for course data caching
  const withCourseCache = useCallback(async <T>(
    moduleId: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const key = ApiCache.createKey('course', moduleId);
    const cachedData = cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    const data = await fetchFn();
    cache.setCourseData(moduleId, data);
    return data;
  }, []);

  // Specialized method for schedule data caching
  const withScheduleCache = useCallback(async <T>(
    classId: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const key = ApiCache.createKey('schedule', classId);
    const cachedData = cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    const data = await fetchFn();
    cache.setClassSchedule(classId, data);
    return data;
  }, []);

  // Specialized method for enrollment data caching
  const withEnrollmentCache = useCallback(async <T>(
    studentId: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const key = ApiCache.createKey('enrollments', studentId);
    const cachedData = cache.get<T>(key);
    if (cachedData) {
      return cachedData;
    }

    const data = await fetchFn();
    cache.setStudentEnrollments(studentId, data);
    return data;
  }, []);

  return {
    getCachedData,
    setCachedData,
    invalidateCache,
    clearAllCache,
    withCache,
    withCourseCache,
    withScheduleCache,
    withEnrollmentCache,
  };
};