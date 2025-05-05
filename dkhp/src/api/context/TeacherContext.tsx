import React, { createContext, useContext, useState, useCallback } from 'react';
import { teacherService } from '../services';
import type { Teacher, TeacherSchedule } from '../types/teacher.types';
import type { PaginationParams } from '../types/common.types';

interface TeacherContextType {
  selectedTeacher: Teacher | null;
  teacherSchedule: TeacherSchedule | null;
  loading: boolean;
  error: string | null;
  selectTeacher: (teacher: Teacher | null) => void;
  fetchTeachers: (params?: PaginationParams) => Promise<void>;
  fetchTeacherSchedule: (teacherId: string) => Promise<void>;
  fetchTeachersByDepartment: (departmentId: string) => Promise<void>;
  updateTeacherStatus: (teacherId: string, status: Teacher['status']) => Promise<void>;
  checkTeacherAvailability: (teacherId: string, timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => Promise<boolean>;
}

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export const TeacherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherSchedule, setTeacherSchedule] = useState<TeacherSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectTeacher = useCallback((teacher: Teacher | null) => {
    setSelectedTeacher(teacher);
    if (!teacher) {
      setTeacherSchedule(null);
    }
  }, []);

  const fetchTeachers = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getAllTeachers(params);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeacherSchedule = useCallback(async (teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getTeacherSchedule(teacherId);
      setTeacherSchedule(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teacher schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachersByDepartment = useCallback(async (departmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.getTeachersByDepartment(departmentId);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch teachers by department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTeacherStatus = useCallback(async (teacherId: string, status: Teacher['status']) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.updateTeacherStatus(teacherId, status);
      if (selectedTeacher?.id === teacherId) {
        setSelectedTeacher(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update teacher status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedTeacher]);

  const checkTeacherAvailability = useCallback(async (teacherId: string, timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await teacherService.checkTeacherAvailability(teacherId, timeSlot);
      return response.data.data.available;
    } catch (err: any) {
      setError(err.message || 'Failed to check teacher availability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <TeacherContext.Provider
      value={{
        selectedTeacher,
        teacherSchedule,
        loading,
        error,
        selectTeacher,
        fetchTeachers,
        fetchTeacherSchedule,
        fetchTeachersByDepartment,
        updateTeacherStatus,
        checkTeacherAvailability,
      }}
    >
      {children}
    </TeacherContext.Provider>
  );
};

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};