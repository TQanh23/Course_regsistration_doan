export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateStudentId = (studentId: string): boolean => {
  // Assuming student ID format: 2 digits year + 5 digits number
  const studentIdRegex = /^[0-9]{7}$/;
  return studentIdRegex.test(studentId);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Vietnamese phone number format
  const phoneRegex = /^(0|\+84)([0-9]{9,10})$/;
  return phoneRegex.test(phone);
};

export const validateTimeSlot = (startTime: string, endTime: string): boolean => {
  try {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    return start < end;
  } catch {
    return false;
  }
};

export const validateClassCapacity = (current: number, max: number): boolean => {
  return current >= 0 && max > 0 && current <= max;
};

export const validateCredits = (credits: number): boolean => {
  return Number.isInteger(credits) && credits > 0 && credits <= 5;
};