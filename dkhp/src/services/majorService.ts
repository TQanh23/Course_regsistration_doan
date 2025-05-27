import axios from 'axios';
import { NganhHoc, MajorDetails } from '../pages/QuanLyMonHoc/QuanLyMonHoc';

const API_URL = 'http://localhost:5000/api';

const majorService = {
  // Get all majors
  getAllCourses: async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/courses`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error fetching majors'
      };
    }
  },

  // Create a new major
  createMajor: async (majorData: NganhHoc, details: MajorDetails) => {
    try {
      const response = await axios.post(`${API_URL}/majors`, {
        ...majorData,
        details
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error creating major'
      };
    }
  },

  // Update a major
  updateMajor: async (id: number, majorData: NganhHoc, details: MajorDetails) => {
    try {
      const response = await axios.put(`${API_URL}/majors/${id}`, {
        ...majorData,
        details
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error updating major'
      };
    }
  },

  // Delete a major
  deleteMajor: async (id: number) => {
    try {
      const response = await axios.delete(`${API_URL}/majors/${id}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error deleting major'
      };
    }
  },

  // Get major details
  getMajorDetails: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/majors/${id}/details`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error fetching major details'
      };
    }
  }
};

export default majorService;