import React, { createContext, useContext, useState, useCallback } from 'react';
import { roomService } from '../services/roomService';
import type { 
  Room, 
  RoomSchedule,
  RoomAvailability,
  RoomUtilization 
} from '../types/room.types';
import { getCurrentSemester } from '../utils/dateUtils';

interface RoomContextType {
  rooms: Room[];
  selectedRoom: Room | null;
  roomSchedule: RoomSchedule | null;
  roomAvailability: RoomAvailability | null;
  loading: boolean;
  error: string | null;
  fetchRooms: (departmentId?: string) => Promise<void>;
  selectRoom: (room: Room | null) => void;
  fetchRoomSchedule: (roomId: string) => Promise<void>;
  fetchRoomAvailability: (roomId: string, startDate: string, endDate: string) => Promise<void>;
  assignRoomToClass: (roomId: string, classId: string) => Promise<boolean>;
  checkRoomAvailability: (roomIds: string[], timeSlot: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }) => Promise<Array<{
    roomId: string;
    isAvailable: boolean;
    currentClass?: {
      classId: string;
      moduleName: string;
    };
  }>>;
  getRoomUtilization: (roomId: string) => Promise<RoomUtilization>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomSchedule, setRoomSchedule] = useState<RoomSchedule | null>(null);
  const [roomAvailability, setRoomAvailability] = useState<RoomAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async (departmentId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = departmentId
        ? await roomService.getRoomsByDepartment(departmentId)
        : await roomService.getAllRooms();
      setRooms(response.data.data.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch rooms');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRoom = useCallback((room: Room | null) => {
    setSelectedRoom(room);
    if (!room) {
      setRoomSchedule(null);
      setRoomAvailability(null);
    }
  }, []);

  const fetchRoomSchedule = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { semester, academicYear } = getCurrentSemester();
      const response = await roomService.getRoomSchedule(roomId, semester, academicYear);
      setRoomSchedule(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch room schedule');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRoomAvailability = useCallback(async (
    roomId: string,
    startDate: string,
    endDate: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomService.getRoomAvailability(roomId, startDate, endDate);
      setRoomAvailability(response.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch room availability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRoomToClass = useCallback(async (roomId: string, classId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomService.assignRoom(roomId, classId);
      if (selectedRoom?.id === roomId) {
        await fetchRoomSchedule(roomId);
      }
      return response.data.data.success;
    } catch (err: any) {
      setError(err.message || 'Failed to assign room to class');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedRoom, fetchRoomSchedule]);

  const checkRoomAvailability = useCallback(async (
    roomIds: string[],
    timeSlot: {
      dayOfWeek: number;
      startTime: string;
      endTime: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await roomService.checkRoomsAvailability(roomIds, timeSlot);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to check room availability');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRoomUtilization = useCallback(async (roomId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { semester, academicYear } = getCurrentSemester();
      const response = await roomService.getRoomUtilization(roomId, semester, academicYear);
      return response.data.data;
    } catch (err: any) {
      setError(err.message || 'Failed to get room utilization');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <RoomContext.Provider
      value={{
        rooms,
        selectedRoom,
        roomSchedule,
        roomAvailability,
        loading,
        error,
        fetchRooms,
        selectRoom,
        fetchRoomSchedule,
        fetchRoomAvailability,
        assignRoomToClass,
        checkRoomAvailability,
        getRoomUtilization,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};