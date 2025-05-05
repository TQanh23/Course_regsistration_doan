type CacheEntry<T> = {
  data: T;
  timestamp: number;
  expiresIn: number;
};

export class ApiCache {
  private static instance: ApiCache;
  private cache: Map<string, CacheEntry<any>>;
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL

  private constructor() {
    this.cache = new Map();
  }

  public static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  public set<T>(key: string, data: T, expiresIn: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  public get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const isExpired = Date.now() > entry.timestamp + entry.expiresIn;
    
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  public clear(): void {
    this.cache.clear();
  }

  public remove(key: string): void {
    this.cache.delete(key);
  }

  public has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }
    
    const isExpired = Date.now() > entry.timestamp + entry.expiresIn;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Specialized methods for registration-related data
  public setCourseData(moduleId: string, data: any): void {
    // Cache course data for 1 hour during registration periods
    this.set(`course:${moduleId}`, data, 60 * 60 * 1000);
  }

  public setClassSchedule(classId: string, data: any): void {
    // Cache class schedules for 30 minutes
    this.set(`schedule:${classId}`, data, 30 * 60 * 1000);
  }

  public setStudentEnrollments(studentId: string, data: any): void {
    // Cache student enrollments for 5 minutes during active registration
    this.set(`enrollments:${studentId}`, data, 5 * 60 * 1000);
  }

  // Utility method to generate consistent cache keys
  public static createKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }

  // Clear expired entries
  public clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.expiresIn) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all data related to a specific registration period
  public clearPeriodData(periodId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(periodId)) {
        this.cache.delete(key);
      }
    }
  }

  // Set up automatic cleanup of expired entries
  public startCleanupInterval(interval: number = 15 * 60 * 1000): void {
    setInterval(() => this.clearExpired(), interval);
  }
}