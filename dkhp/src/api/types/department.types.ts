export interface Department {
  id: string;
  code: string;
  name: string;
  description?: string;
  headOfDepartment?: string; // Teacher ID
  contact?: {
    email?: string;
    phone?: string;
    office?: string;
  };
}

export interface DepartmentStats {
  departmentId: string;
  totalTeachers: number;
  totalStudents: number;
  activeClasses: number;
  totalModules: number;
}

export interface CreateDepartmentDto {
  code: string;
  name: string;
  description?: string;
  headOfDepartment?: string;
  contact?: Department['contact'];
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  headOfDepartment?: string;
  contact?: Department['contact'];
}

export interface DepartmentSchedule {
  departmentId: string;
  semester: string;
  academicYear: string;
  classes: Array<{
    moduleCode: string;
    moduleName: string;
    teachers: Array<{
      id: string;
      name: string;
    }>;
    totalStudents: number;
    schedule: Array<{
      dayOfWeek: number;
      startTime: string;
      endTime: string;
      room: string;
    }>;
  }>;
}