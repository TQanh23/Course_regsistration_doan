import { academicCalendarUtils } from './academicCalendar';
import type { CourseClass } from '../types/class.types';

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const scheduleValidationUtils = {
  checkTimeOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    if (slot1.dayOfWeek !== slot2.dayOfWeek) {
      return false;
    }

    const start1 = new Date(`1970-01-01T${slot1.startTime}`);
    const end1 = new Date(`1970-01-01T${slot1.endTime}`);
    const start2 = new Date(`1970-01-01T${slot2.startTime}`);
    const end2 = new Date(`1970-01-01T${slot2.endTime}`);

    return start1 < end2 && end1 > start2;
  },

  validateTimeSlot(timeSlot: TimeSlot): boolean {
    // Check if the time slot is within valid academic hours
    const validTimeSlots = academicCalendarUtils.getTimeSlots();
    return validTimeSlots.some(slot =>
      slot.start === timeSlot.startTime && slot.end === timeSlot.endTime
    );
  },

  findScheduleConflicts(
    proposedClass: CourseClass,
    existingClasses: CourseClass[]
  ): Array<{
    conflictingClass: CourseClass;
    conflictingSlots: Array<{
      proposed: TimeSlot;
      existing: TimeSlot;
    }>;
  }> {
    const conflicts = [];

    for (const existingClass of existingClasses) {
      const conflictingSlots = [];

      for (const proposedSlot of proposedClass.schedule) {
        for (const existingSlot of existingClass.schedule) {
          if (this.checkTimeOverlap(proposedSlot, existingSlot)) {
            conflictingSlots.push({
              proposed: proposedSlot,
              existing: existingSlot
            });
          }
        }
      }

      if (conflictingSlots.length > 0) {
        conflicts.push({
          conflictingClass: existingClass,
          conflictingSlots
        });
      }
    }

    return conflicts;
  },

  calculateDailySchedule(classes: CourseClass[]): Array<{
    dayOfWeek: number;
    classes: Array<{
      class: CourseClass;
      timeSlot: TimeSlot;
    }>;
  }> {
    const schedule = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      classes: []
    }));

    for (const classItem of classes) {
      for (const timeSlot of classItem.schedule) {
        schedule[timeSlot.dayOfWeek].classes.push({
          class: classItem,
          timeSlot
        });
      }
    }

    // Sort classes by start time for each day
    for (const day of schedule) {
      day.classes.sort((a, b) => {
        const timeA = new Date(`1970-01-01T${a.timeSlot.startTime}`).getTime();
        const timeB = new Date(`1970-01-01T${b.timeSlot.startTime}`).getTime();
        return timeA - timeB;
      });
    }

    return schedule;
  },

  calculateBreaksBetweenClasses(schedule: CourseClass[]): Array<{
    dayOfWeek: number;
    breaks: Array<{
      startTime: string;
      endTime: string;
      duration: number;
    }>;
  }> {
    const dailySchedule = this.calculateDailySchedule(schedule);
    const breaks = [];

    for (const day of dailySchedule) {
      const dayBreaks = [];
      const { classes } = day;

      for (let i = 0; i < classes.length - 1; i++) {
        const currentClass = classes[i];
        const nextClass = classes[i + 1];

        const breakStart = new Date(`1970-01-01T${currentClass.timeSlot.endTime}`);
        const breakEnd = new Date(`1970-01-01T${nextClass.timeSlot.startTime}`);
        const duration = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60); // Duration in minutes

        if (duration > 0) {
          dayBreaks.push({
            startTime: currentClass.timeSlot.endTime,
            endTime: nextClass.timeSlot.startTime,
            duration
          });
        }
      }

      breaks.push({
        dayOfWeek: day.dayOfWeek,
        breaks: dayBreaks
      });
    }

    return breaks;
  },

  validateScheduleBalance(schedule: CourseClass[]): {
    isBalanced: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues = [];
    const recommendations = [];
    const dailySchedule = this.calculateDailySchedule(schedule);
    const breaks = this.calculateBreaksBetweenClasses(schedule);

    // Check for overloaded days
    for (const day of dailySchedule) {
      if (day.classes.length > 4) {
        issues.push(`${academicCalendarUtils.getDayOfWeekName(day.dayOfWeek)} has too many classes (${day.classes.length})`);
        recommendations.push(`Consider redistributing classes from ${academicCalendarUtils.getDayOfWeekName(day.dayOfWeek)}`);
      }
    }

    // Check for long breaks
    for (const day of breaks) {
      for (const breakPeriod of day.breaks) {
        if (breakPeriod.duration > 120) { // More than 2 hours
          issues.push(`Long break (${breakPeriod.duration} minutes) on ${academicCalendarUtils.getDayOfWeekName(day.dayOfWeek)}`);
          recommendations.push(`Consider rescheduling classes to reduce break time on ${academicCalendarUtils.getDayOfWeekName(day.dayOfWeek)}`);
        }
      }
    }

    // Check for early morning followed by late evening classes
    for (const day of dailySchedule) {
      const classes = day.classes;
      if (classes.length >= 2) {
        const firstClass = classes[0];
        const lastClass = classes[classes.length - 1];
        
        const firstStartTime = new Date(`1970-01-01T${firstClass.timeSlot.startTime}`);
        const lastEndTime = new Date(`1970-01-01T${lastClass.timeSlot.endTime}`);
        
        if (firstStartTime.getHours() <= 8 && lastEndTime.getHours() >= 17) {
          issues.push(`Long day on ${academicCalendarUtils.getDayOfWeekName(day.dayOfWeek)} (early morning to late evening)`);
          recommendations.push(`Consider redistributing classes on ${academicCalendarUtils.getDayOfWeekName(day.dayOfWeek)} to avoid early-late combination`);
        }
      }
    }

    return {
      isBalanced: issues.length === 0,
      issues,
      recommendations
    };
  }
};