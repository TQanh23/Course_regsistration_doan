export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: 'lecture' | 'lab' | 'seminar';
  facilities: string[];
  status: 'available' | 'maintenance' | 'reserved';
  departmentId?: string;
}

export interface RoomSchedule {
  roomId: string;
  schedule: Array<{
    classId: string;
    moduleCode: string;
    moduleName: string;
    teacherId: string;
    teacherName: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    semester: string;
    academicYear: string;
  }>;
}

export interface RoomAvailability {
  roomId: string;
  availability: Array<{
    dayOfWeek: number;
    timeSlots: Array<{
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      currentClass?: {
        classId: string;
        moduleName: string;
      };
    }>;
  }>;
}

export interface CreateRoomDto {
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: Room['type'];
  facilities: string[];
  departmentId?: string;
}

export interface UpdateRoomDto {
  name?: string;
  capacity?: number;
  type?: Room['type'];
  facilities?: string[];
  status?: Room['status'];
  departmentId?: string;
}

export interface RoomUtilization {
  roomId: string;
  utilizationRate: number;
  totalHours: number;
  occupiedHours: number;
  averageClassSize: number;
  peakUtilizationTimes: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    utilizationRate: number;
  }>;
}