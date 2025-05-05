import React, { createContext, useContext, useState, useCallback } from 'react';
import { moduleService, classService } from '../services';
import type { Module } from '../types/module.types';
import type { CourseClass } from '../types/class.types';
import type { PaginationParams } from '../types/common.types';

interface ModuleContextType {
  selectedModule: Module | null;
  selectedClass: CourseClass | null;
  registeredClasses: CourseClass[];
  loading: boolean;
  error: string | null;
  selectModule: (module: Module | null) => void;
  selectClass: (courseClass: CourseClass | null) => void;
  fetchModules: (params?: PaginationParams) => Promise<void>;
  fetchClasses: (moduleId: string) => Promise<void>;
  registerForClass: (classId: string, studentId: string) => Promise<void>;
  withdrawFromClass: (classId: string, studentId: string) => Promise<void>;
  fetchRegisteredClasses: (studentId: string) => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType | undefined>(undefined);

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedClass, setSelectedClass] = useState<CourseClass | null>(null);
  const [registeredClasses, setRegisteredClasses] = useState<CourseClass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectModule = useCallback((module: Module | null) => {
    setSelectedModule(module);
    setSelectedClass(null);
  }, []);

  const selectClass = useCallback((courseClass: CourseClass | null) => {
    setSelectedClass(courseClass);
  }, []);

  const fetchModules = useCallback(async (params?: PaginationParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moduleService.getAllModules(params);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch modules');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchClasses = useCallback(async (moduleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await classService.getClassesByModule(moduleId);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch classes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerForClass = useCallback(async (classId: string, studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await classService.enrollStudent(classId, studentId);
      await fetchRegisteredClasses(studentId);
    } catch (err: any) {
      setError(err.message || 'Failed to register for class');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const withdrawFromClass = useCallback(async (classId: string, studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      await classService.withdrawStudent(classId, studentId);
      setRegisteredClasses(prev => prev.filter(c => c.id !== classId));
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw from class');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRegisteredClasses = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await classService.getRegisteredCourses(studentId);
      setRegisteredClasses(response.data.data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registered classes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ModuleContext.Provider
      value={{
        selectedModule,
        selectedClass,
        registeredClasses,
        loading,
        error,
        selectModule,
        selectClass,
        fetchModules,
        fetchClasses,
        registerForClass,
        withdrawFromClass,
        fetchRegisteredClasses,
      }}
    >
      {children}
    </ModuleContext.Provider>
  );
};

export const useModule = () => {
  const context = useContext(ModuleContext);
  if (context === undefined) {
    throw new Error('useModule must be used within a ModuleProvider');
  }
  return context;
};