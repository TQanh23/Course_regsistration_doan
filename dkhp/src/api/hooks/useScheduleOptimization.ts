import { useState, useCallback } from 'react';
import { scheduleValidationUtils } from '../utils/scheduleValidation';
import { academicCalendarUtils } from '../utils/academicCalendar';
import { useRegistrationQueue } from './useRegistrationQueue';
import { useStudent } from '../context/StudentContext';
import type { CourseClass } from '../types/class.types';

interface OptimizationResult {
  isOptimal: boolean;
  conflicts: any[];
  suggestions: string[];
  alternativeSchedules: CourseClass[][];
}

export const useScheduleOptimization = () => {
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult>({
    isOptimal: true,
    conflicts: [],
    suggestions: [],
    alternativeSchedules: []
  });

  const { student } = useStudent();
  const { enqueueRegistration } = useRegistrationQueue();

  const validateAndOptimizeSchedule = useCallback(async (
    proposedClasses: CourseClass[],
    existingClasses: CourseClass[]
  ): Promise<OptimizationResult> => {
    const conflicts = [];
    const suggestions = [];
    const alternativeSchedules = [];

    // Check for time conflicts
    for (const proposedClass of proposedClasses) {
      const classConflicts = scheduleValidationUtils.findScheduleConflicts(
        proposedClass,
        existingClasses
      );
      conflicts.push(...classConflicts);
    }

    // Validate schedule balance
    const allClasses = [...existingClasses, ...proposedClasses];
    const balanceResult = scheduleValidationUtils.validateScheduleBalance(allClasses);
    
    if (!balanceResult.isBalanced) {
      suggestions.push(...balanceResult.recommendations);
    }

    // Generate alternative schedules if conflicts exist
    if (conflicts.length > 0) {
      const alternatives = await generateAlternativeSchedules(
        proposedClasses,
        existingClasses
      );
      alternativeSchedules.push(...alternatives);
    }

    const result = {
      isOptimal: conflicts.length === 0 && balanceResult.isBalanced,
      conflicts,
      suggestions,
      alternativeSchedules
    };

    setOptimizationResult(result);
    return result;
  }, []);

  const generateAlternativeSchedules = useCallback(async (
    proposedClasses: CourseClass[],
    existingClasses: CourseClass[]
  ): Promise<CourseClass[][]> => {
    const alternatives: CourseClass[][] = [];
    const maxAlternatives = 3;

    // For each conflicting class, try to find alternative sections
    for (const proposedClass of proposedClasses) {
      try {
        // Enqueue a request to fetch alternative sections
        const alternativeSections = await enqueueRegistration({
          type: 'FETCH_ALTERNATIVE_SECTIONS',
          data: {
            courseId: proposedClass.courseId,
            excludeClassId: proposedClass.id
          }
        });

        // Filter alternatives that don't conflict with existing schedule
        const validAlternatives = alternativeSections.filter(section => {
          const conflicts = scheduleValidationUtils.findScheduleConflicts(
            section,
            existingClasses
          );
          return conflicts.length === 0;
        });

        if (validAlternatives.length > 0) {
          // Create new schedule combinations with alternative sections
          for (const alternative of validAlternatives) {
            const newSchedule = proposedClasses.map(cls =>
              cls.id === proposedClass.id ? alternative : cls
            );
            
            // Validate the new schedule
            const balanceResult = scheduleValidationUtils.validateScheduleBalance([
              ...existingClasses,
              ...newSchedule
            ]);

            if (balanceResult.isBalanced) {
              alternatives.push(newSchedule);
              if (alternatives.length >= maxAlternatives) break;
            }
          }
        }
      } catch (error) {
        console.error('Error fetching alternative sections:', error);
      }
    }

    return alternatives;
  }, [enqueueRegistration]);

  const calculateScheduleQuality = useCallback((
    schedule: CourseClass[]
  ): {
    score: number;
    factors: Array<{ name: string; score: number; weight: number }>;
  } => {
    const factors = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Factor 1: Break distribution (weight: 0.3)
    const breaks = scheduleValidationUtils.calculateBreaksBetweenClasses(schedule);
    let breakScore = 100;
    for (const day of breaks) {
      for (const breakPeriod of day.breaks) {
        if (breakPeriod.duration < 15) breakScore -= 10; // Too short
        if (breakPeriod.duration > 120) breakScore -= 15; // Too long
      }
    }
    factors.push({ name: 'Break Distribution', score: breakScore, weight: 0.3 });
    totalScore += breakScore * 0.3;
    totalWeight += 0.3;

    // Factor 2: Daily load balance (weight: 0.25)
    const dailySchedule = scheduleValidationUtils.calculateDailySchedule(schedule);
    let balanceScore = 100;
    const classesPerDay = dailySchedule.map(day => day.classes.length);
    const avgClassesPerDay = classesPerDay.reduce((a, b) => a + b, 0) / classesPerDay.filter(n => n > 0).length;
    
    for (const day of dailySchedule) {
      if (day.classes.length > 0) {
        const deviation = Math.abs(day.classes.length - avgClassesPerDay);
        balanceScore -= deviation * 10;
      }
    }
    factors.push({ name: 'Daily Load Balance', score: balanceScore, weight: 0.25 });
    totalScore += balanceScore * 0.25;
    totalWeight += 0.25;

    // Factor 3: Time preference alignment (weight: 0.25)
    const timePreferenceScore = calculateTimePreferenceScore(schedule);
    factors.push({ name: 'Time Preferences', score: timePreferenceScore, weight: 0.25 });
    totalScore += timePreferenceScore * 0.25;
    totalWeight += 0.25;

    // Factor 4: Travel time optimization (weight: 0.2)
    const travelScore = calculateTravelScore(schedule);
    factors.push({ name: 'Travel Optimization', score: travelScore, weight: 0.2 });
    totalScore += travelScore * 0.2;
    totalWeight += 0.2;

    return {
      score: totalScore / totalWeight,
      factors
    };
  }, []);

  // Helper function to calculate time preference score
  const calculateTimePreferenceScore = (schedule: CourseClass[]): number => {
    let score = 100;
    const dailySchedule = scheduleValidationUtils.calculateDailySchedule(schedule);

    for (const day of dailySchedule) {
      for (const classItem of day.classes) {
        const startHour = new Date(`1970-01-01T${classItem.timeSlot.startTime}`).getHours();
        
        // Penalize very early or very late classes
        if (startHour <= 7) score -= 15;
        if (startHour >= 17) score -= 10;
        
        // Prefer mid-morning to early afternoon classes
        if (startHour >= 9 && startHour <= 15) score += 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  };

  // Helper function to calculate travel optimization score
  const calculateTravelScore = (schedule: CourseClass[]): number => {
    let score = 100;
    const dailySchedule = scheduleValidationUtils.calculateDailySchedule(schedule);

    for (const day of dailySchedule) {
      const { classes } = day;
      for (let i = 0; i < classes.length - 1; i++) {
        const currentClass = classes[i];
        const nextClass = classes[i + 1];

        // Penalize room changes between consecutive classes
        if (currentClass.class.roomId !== nextClass.class.roomId) {
          score -= 5;
        }

        // Penalize building changes between consecutive classes
        if (currentClass.class.buildingId !== nextClass.class.buildingId) {
          score -= 10;
        }
      }
    }

    return Math.max(0, score);
  };

  return {
    optimizationResult,
    validateAndOptimizeSchedule,
    generateAlternativeSchedules,
    calculateScheduleQuality
  };
};