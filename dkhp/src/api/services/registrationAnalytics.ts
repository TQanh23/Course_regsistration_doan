interface RegistrationMetrics {
  totalAttempts: number;
  successfulRegistrations: number;
  failedRegistrations: number;
  averageQueueTime: number;
  peakConcurrentUsers: number;
  mostPopularTimeSlots: Array<{
    timeSlot: string;
    count: number;
  }>;
  coursePopularity: Map<string, number>;
}

class RegistrationAnalyticsService {
  private static instance: RegistrationAnalyticsService;
  private metrics: RegistrationMetrics;
  private registrationHistory: Array<{
    timestamp: number;
    action: string;
    success: boolean;
    queueTime?: number;
    courseId?: string;
    error?: string;
  }>;
  private currentConcurrentUsers: number;

  private constructor() {
    this.metrics = {
      totalAttempts: 0,
      successfulRegistrations: 0,
      failedRegistrations: 0,
      averageQueueTime: 0,
      peakConcurrentUsers: 0,
      mostPopularTimeSlots: [],
      coursePopularity: new Map()
    };
    this.registrationHistory = [];
    this.currentConcurrentUsers = 0;
  }

  public static getInstance(): RegistrationAnalyticsService {
    if (!RegistrationAnalyticsService.instance) {
      RegistrationAnalyticsService.instance = new RegistrationAnalyticsService();
    }
    return RegistrationAnalyticsService.instance;
  }

  public trackRegistrationAttempt(
    courseId: string,
    success: boolean,
    queueTime?: number,
    error?: string
  ): void {
    this.metrics.totalAttempts++;
    if (success) {
      this.metrics.successfulRegistrations++;
      this.updateCoursePopularity(courseId);
    } else {
      this.metrics.failedRegistrations++;
    }

    if (queueTime) {
      this.updateAverageQueueTime(queueTime);
    }

    this.registrationHistory.push({
      timestamp: Date.now(),
      action: 'REGISTRATION',
      success,
      queueTime,
      courseId,
      error
    });
  }

  public trackUserSession(active: boolean): void {
    if (active) {
      this.currentConcurrentUsers++;
      if (this.currentConcurrentUsers > this.metrics.peakConcurrentUsers) {
        this.metrics.peakConcurrentUsers = this.currentConcurrentUsers;
      }
    } else {
      this.currentConcurrentUsers = Math.max(0, this.currentConcurrentUsers - 1);
    }
  }

  public updateTimeSlotPopularity(timeSlot: string): void {
    const existingSlot = this.metrics.mostPopularTimeSlots.find(
      slot => slot.timeSlot === timeSlot
    );

    if (existingSlot) {
      existingSlot.count++;
      this.metrics.mostPopularTimeSlots.sort((a, b) => b.count - a.count);
    } else {
      this.metrics.mostPopularTimeSlots.push({
        timeSlot,
        count: 1
      });
    }
  }

  private updateCoursePopularity(courseId: string): void {
    const currentCount = this.metrics.coursePopularity.get(courseId) || 0;
    this.metrics.coursePopularity.set(courseId, currentCount + 1);
  }

  private updateAverageQueueTime(newQueueTime: number): void {
    const totalTime = this.metrics.averageQueueTime * this.metrics.successfulRegistrations;
    this.metrics.averageQueueTime = (totalTime + newQueueTime) / (this.metrics.successfulRegistrations + 1);
  }

  public getRegistrationMetrics(): RegistrationMetrics {
    return { ...this.metrics };
  }

  public getRegistrationHistory(
    startTime?: number,
    endTime?: number
  ): Array<any> {
    return this.registrationHistory.filter(entry => {
      if (startTime && entry.timestamp < startTime) return false;
      if (endTime && entry.timestamp > endTime) return false;
      return true;
    });
  }

  public getPopularTimeSlots(limit: number = 5): Array<{ timeSlot: string; count: number }> {
    return this.metrics.mostPopularTimeSlots
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  public getPopularCourses(limit: number = 5): Array<{ courseId: string; count: number }> {
    return Array.from(this.metrics.coursePopularity.entries())
      .map(([courseId, count]) => ({ courseId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  public getCurrentLoad(): {
    currentUsers: number;
    peakUsers: number;
    loadPercentage: number;
  } {
    return {
      currentUsers: this.currentConcurrentUsers,
      peakUsers: this.metrics.peakConcurrentUsers,
      loadPercentage: (this.currentConcurrentUsers / this.metrics.peakConcurrentUsers) * 100
    };
  }

  public getSuccessRate(): number {
    if (this.metrics.totalAttempts === 0) return 0;
    return (this.metrics.successfulRegistrations / this.metrics.totalAttempts) * 100;
  }

  public clearMetrics(): void {
    this.metrics = {
      totalAttempts: 0,
      successfulRegistrations: 0,
      failedRegistrations: 0,
      averageQueueTime: 0,
      peakConcurrentUsers: 0,
      mostPopularTimeSlots: [],
      coursePopularity: new Map()
    };
    this.registrationHistory = [];
    this.currentConcurrentUsers = 0;
  }
}