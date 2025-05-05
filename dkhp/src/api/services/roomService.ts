import { apiClient } from '../config/axiosConfig';
import type { 
  Room, 
  RoomSchedule,
  RoomAvailability,
  CreateRoomDto,
  UpdateRoomDto,
  RoomUtilization
} from '../types/room.types';
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common.types';

export const roomService = {
  // Basic CRUD operations
  getAllRooms: (params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Room>>>('/rooms', { params }),
    
  getRoomById: (id: string) => 
    apiClient.get<ApiResponse<Room>>(`/rooms/${id}`),
    
  createRoom: (data: CreateRoomDto) => 
    apiClient.post<ApiResponse<Room>>('/rooms', data),
    
  updateRoom: (id: string, data: UpdateRoomDto) => 
    apiClient.put<ApiResponse<Room>>(`/rooms/${id}`, data),
    
  deleteRoom: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/rooms/${id}`),

  // Schedule management
  getRoomSchedule: (
    roomId: string,
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<RoomSchedule>>(
      `/rooms/${roomId}/schedule`,
      { params: { semester, academicYear } }
    ),
    
  getRoomAvailability: (
    roomId: string,
    startDate: string,
    endDate: string
  ) => 
    apiClient.get<ApiResponse<RoomAvailability>>(
      `/rooms/${roomId}/availability`,
      { params: { startDate, endDate } }
    ),

  // Room assignments
  assignRoom: (roomId: string, classId: string) => 
    apiClient.post<ApiResponse<{ success: boolean }>>(
      `/rooms/${roomId}/assign`,
      { classId }
    ),
    
  unassignRoom: (roomId: string, classId: string) => 
    apiClient.post<ApiResponse<{ success: boolean }>>(
      `/rooms/${roomId}/unassign`,
      { classId }
    ),

  // Room status management
  setRoomStatus: (roomId: string, status: Room['status']) => 
    apiClient.put<ApiResponse<Room>>(
      `/rooms/${roomId}/status`,
      { status }
    ),

  // Search and filters
  searchRooms: (query: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
      '/rooms/search',
      { params: { query, ...params } }
    ),
    
  getRoomsByBuilding: (building: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
      `/buildings/${building}/rooms`,
      { params }
    ),
    
  getRoomsByDepartment: (departmentId: string, params?: PaginationParams) => 
    apiClient.get<ApiResponse<PaginatedResponse<Room>>>(
      `/departments/${departmentId}/rooms`,
      { params }
    ),

  // Analytics
  getRoomUtilization: (
    roomId: string,
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<RoomUtilization>>(
      `/rooms/${roomId}/utilization`,
      { params: { semester, academicYear } }
    ),
    
  getBuildingUtilization: (
    building: string,
    semester: string,
    academicYear: string
  ) => 
    apiClient.get<ApiResponse<{
      building: string;
      rooms: RoomUtilization[];
      averageUtilization: number;
    }>>(
      `/buildings/${building}/utilization`,
      { params: { semester, academicYear } }
    ),

  // Batch operations
  checkRoomsAvailability: (
    roomIds: string[],
    timeSlot: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  ) => 
    apiClient.post<ApiResponse<Array<{
      roomId: string;
      isAvailable: boolean;
      currentClass?: {
        classId: string;
        moduleName: string;
      };
    }>>>(
      '/rooms/check-availability',
      { roomIds, timeSlot }
    )
};