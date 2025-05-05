import type { RegistrationPeriod } from '../types/registration.types';
import type { StudentEnrollment } from '../types/student.types';
import { CourseClass } from '../types/class.types';

export class RegistrationError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'RegistrationError';
    this.code = code;
    this.details = details;
  }
}

export const validateRegistrationPeriod = (period: RegistrationPeriod | null): void => {
  if (!period) {
    throw new RegistrationError(
      'No active registration period',
      'NO_ACTIVE_PERIOD'
    );
  }

  if (period.status !== 'active') {
    throw new RegistrationError(
      'Registration period is not active',
      'INACTIVE_PERIOD',
      { status: period.status }
    );
  }

  const now = new Date();
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);

  if (now < startDate) {
    throw new RegistrationError(
      'Registration period has not started yet',
      'PERIOD_NOT_STARTED',
      { startDate }
    );
  }

  if (now > endDate) {
    throw new RegistrationError(
      'Registration period has ended',
      'PERIOD_ENDED',
      { endDate }
    );
  }
};

export const validateClassRegistration = (
  courseClass: CourseClass,
  currentEnrollments: StudentEnrollment[]
): void => {
  // Check if class is full
  if (courseClass.enrolledStudents >= courseClass.maxStudents) {
    throw new RegistrationError(
      'Class is full',
      'CLASS_FULL',
      {
        enrolled: courseClass.enrolledStudents,
        maximum: courseClass.maxStudents
      }
    );
  }

  // Check for schedule conflicts
  const hasConflict = currentEnrollments.some(enrollment => {
    const enrolledClass = enrollment.classId;
    return checkScheduleConflict(courseClass, enrolledClass);
  });

  if (hasConflict) {
    throw new RegistrationError(
      'Schedule conflict with existing enrollment',
      'SCHEDULE_CONFLICT'
    );
  }
};

export const validateCreditLimit = (
  currentCredits: number,
  newCredits: number,
  maxCredits: number
): void => {
  if (currentCredits + newCredits > maxCredits) {
    throw new RegistrationError(
      'Exceeds maximum credit limit',
      'CREDIT_LIMIT_EXCEEDED',
      {
        current: currentCredits,
        adding: newCredits,
        maximum: maxCredits
      }
    );
  }
};

export const validatePrerequisites = (
  missingPrerequisites: string[]
): void => {
  if (missingPrerequisites.length > 0) {
    throw new RegistrationError(
      'Missing prerequisites',
      'PREREQUISITES_NOT_MET',
      { missingPrerequisites }
    );
  }
};

// Helper function to check schedule conflicts
const checkScheduleConflict = (class1: CourseClass, class2: CourseClass): boolean => {
  for (const slot1 of class1.schedule) {
    for (const slot2 of class2.schedule) {
      if (slot1.dayOfWeek === slot2.dayOfWeek) {
        const start1 = new Date(`1970-01-01T${slot1.startTime}`);
        const end1 = new Date(`1970-01-01T${slot1.endTime}`);
        const start2 = new Date(`1970-01-01T${slot2.startTime}`);
        const end2 = new Date(`1970-01-01T${slot2.endTime}`);

        if (start1 < end2 && end1 > start2) {
          return true;
        }
      }
    }
  }
  return false;
};