import express from 'express';
import cors from 'cors';


// Khởi tạo ứng dụng Express
const app = express();
const PORT = 3000;

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,                // Cho phép gửi cookie, session
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware để đọc JSON từ body
app.use(express.json());

// Route kiểm tra kết nối
app.get('/api/ping', (req, res) => {
  res.json({ message: 'Pong from backend!' });
});

// Bắt đầu server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
