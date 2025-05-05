import { useState, useCallback, useEffect } from 'react';
import { RegistrationQueue } from '../utils/registrationQueue';
import { useRegistration } from '../context/RegistrationContext';
import { useNotification } from '../context/NotificationContext';
import { useStudent } from '../context/StudentContext';

interface QueueStats {
  queueLength: number;
  activeRequests: number;
  estimatedWaitTime: number;
}

export const useRegistrationQueue = () => {
  const queue = RegistrationQueue.getInstance();
  const { currentPeriod } = useRegistration();
  const { student } = useStudent();
  const { fetchNotifications } = useNotification();
  
  const [queueStats, setQueueStats] = useState<QueueStats>({
    queueLength: 0,
    activeRequests: 0,
    estimatedWaitTime: 0,
  });

  // Update queue stats periodically
  useEffect(() => {
    const updateStats = () => {
      const queueLength = queue.getQueueLength();
      const activeRequests = queue.getActiveRequests();
      // Estimate wait time based on queue length and processing rate
      const estimatedWaitTime = (queueLength * 500) / queue.getMaxConcurrent();

      setQueueStats({
        queueLength,
        activeRequests,
        estimatedWaitTime,
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Enqueue a registration request with student priority
  const enqueueRegistration = useCallback(async <T>(
    data: T,
    requestId: string = crypto.randomUUID()
  ): Promise<T> => {
    if (!currentPeriod || !student) {
      throw new Error('No active registration period or student not found');
    }

    // Calculate priority based on student criteria
    const priority = calculateStudentPriority(student);

    try {
      const result = await queue.enqueue(requestId, data, priority);
      await fetchNotifications(); // Fetch updated notifications after registration
      return result;
    } catch (error) {
      throw error;
    }
  }, [currentPeriod, student, fetchNotifications]);

  // Cancel a pending registration request
  const cancelRegistration = useCallback((requestId: string): boolean => {
    return queue.removePendingRequest(requestId);
  }, []);

  // Get current position in queue for a request
  const getQueuePosition = useCallback((requestId: string): number => {
    const pendingRequests = queue.getPendingRequests();
    return pendingRequests.findIndex(req => req.id === requestId) + 1;
  }, []);

  // Adjust queue settings based on system load
  const adjustQueueSettings = useCallback((
    maxConcurrent?: number,
    rateLimitDelay?: number
  ) => {
    if (typeof maxConcurrent === 'number') {
      queue.setMaxConcurrent(maxConcurrent);
    }
    if (typeof rateLimitDelay === 'number') {
      queue.setRateLimitDelay(rateLimitDelay);
    }
  }, []);

  // Calculate estimated wait time for a specific request
  const getEstimatedWaitTime = useCallback((requestId: string): number => {
    const position = getQueuePosition(requestId);
    if (position === 0) return 0;
    
    const activeRequests = queue.getActiveRequests();
    const maxConcurrent = queue.getMaxConcurrent();
    const rateLimit = queue.getRateLimitDelay();
    
    return (position * rateLimit) / Math.max(1, maxConcurrent - activeRequests);
  }, [getQueuePosition]);

  return {
    queueStats,
    enqueueRegistration,
    cancelRegistration,
    getQueuePosition,
    adjustQueueSettings,
    getEstimatedWaitTime,
  };
};

// Helper function to calculate student priority
function calculateStudentPriority(student: any): number {
  let priority = 1; // Base priority

  // Increase priority for students in their final year
  if (student.enrollmentYear && new Date().getFullYear() - student.enrollmentYear >= 3) {
    priority += 2;
  }

  // Increase priority for students with high GPA
  if (student.gpa >= 3.5) {
    priority += 1;
  }

  // Increase priority for students with fewer remaining required credits
  if (student.creditsDone && student.totalCreditsRequired) {
    const remainingCredits = student.totalCreditsRequired - student.creditsDone;
    if (remainingCredits <= 30) {
      priority += 1;
    }
  }

  return priority;
}