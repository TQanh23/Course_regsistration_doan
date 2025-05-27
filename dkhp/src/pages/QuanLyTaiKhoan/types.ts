export type AccountRole = 'Admin' | 'Sinh viên';
export type SearchFilter = 'name' | 'code' | 'phone';
export type SortDirection = 'asc' | 'desc' | 'none';
export type RoleFilter = 'all' | 'student' | 'admin';

export interface StudentDetails {
  dob: string;
  major: string;
  specialization: string;
  faculty: string;
  trainingType: string;
  universitySystem: string;
  classGroup: string;
  classSection: string;
}

export interface Account {
  id: number;
  name: string;
  phone: string;
  email: string;
  code: string;
  role: string;
  password?: string;
  studentDetails?: StudentDetails;
}

export interface FormData {
  name: string;
  dob: string;
  email: string;
  phone: string;
  code: string;
  password: string;
  major: string;
  specialization: string;
  faculty: string;
  trainingType: string;
  universitySystem: string;
  classGroup: string;
  classSection: string;
}
