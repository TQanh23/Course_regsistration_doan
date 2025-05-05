export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const formatTime = (time: string): string => {
  return new Date(`1970-01-01T${time}`).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getDayOfWeekName = (day: number): string => {
  const days = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return days[day] || '';
};

export const getCurrentSemester = (): { semester: string; academicYear: string } => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Determine semester based on month
  let semester;
  if (month >= 8 && month <= 12) {
    semester = '1';
  } else if (month >= 1 && month <= 5) {
    semester = '2';
  } else {
    semester = '3'; // Summer semester
  }

  // Determine academic year
  let academicYear;
  if (month >= 8) {
    academicYear = `${year}-${year + 1}`;
  } else {
    academicYear = `${year - 1}-${year}`;
  }

  return { semester, academicYear };
};

export const isTimeConflict = (
  slot1: { startTime: string; endTime: string },
  slot2: { startTime: string; endTime: string }
): boolean => {
  const start1 = new Date(`1970-01-01T${slot1.startTime}`);
  const end1 = new Date(`1970-01-01T${slot1.endTime}`);
  const start2 = new Date(`1970-01-01T${slot2.startTime}`);
  const end2 = new Date(`1970-01-01T${slot2.endTime}`);

  return (start1 < end2 && end1 > start2);
};

export const calculateDuration = (startTime: string, endTime: string): number => {
  const start = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);
  return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
};

export const getWeekDates = (date: Date): Date[] => {
  const week: Date[] = [];
  const current = new Date(date);
  current.setDate(current.getDate() - current.getDay());

  for (let i = 0; i < 7; i++) {
    week.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return week;
};

export const isRegistrationPeriod = (
  startDate: Date,
  endDate: Date
): boolean => {
  const now = new Date();
  return now >= startDate && now <= endDate;
};