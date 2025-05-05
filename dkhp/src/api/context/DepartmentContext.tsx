import React, { createContext, useContext, useState, useCallback } from 'react';
import { departmentService } from '../services/departmentService';
import type { 
  Department,
  DepartmentStats,
  DepartmentSchedule 
} from '../types/department.types';
import { getCurrentSemester } from '../utils/dateUtils';

interface DepartmentContextType {
  departments: Department[];
  selectedDepartment: Department | null;
  departmentStats: DepartmentStats | null;
  departmentSchedule: DepartmentSchedule | null;
  loading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  selectDepartment: (department: Department | null) => void;
  fetchDepartmentStats: (departmentId: string) => Promise<void>;
  fetchDepartmentSchedule: (departmentId: string) => Promise<void>;
  assignHeadOfDepartment: (departmentId: string, teacherId: string) => Promise<void>;
  getAvailableRooms: (departmentId: string, timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => Promise<Array<{
    roomId: string;
    roomName: string;
    capacity: number;
  }>>;
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats | null>(null);
  const [departmentSchedule, setDepartmentSchedule] = useState<DepartmentSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentService.getAllDepartments();
      setDepartments(response.data.data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch departments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectDepartment = useCallback((department: Department | null) => {
    setSelectedDepartment(department);
    if (!department) {
      setDepartmentStats(null);
      setDepartmentSchedule(null);
    }
  }, []);

  const fetchDepartmentStats = useCallback(async (departmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentService.getDepartmentStats(departmentId);
      setDepartmentStats(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch department statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartmentSchedule = useCallback(async (departmentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { semester, academicYear } = getCurrentSemester();
      const response = await departmentService.getDepartmentSchedule(
        departmentId,
        semester,
        academicYear
      );
      setDepartmentSchedule(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch department schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignHeadOfDepartment = useCallback(async (departmentId: string, teacherId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentService.assignHeadOfDepartment(departmentId, teacherId);
      setDepartments(prev =>
        prev.map(dept =>
          dept.id === departmentId ? response.data.data : dept
        )
      );
      if (selectedDepartment?.id === departmentId) {
        setSelectedDepartment(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to assign head of department');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  const getAvailableRooms = useCallback(async (
    departmentId: string,
    timeSlot: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await departmentService.getAvailableRooms(departmentId, timeSlot);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get available rooms');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DepartmentContext.Provider
      value={{
        departments,
        selectedDepartment,
        departmentStats,
        departmentSchedule,
        loading,
        error,
        fetchDepartments,
        selectDepartment,
        fetchDepartmentStats,
        fetchDepartmentSchedule,
        assignHeadOfDepartment,
        getAvailableRooms,
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartment must be used within a DepartmentProvider');
  }
  return context;
};