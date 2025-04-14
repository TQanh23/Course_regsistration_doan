import apiClient from '../config/api-config';

/**
 * Service for handling course-related operations
 */
export const courseService = {
  /**
   * Get all available academic terms
   */
  getAllTerms: async () => {
    try {
      return await apiClient.get('/courses/terms');
    } catch (error) {
      console.error('Get terms error:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific term by ID
   * @param termId - ID of the term to retrieve
   */
  getTermById: async (termId: number) => {
    try {
      return await apiClient.get(`/courses/terms/${termId}`);
    } catch (error) {
      console.error('Get term error:', error);
      throw error;
    }
  },
  
  /**
   * Get all available courses
   */
  getAllCourses: async () => {
    try {
      return await apiClient.get('/courses');
    } catch (error) {
      console.error('Get courses error:', error);
      throw error;
    }
  },
  
  /**
   * Get courses for a specific term
   * @param termId - ID of the term
   */
  getCoursesByTerm: async (termId: number) => {
    try {
      return await apiClient.get(`/courses/term/${termId}`);
    } catch (error) {
      console.error('Get courses by term error:', error);
      throw error;
    }
  },
  
  /**
   * Get a specific course by ID
   * @param courseId - ID of the course to retrieve
   */
  getCourseById: async (courseId: number) => {
    try {
      return await apiClient.get(`/courses/${courseId}`);
    } catch (error) {
      console.error('Get course error:', error);
      throw error;
    }
  },
  
  /**
   * Get courses by category
   * @param categoryId - ID of the category
   */
  getCoursesByCategory: async (categoryId: number) => {
    try {
      return await apiClient.get(`/courses/category/${categoryId}`);
    } catch (error) {
      console.error('Get courses by category error:', error);
      throw error;
    }
  },
  
  /**
   * Get course categories
   */
  getCategories: async () => {
    try {
      return await apiClient.get('/courses/categories');
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },
  
  /**
   * Get program curriculum (required courses for a degree program)
   * @param programId - ID of the academic program
   */
  getProgramCurriculum: async (programId: number) => {
    try {
      return await apiClient.get(`/courses/program/${programId}/curriculum`);
    } catch (error) {
      console.error('Get program curriculum error:', error);
      throw error;
    }
  },
  
  /**
   * Search courses by keyword
   * @param keyword - Search term
   */
  searchCourses: async (keyword: string) => {
    try {
      return await apiClient.get(`/courses/search?keyword=${encodeURIComponent(keyword)}`);
    } catch (error) {
      console.error('Search courses error:', error);
      throw error;
    }
  }
};