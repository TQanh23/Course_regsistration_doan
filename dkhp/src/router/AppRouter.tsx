import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../api/auth';
import ProtectedRoute from '../components/ProtectedRoute';

// Import pages
import Login from '../pages/DangKyDangNhap/Login';
import Register from '../pages/DangKyDangNhap/Register';
import QuenMatKhau from '../pages/DangKyDangNhap/QuenMatKhau';
import XacNhanEmailQuenPass from '../pages/DangKyDangNhap/XacNhanEmailQuenPass';
import XacNhanEmailDangKy from '../pages/DangKyDangNhap/XacNhanEmailDangKy';
import TaoMatKhauMoi from '../pages/DangKyDangNhap/TaoMatKhauMoi';
import QuanLyTaiKhoan from '../pages/QuanLyTaiKhoan/QuanLyTaiKhoan';
import QuanLyMonHoc from '../pages/QuanLyMonHoc/QuanLyMonHoc';

// Import a placeholder Dashboard component
const Dashboard = () => <div>Dashboard Content</div>;
const Unauthorized = () => <div>Unauthorized Access</div>;

const AppRouter = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<QuenMatKhau />} />
          <Route path="/verify-email-1" element={<XacNhanEmailQuenPass />} />
          <Route path="/verify-email-2" element={<XacNhanEmailDangKy />} />
          <Route path="/tao-mat-khau-moi" element={<TaoMatKhauMoi />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes for admin */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quan-ly-tai-khoan" element={<QuanLyTaiKhoan />} />
            <Route path="/quan-ly-mon-hoc" element={<QuanLyMonHoc /> } />
            {/* Add more admin routes here */}
          </Route>
          
          {/* Redirect root to login or dashboard based on auth state */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRouter;