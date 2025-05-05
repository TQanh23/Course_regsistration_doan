import { RegistrationQueue } from '../utils/registrationQueue';

interface RegistrationPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'upcoming' | 'closed';
  maxStudentsPerWindow: number;
  courseGroups: string[];
}

interface RegistrationWindow {
  id: string;
  periodId: string;
  studentId: string;
  startTime: Date;
  endTime: Date;
}

export class RegistrationPeriodService {
  private static instance: RegistrationPeriodService;
  private registrationPeriods: Map<string, RegistrationPeriod>;
  private registrationWindows: Map<string, RegistrationWindow[]>;
  private queue: RegistrationQueue;

  private constructor() {
    this.registrationPeriods = new Map();
    this.registrationWindows = new Map();
    this.queue = RegistrationQueue.getInstance({
      maxConcurrent: 10,
      processingTimeout: 15000,
      retryAttempts: 2
    });
  }

  public static getInstance(): RegistrationPeriodService {
    if (!RegistrationPeriodService.instance) {
      RegistrationPeriodService.instance = new RegistrationPeriodService();
    }
    return RegistrationPeriodService.instance;
  }

  public refreshRegistrationStatus(): void {
    const now = new Date();
    
    this.registrationPeriods.forEach((period, id) => {
      const startDate = new Date(period.startDate);
      const endDate = new Date(period.endDate);

      if (now >= startDate && now <= endDate) {
        period.status = 'active';
      } else if (now < startDate) {
        period.status = 'upcoming';
      } else {
        period.status = 'closed';
      }
    });
  }

  public getActiveRegistrationPeriods(): RegistrationPeriod[] {
    return Array.from(this.registrationPeriods.values())
      .filter(period => period.status === 'active')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  public getUpcomingRegistrationPeriods(): RegistrationPeriod[] {
    return Array.from(this.registrationPeriods.values())
      .filter(period => period.status === 'upcoming')
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  public getStudentRegistrationWindows(studentId: string): RegistrationWindow[] {
    return Array.from(this.registrationWindows.values())
      .flat()
      .filter(window => window.studentId === studentId)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  public canStudentRegister(studentId: string, courseGroupId: string): { 
    canRegister: boolean; 
    reason?: string 
  } {
    const now = new Date();
    const activePeriods = this.getActiveRegistrationPeriods();
    
    // Find a period that includes this course group
    const eligiblePeriod = activePeriods.find(period => 
      period.courseGroups.includes(courseGroupId)
    );

    if (!eligiblePeriod) {
      return { 
        canRegister: false, 
        reason: 'No active registration period for this course' 
      };
    }

    // Check if student has an active window in this period
    const studentWindows = this.getStudentRegistrationWindows(studentId);
    const activeWindow = studentWindows.find(window => 
      window.periodId === eligiblePeriod.id &&
      now >= new Date(window.startTime) &&
      now <= new Date(window.endTime)
    );

    if (!activeWindow) {
      return { 
        canRegister: false, 
        reason: 'No active registration window for this student' 
      };
    }

    return { canRegister: true };
  }

  public createRegistrationPeriod(period: Omit<RegistrationPeriod, 'id' | 'status'>): string {
    const id = crypto.randomUUID();
    const now = new Date();
    const startDate = new Date(period.startDate);
    
    const newPeriod: RegistrationPeriod = {
      ...period,
      id,
      status: now >= startDate ? 'active' : 'upcoming'
    };

    this.registrationPeriods.set(id, newPeriod);
    return id;
  }

  public createRegistrationWindow(
    periodId: string,
    studentId: string,
    startTime: Date,
    endTime: Date
  ): boolean {
    const period = this.registrationPeriods.get(periodId);
    if (!period) return false;

    const newWindow: RegistrationWindow = {
      id: crypto.randomUUID(),
      periodId,
      studentId,
      startTime,
      endTime
    };

    const periodWindows = this.registrationWindows.get(periodId) || [];
    this.registrationWindows.set(periodId, [...periodWindows, newWindow]);
    
    return true;
  }

  public updateRegistrationPeriod(id: string, updates: Partial<RegistrationPeriod>): boolean {
    const period = this.registrationPeriods.get(id);
    if (!period) return false;

    this.registrationPeriods.set(id, { ...period, ...updates });
    return true;
  }

  public deleteRegistrationPeriod(id: string): boolean {
    const deleted = this.registrationPeriods.delete(id);
    if (deleted) {
      this.registrationWindows.delete(id);
    }
    return deleted;
  }

  public async queueRegistrationRequest<T>(
    data: T,
    priority: number = 1,
    processor: (data: T) => Promise<any>
  ): Promise<any> {
    return this.queue.enqueue(data, priority, processor);
  }
}