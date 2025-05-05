import { AxiosError } from 'axios';
import type { ApiResponse } from '../types/common.types';

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: AxiosError<ApiResponse<any>>) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new ApiError(
      error.response.data?.message || 'An error occurred',
      error.response.status,
      error.response.data
    );
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApiError('No response from server', 503);
  } else {
    // Something happened in setting up the request
    throw new ApiError(error.message || 'Request setup error', 500);
  }
};

export const formatQueryParams = (params: Record<string, any>) => {
  const formatted: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        formatted[key] = value.join(',');
      } else if (typeof value === 'object') {
        formatted[key] = JSON.stringify(value);
      } else {
        formatted[key] = String(value);
      }
    }
  });
  
  return formatted;
};