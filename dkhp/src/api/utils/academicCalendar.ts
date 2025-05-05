interface AcademicTerm {
  semester: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
}

export const academicCalendarUtils = {
  getCurrentSemester(): { semester: string; academicYear: string } {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Determine current semester based on month
    let semester: string;
    let academicYear: string;

    if (month >= 8 && month <= 12) {
      // Fall semester (August - December)
      semester = '1';
      academicYear = `${year}-${year + 1}`;
    } else if (month >= 1 && month <= 5) {
      // Spring semester (January - May)
      semester = '2';
      academicYear = `${year - 1}-${year}`;
    } else {
      // Summer semester (June - July)
      semester = '3';
      academicYear = `${year - 1}-${year}`;
    }

    return { semester, academicYear };
  },

  getNextSemester(): { semester: string; academicYear: string } {
    const current = this.getCurrentSemester();
    
    if (current.semester === '1') {
      return {
        semester: '2',
        academicYear: current.academicYear
      };
    } else if (current.semester === '2') {
      return {
        semester: '3',
        academicYear: current.academicYear
      };
    } else {
      const [startYear] = current.academicYear.split('-');
      return {
        semester: '1',
        academicYear: `${parseInt(startYear) + 1}-${parseInt(startYear) + 2}`
      };
    }
  },

  getSemesterDateRange(semester: string, academicYear: string): { startDate: Date; endDate: Date } {
    const [startYear, endYear] = academicYear.split('-').map(Number);

    switch (semester) {
      case '1': // Fall semester
        return {
          startDate: new Date(startYear, 7, 15), // August 15th
          endDate: new Date(startYear, 11, 31) // December 31st
        };
      case '2': // Spring semester
        return {
          startDate: new Date(endYear, 0, 1), // January 1st
          endDate: new Date(endYear, 4, 31) // May 31st
        };
      case '3': // Summer semester
        return {
          startDate: new Date(endYear, 5, 1), // June 1st
          endDate: new Date(endYear, 6, 31) // July 31st
        };
      default:
        throw new Error('Invalid semester');
    }
  },

  isWithinSemester(date: Date, semester: string, academicYear: string): boolean {
    const { startDate, endDate } = this.getSemesterDateRange(semester, academicYear);
    return date >= startDate && date <= endDate;
  },

  formatAcademicYear(year: number): string {
    return `${year}-${year + 1}`;
  },

  parseAcademicYear(academicYear: string): { startYear: number; endYear: number } {
    const [startYear, endYear] = academicYear.split('-').map(Number);
    return { startYear, endYear };
  },

  getSemesterName(semester: string): string {
    switch (semester) {
      case '1':
        return 'Fall';
      case '2':
        return 'Spring';
      case '3':
        return 'Summer';
      default:
        return 'Unknown';
    }
  },

  formatSemesterDisplay(semester: string, academicYear: string): string {
    return `${this.getSemesterName(semester)} ${academicYear}`;
  },

  getWeekNumber(date: Date): number {
    const { startDate } = this.getSemesterDateRange(
      this.getCurrentSemester().semester,
      this.getCurrentSemester().academicYear
    );
    
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  },

  getDayOfWeekName(day: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day] || 'Invalid day';
  },

  getTimeSlots(): Array<{ start: string; end: string }> {
    return [
      { start: '07:00', end: '08:30' },
      { start: '08:45', end: '10:15' },
      { start: '10:30', end: '12:00' },
      { start: '13:00', end: '14:30' },
      { start: '14:45', end: '16:15' },
      { start: '16:30', end: '18:00' },
      { start: '18:15', end: '19:45' }
    ];
  },

  isValidTimeSlot(startTime: string, endTime: string): boolean {
    const timeSlots = this.getTimeSlots();
    return timeSlots.some(slot => 
      slot.start === startTime && slot.end === endTime
    );
  },

  calculateAcademicProgress(
    enrollmentYear: number,
    currentCredits: number,
    requiredCredits: number
  ): {
    year: number;
    progress: number;
    estimatedGraduationYear: number;
  } {
    const currentYear = new Date().getFullYear();
    const yearOfStudy = currentYear - enrollmentYear;
    const progress = (currentCredits / requiredCredits) * 100;
    
    // Estimate graduation year based on current progress
    const remainingCredits = requiredCredits - currentCredits;
    const averageCreditsPerYear = currentCredits / Math.max(1, yearOfStudy);
    const estimatedRemainingYears = Math.ceil(remainingCredits / averageCreditsPerYear);
    
    return {
      year: yearOfStudy,
      progress,
      estimatedGraduationYear: currentYear + estimatedRemainingYears
    };
  }
};