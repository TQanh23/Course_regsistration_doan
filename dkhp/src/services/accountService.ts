import { apiClient } from '../api/api-client';

export type Role = 'Student' | 'Admin';

// Validation utilities for account management
export const AccountValidation = {
  emailPattern: {
    admin: /^[^\s@]+@huce\.edu\.vn$/,
    student: /^[^\s@]+@st\.huce\.edu\.vn$/
  },

  validateEmail(email: string, role: string): { valid: boolean; message?: string } {
    const pattern = role === 'Quản trị viên' ? this.emailPattern.admin : this.emailPattern.student;
    const valid = pattern.test(email);
    if (!valid) {
      return {
        valid: false,
        message: `Invalid email format. ${role === 'Quản trị viên' ? 
          'Admin emails must end with @huce.edu.vn' : 
          'Student emails must end with @st.huce.edu.vn'}`
      };
    }
    return { valid: true };
  },

  validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
      return {
        valid: false,
        message: 'Password must be at least 8 characters long'
      };
    }
    // Require at least one number and one special character
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);
    if (!hasNumber || !hasSpecial) {
      return {
        valid: false,
        message: 'Password must contain at least one number and one special character'
      };
    }
    return { valid: true };
  },

  validateCode(code: string, role: string): { valid: boolean; message?: string } {
    const codeRegex = role === 'Admin' 
      ? /^\d{5,7}$/  // Admin codes are 5-7 digits
      : /^\d{2,5}\d{2}$/;  // Student codes are 2-5 digits followed by 2-digit batch number

    if (!codeRegex.test(code)) {
      return {
        valid: false,
        message: role === 'Admin' 
          ? 'Admin code must be 5-7 digits'
          : 'Student code must be 2-5 digits followed by 2-digit batch number'
      };
    }
    return { valid: true };
  },

  validateStudentDetails(data: any): { valid: boolean; message?: string } {
    if (!data.dob || !data.major || !data.classGroup) {
      return {
        valid: false,
        message: 'Date of birth, major, and class group are required for students'
      };
    }

    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!dobRegex.test(data.dob)) {
      return {
        valid: false,
        message: 'Invalid date format. Use DD/MM/YYYY'
      };
    }

    return { valid: true };
  },

  validateAccountData(data: any, role: string): { valid: boolean; message?: string } {
    // Check required fields
    if (!data.name?.trim() || !data.email?.trim() || !data.code?.trim() || !data.password?.trim()) {
      return {
        valid: false,
        message: 'Name, email, code, and password are required'
      };
    }

    // Email validation
    const emailCheck = this.validateEmail(data.email, role);
    if (!emailCheck.valid) return emailCheck;

    // Password validation
    const passwordCheck = this.validatePassword(data.password);
    if (!passwordCheck.valid) return passwordCheck;

    // Code validation
    const codeCheck = this.validateCode(data.code, role);
    if (!codeCheck.valid) return codeCheck;

    // Additional student validations
    if (role === 'Sinh viên') {
      const studentCheck = this.validateStudentDetails(data);
      if (!studentCheck.valid) return studentCheck;
    }

    return { valid: true };
  }
};

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
  role: Role;
  password?: string;
  studentDetails?: StudentDetails;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export default {
  async getAllAccounts(params?: { search?: string; role?: string }): Promise<ApiResponse<Account[]>> {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      const response = await apiClient.get('/admin/users', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform response data to match our Account interface
      const accounts: Account[] = response.data.data.map((acc: any) => ({
        id: acc.id,
        name: acc.username || acc.name, // Handle both username and name fields
        email: acc.email,
        code: acc.student_id || acc.code, // Handle both student_id and code fields
        phone: acc.full_name || acc.phone || '', // Handle both full_name and phone fields
        role: acc.role === 'Sinh viên' || acc.role.toLowerCase() === 'student' ? 'Student' : 'Admin',
        studentDetails: acc.role === 'Sinh viên' || acc.role.toLowerCase() === 'student' ? {
          dob: acc.date_of_birth || acc.dob || '',
          major: acc.major || '',
          specialization: acc.specialization || '',
          faculty: acc.faculty || 'Công nghệ thông tin',
          trainingType: acc.trainingType || 'Chính quy - CĐIO',
          universitySystem: acc.universitySystem || 'Đại học - B7',
          classGroup: acc.class || acc.classGroup || '',
          classSection: acc.classSection || acc.class || ''
        } : undefined
      }));

      return { success: true, data: accounts };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch accounts' 
      };
    }
  },

  async createAccount(accountData: Partial<Account>): Promise<ApiResponse<Account>> {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      // Validate the data before sending to server
      const validation = AccountValidation.validateAccountData(accountData, accountData.role || '');
      if (!validation.valid) {
        return { 
          success: false, 
          error: validation.message || 'Invalid data'
        };
      }

      if (!accountData.name || !accountData.email || !accountData.code) {
        return {
          success: false,
          error: 'Missing required fields: name, email, or code'
        };
      }

      // Transform data for the register endpoint
      const registerData = {
        username: accountData.name,
        email: accountData.email,
        password: accountData.password || '',
        role: accountData.role?.toLowerCase() === 'student' ? 'student' : 'admin',
        student_id: accountData.code,
        full_name: accountData.phone || '',
        program_id: 1 // Default program ID
      };

      if (registerData.role === 'student' && accountData.studentDetails) {
        Object.assign(registerData, {
          dob: accountData.studentDetails.dob || '',
          major: accountData.studentDetails.major || '',
          class: accountData.studentDetails.classGroup || '',
          specialization: accountData.studentDetails.specialization || '',
          faculty: accountData.studentDetails.faculty || '',
          trainingType: accountData.studentDetails.trainingType || '',
          universitySystem: accountData.studentDetails.universitySystem || '',
          classSection: accountData.studentDetails.classSection || ''
        });
      }

      const response = await apiClient.post('/auth/register', registerData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Transform the response data back to match our Account interface
      const responseData = response.data.data || response.data;
      const account: Account = {
        id: responseData.userId || responseData.id,
        name: registerData.username,
        phone: registerData.full_name,
        email: registerData.email,
        code: registerData.student_id,
        role: registerData.role === 'student' ? 'Student' : 'Admin'
      };

      if (registerData.role === 'student' && accountData.studentDetails) {
        account.studentDetails = {
          dob: accountData.studentDetails.dob,
          major: accountData.studentDetails.major,
          specialization: accountData.studentDetails.specialization || '',
          faculty: accountData.studentDetails.faculty || '',
          trainingType: accountData.studentDetails.trainingType || '',
          universitySystem: accountData.studentDetails.universitySystem || '',
          classGroup: accountData.studentDetails.classGroup,
          classSection: accountData.studentDetails.classSection || ''
        };
      }
      
      return { 
        success: true, 
        data: account,
        message: 'Account created successfully'
      };
    } catch (error: any) {
      // Handle specific error cases
      if (error.response?.data?.error === 'duplicate_email') {
        return {
          success: false,
          error: 'This email is already registered'
        };
      } else if (error.response?.data?.error === 'duplicate_code') {
        return {
          success: false,
          error: 'This code is already registered'
        };
      }

      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create account'
      };
    }
  },

  async updateAccount(id: number, accountData: Partial<Account>): Promise<ApiResponse<Account>> {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      // Kiểm tra id
      if (!id) {
        return { success: false, error: 'ID tài khoản không được để trống' };
      }

      // Kiểm tra và chuẩn hóa role
      if (!accountData.role) {
        return { success: false, error: 'Role không được để trống' };
      }
      const role = accountData.role.toLowerCase();
      if (role !== 'student' && role !== 'admin') {
        return { success: false, error: 'Role phải là student hoặc admin' };
      }

      // Chuẩn bị dữ liệu cập nhật cơ bản
      const updateData: any = {
        username: accountData.name,
        email: accountData.email,
        role: role
      };

      // Thêm mật khẩu nếu được cung cấp
      if (accountData.password) {
        updateData.password = accountData.password;
      }

      // Thêm thông tin sinh viên nếu role là student
      if (role === 'student' && accountData.studentDetails) {
        Object.assign(updateData, {
          student_id: accountData.code,
          full_name: accountData.phone || '',
          date_of_birth: accountData.studentDetails.dob || '',
          class: accountData.studentDetails.classGroup || '',
          major: accountData.studentDetails.major || '',
          specialization: accountData.studentDetails.specialization || '',
          faculty: accountData.studentDetails.faculty || '',
          training_type: accountData.studentDetails.trainingType || '',
          university_system: accountData.studentDetails.universitySystem || '',
          class_section: accountData.studentDetails.classSection || ''
        });
      }

      // Gọi API cập nhật
      const response = await apiClient.put(`/admin/users/${id}?role=${role}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Xử lý phản hồi
      if (response.data.success) {
        const updatedAccount: Account = {
          id: id,
          name: updateData.username,
          email: updateData.email,
          phone: updateData.full_name || accountData.phone || '',
          code: updateData.student_id || accountData.code || '',
          role: role === 'student' ? 'Student' : 'Admin'
        };

        if (role === 'student') {
          updatedAccount.studentDetails = {
            dob: updateData.date_of_birth || '',
            major: updateData.major || '',
            specialization: updateData.specialization || '',
            faculty: updateData.faculty || '',
            trainingType: updateData.training_type || '',
            universitySystem: updateData.university_system || '',
            classGroup: updateData.class || '',
            classSection: updateData.class_section || ''
          };
        }

        return { 
          success: true, 
          data: updatedAccount,
          message: 'Cập nhật tài khoản thành công'
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Cập nhật tài khoản thất bại'
        };
      }
    } catch (error: any) {
      console.error('Lỗi cập nhật tài khoản:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Lỗi khi cập nhật tài khoản'
      };
    }
  },

  async deleteAccount(id: number, role: string): Promise<ApiResponse<void>> {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      console.log(`Attempting to delete account with ID: ${id}`);
      console.log(`Using endpoint: /admin/users/${id}`);
      
      const response = await apiClient.delete(`/admin/users/${id}?role=${role.toLowerCase()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Delete response:', response.data);
      
      return { 
        success: true,
        message: response.data?.message || 'Account deleted successfully'
      };
    } catch (error: any) {
      console.error('Delete account error:', error);
      console.error('Error response:', error.response?.data);
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete account' 
      };
    }
  },    async getAccountById(id: number): Promise<ApiResponse<Account>> {
    const token = localStorage.getItem('authToken');
    if (!token) return { success: false, error: 'Authentication required' };

    try {
      const response = await apiClient.get(`/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Transform response to match our Account interface
      const data = response.data.data;
      const account: Account = {
        id: data.id,
        name: data.name,
        phone: data.phone || '',
        email: data.email,
        code: data.code,
        role: data.role === 'student' ? 'Student' : 'Admin'
      };

      if (account.role === 'Student' && data.studentDetails) {
        account.studentDetails = {
          dob: data.studentDetails.dob || '',
          major: data.studentDetails.major || '',
          specialization: data.studentDetails.specialization || '',
          faculty: data.studentDetails.faculty || '',
          trainingType: data.studentDetails.trainingType || '',
          universitySystem: data.studentDetails.universitySystem || '',
          classGroup: data.studentDetails.classGroup || '',
          classSection: data.studentDetails.classSection || ''
        };
      }

      return { 
        success: true, 
        data: account 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch account' 
      };
    }
  }
};