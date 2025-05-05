import React, { createContext, useContext, useState, useCallback } from 'react';
import { studentService } from '../services/studentService';
import type { 
  Student,
  StudentEnrollment,
  StudentSchedule,
  StudentTranscript 
} from '../types/student.types';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

interface StudentContextType {
  student: Student | null;
  schedule: StudentSchedule | null;
  enrollments: StudentEnrollment[];
  transcript: StudentTranscript | null;
  loading: boolean;
  error: string | null;
  fetchStudent: () => Promise<void>;
  fetchSchedule: () => Promise<void>;
  fetchEnrollments: () => Promise<void>;
  fetchTranscript: () => Promise<void>;
  registerForClass: (classId: string) => Promise<void>;
  withdrawFromClass: (classId: string) => Promise<void>;
  checkPrerequisites: (moduleId: string) => Promise<boolean>;
  registerMultipleClasses: (classIds: string[]) => Promise<{
    successful: StudentEnrollment[];
    failed: Array<{ classId: string; reason: string }>;
  }>;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [schedule, setSchedule] = useState<StudentSchedule | null>(null);
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [transcript, setTranscript] = useState<StudentTranscript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();
  const { fetchNotifications } = useNotification();

  const fetchStudent = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getStudent(user.id);
      setStudent(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch student data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchSchedule = useCallback(async () => {
    if (!student?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getCurrentSchedule(student.id);
      setSchedule(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  const fetchEnrollments = useCallback(async () => {
    if (!student?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getCurrentEnrollments(student.id);
      setEnrollments(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrollments');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  const fetchTranscript = useCallback(async () => {
    if (!student?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.getTranscript(student.id);
      setTranscript(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transcript');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  const checkPrerequisites = useCallback(async (moduleId: string) => {
    if (!student?.id) return false;
    
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.checkPrerequisites(student.id, moduleId);
      return response.data.data.eligible;
    } catch (err: any) {
      setError(err.message || 'Failed to check prerequisites');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id]);

  const registerForClass = useCallback(async (classId: string) => {
    if (!student?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      await studentService.registerForClass(student.id, classId);
      await Promise.all([
        fetchEnrollments(),
        fetchSchedule(),
        fetchNotifications()
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to register for class');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id, fetchEnrollments, fetchSchedule, fetchNotifications]);

  const withdrawFromClass = useCallback(async (classId: string) => {
    if (!student?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      await studentService.withdrawFromClass(student.id, classId);
      await Promise.all([
        fetchEnrollments(),
        fetchSchedule(),
        fetchNotifications()
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw from class');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id, fetchEnrollments, fetchSchedule, fetchNotifications]);

  const registerMultipleClasses = useCallback(async (classIds: string[]) => {
    if (!student?.id) throw new Error('No student ID available');
    
    setLoading(true);
    setError(null);
    try {
      const response = await studentService.registerMultipleClasses(student.id, classIds);
      await Promise.all([
        fetchEnrollments(),
        fetchSchedule(),
        fetchNotifications()
      ]);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to register for classes');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [student?.id, fetchEnrollments, fetchSchedule, fetchNotifications]);

  return (
    <StudentContext.Provider
      value={{
        student,
        schedule,
        enrollments,
        transcript,
        loading,
        error,
        fetchStudent,
        fetchSchedule,
        fetchEnrollments,
        fetchTranscript,
        registerForClass,
        withdrawFromClass,
        checkPrerequisites,
        registerMultipleClasses,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

export const useStudent = () => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
};