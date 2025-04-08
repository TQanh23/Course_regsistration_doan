// Định nghĩa endpoint API cho ứng dụng React Native
import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://your-actual-api-url.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default apiClient;