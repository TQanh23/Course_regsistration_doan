import { useState, useEffect, useCallback } from 'react';
import { RegistrationAnalyticsService } from '../services/registrationAnalytics';

interface AnalyticsData {
  currentLoad: {
    currentUsers: number;
    peakUsers: number;
    loadPercentage: number;
  };
  successRate: number;
  popularTimeSlots: Array<{ timeSlot: string; count: number }>;
  popularCourses: Array<{ courseId: string; count: number }>;
  metrics: {
    totalAttempts: number;
    successfulRegistrations: number;
    failedRegistrations: number;
    averageQueueTime: number;
  };
}

export const useRegistrationAnalytics = (refreshInterval: number = 5000) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    currentLoad: {
      currentUsers: 0,
      peakUsers: 0,
      loadPercentage: 0
    },
    successRate: 0,
    popularTimeSlots: [],
    popularCourses: [],
    metrics: {
      totalAttempts: 0,
      successfulRegistrations: 0,
      failedRegistrations: 0,
      averageQueueTime: 0
    }
  });

  const analytics = RegistrationAnalyticsService.getInstance();

  const refreshAnalytics = useCallback(() => {
    const metrics = analytics.getRegistrationMetrics();
    const currentLoad = analytics.getCurrentLoad();
    const successRate = analytics.getSuccessRate();
    const popularTimeSlots = analytics.getPopularTimeSlots();
    const popularCourses = analytics.getPopularCourses();

    setAnalyticsData({
      currentLoad,
      successRate,
      popularTimeSlots,
      popularCourses,
      metrics: {
        totalAttempts: metrics.totalAttempts,
        successfulRegistrations: metrics.successfulRegistrations,
        failedRegistrations: metrics.failedRegistrations,
        averageQueueTime: metrics.averageQueueTime
      }
    });
  }, []);

  const getHistoricalData = useCallback((
    startTime?: number,
    endTime?: number
  ) => {
    return analytics.getRegistrationHistory(startTime, endTime);
  }, []);

  const trackRegistrationAttempt = useCallback((
    courseId: string,
    success: boolean,
    queueTime?: number,
    error?: string
  ) => {
    analytics.trackRegistrationAttempt(courseId, success, queueTime, error);
    refreshAnalytics();
  }, [refreshAnalytics]);

  const trackTimeSlot = useCallback((timeSlot: string) => {
    analytics.updateTimeSlotPopularity(timeSlot);
    refreshAnalytics();
  }, [refreshAnalytics]);

  // Set up periodic refresh
  useEffect(() => {
    refreshAnalytics();
    const intervalId = setInterval(refreshAnalytics, refreshInterval);

    // Track user session
    analytics.trackUserSession(true);

    return () => {
      clearInterval(intervalId);
      analytics.trackUserSession(false);
    };
  }, [refreshInterval, refreshAnalytics]);

  const getLoadStatus = useCallback((): 'low' | 'medium' | 'high' | 'critical' => {
    const { loadPercentage } = analyticsData.currentLoad;
    if (loadPercentage < 30) return 'low';
    if (loadPercentage < 60) return 'medium';
    if (loadPercentage < 90) return 'high';
    return 'critical';
  }, [analyticsData.currentLoad]);

  const getPerformanceMetrics = useCallback(() => {
    const { metrics } = analyticsData;
    return {
      averageQueueTime: metrics.averageQueueTime,
      successRate: analyticsData.successRate,
      failureRate: (metrics.failedRegistrations / metrics.totalAttempts) * 100,
      totalTransactions: metrics.totalAttempts
    };
  }, [analyticsData]);

  const getPopularityInsights = useCallback(() => {
    return {
      timeSlots: analyticsData.popularTimeSlots,
      courses: analyticsData.popularCourses,
      peakTimes: analyticsData.popularTimeSlots.slice(0, 3)
    };
  }, [analyticsData]);

  return {
    analyticsData,
    refreshAnalytics,
    getHistoricalData,
    trackRegistrationAttempt,
    trackTimeSlot,
    getLoadStatus,
    getPerformanceMetrics,
    getPopularityInsights
  };
};