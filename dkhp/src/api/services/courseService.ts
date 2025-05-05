import { apiClient } from '../config/axiosConfig';
import type { 
  Course, 
  CourseClass, 
  Teacher,
  RegisterCourseRequest,
  UnregisterCourseRequest
} from '../types/course.types';

export const courseService = {
  // Course Classes
  getAllClasses: () => 
    apiClient.get<CourseClass[]>('/course-classes'),
    
  getClassById: (id: string) => 
    apiClient.get<CourseClass>(`/course-classes/${id}`),
    
  getClassesByCourse: (courseId: string) => 
    apiClient.get<CourseClass[]>(`/courses/${courseId}/classes`),

  // Course Registration
  registerCourse: (data: RegisterCourseRequest) => 
    apiClient.post('/course-registration/register', data),
    
  unregisterCourse: (data: UnregisterCourseRequest) => 
    apiClient.post('/course-registration/unregister', data),
    
  getRegisteredCourses: (studentId: string) => 
    apiClient.get<CourseClass[]>(`/students/${studentId}/registered-courses`),

  // Teachers
  getTeacherById: (id: string) => 
    apiClient.get<Teacher>(`/teachers/${id}`),
    
  getTeacherClasses: (teacherId: string) => 
    apiClient.get<CourseClass[]>(`/teachers/${teacherId}/classes`),

  // Schedule
  getClassSchedule: (classId: string) => 
    apiClient.get(`/course-classes/${classId}/schedule`),
    
  getStudentSchedule: (studentId: string) => 
    apiClient.get(`/students/${studentId}/schedule`),
    
  getTeacherSchedule: (teacherId: string) => 
    apiClient.get(`/teachers/${teacherId}/schedule`)
};