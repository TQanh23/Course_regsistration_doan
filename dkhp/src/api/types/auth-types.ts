export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message: string;
}

export interface RegisterData {
  username: string;
  password: string;
  email: string;
  role?: string;
}
