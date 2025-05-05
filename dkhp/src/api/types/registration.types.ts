export interface RegistrationPeriod {
  id: string;
  semester: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  type: 'regular' | 'adjustment' | 'late';
  status: 'upcoming' | 'active' | 'ended';
  studentGroups?: {
    year?: number;
    department?: string;
    program?: string;
  }[];
}

export interface CreateRegistrationPeriodDto {
  semester: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  type: RegistrationPeriod['type'];
  studentGroups?: RegistrationPeriod['studentGroups'];
}

export interface UpdateRegistrationPeriodDto {
  startDate?: string;
  endDate?: string;
  status?: RegistrationPeriod['status'];
  studentGroups?: RegistrationPeriod['studentGroups'];
}