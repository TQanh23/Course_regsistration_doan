import apiClient from '../config/api-config';

/**
 * Service for handling course registration operations
 */
export const registrationService = {
  /**
   * Get all course registrations for the current user
   */
  getMyRegistrations: async () => {
    try {
      return await apiClient.get('/registrations/my-registrations');
    } catch (error) {
      console.error('Get registrations error:', error);
      throw error;
    }
  },
  
  /**
   * Register for a course
   * @param courseId - ID of the course to register for
   * @param termId - ID of the term
   */
  registerCourse: async (courseId: number, termId: number) => {
    try {
      return await apiClient.post('/registrations', { course_id: courseId, term_id: termId });
    } catch (error) {
      console.error('Register course error:', error);
      throw error;
    }
  },
  
  /**
   * Cancel/drop a course registration
   * @param registrationId - ID of the registration to cancel
   */
  dropCourse: async (registrationId: number) => {
    try {
      return await apiClient.delete(`/registrations/${registrationId}`);
    } catch (error) {
      console.error('Drop course error:', error);
      throw error;
    }
  },
  
  /**
   * Get registration by ID
   * @param registrationId - ID of the registration to retrieve
   */
  getRegistrationById: async (registrationId: number) => {
    try {
      return await apiClient.get(`/registrations/${registrationId}`);
    } catch (error) {
      console.error('Get registration error:', error);
      throw error;
    }
  },
  
  /**
   * Get registrations by term for the current user
   * @param termId - ID of the term
   */
  getMyRegistrationsByTerm: async (termId: number) => {
    try {
      return await apiClient.get(`/registrations/my-registrations/term/${termId}`);
    } catch (error) {
      console.error('Get registrations by term error:', error);
      throw error;
    }
  },
  
  /**
   * Get registration statistics (credits registered, courses registered)
   * @param termId - Optional term ID to filter by
   */
  getRegistrationStats: async (termId?: number) => {
    try {
      const endpoint = termId 
        ? `/registrations/stats?term_id=${termId}` 
        : '/registrations/stats';
      return await apiClient.get(endpoint);
    } catch (error) {
      console.error('Get registration stats error:', error);
      throw error;
    }
  }
};