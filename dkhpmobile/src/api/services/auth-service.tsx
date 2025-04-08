// Định nghĩa các hàm gọi API liên quan đến xác thực người dùng (đăng nhập, đăng xuất, v.v.)
import Crypto from 'expo-crypto'; // Make sure to install expo-crypto
import apiClient from '../config/api-config';
import { LoginRequest, LoginResponse } from '../types/auth-types';

export const authService = {
    async hashPassword(password: string): Promise<string> {
        const data = new TextEncoder().encode(password);
        const hash = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          password
        );
        return hash;
      },
    
    async logins(credentials: { username: string; password: string }) {
    const hashedPassword = await this.hashPassword(credentials.password);
    // Send hashed password to server
    const response = await apiClient.post('/auth/login', {
        username: credentials.username,
        password: hashedPassword
    });
    return response.data;
    },

    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post('/auth/logout');
    }
};