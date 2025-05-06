import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import App from './App'
import Layout from './components/Layout'
import Login from './pages/DangKyDangNhap/Login'
import Register from './pages/DangKyDangNhap/Register'
import QuenMatKhau from './pages/DangKyDangNhap/QuenMatKhau'
import XacNhanEmailQuenPass from './pages/DangKyDangNhap/XacNhanEmailQuenPass'
import XacNhanEmailDangKy from './pages/DangKyDangNhap/XacNhanEmailDangKy'
import TaoMatKhauMoi from './pages/DangKyDangNhap/TaoMatKhauMoi'
import './index.css'

const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Auth Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
        <Route path="/register" element={<PageWrapper><Register /></PageWrapper>} />
        <Route path="/forgot-password" element={<PageWrapper><QuenMatKhau /></PageWrapper>} />
        <Route path="/verify-email-1" element={<PageWrapper><XacNhanEmailDangKy /></PageWrapper>} />
        <Route path="/verify-email-2" element={<PageWrapper><XacNhanEmailQuenPass /></PageWrapper>} />
        <Route path="/tao-mat-khau-moi" element={<PageWrapper>< TaoMatKhauMoi /></PageWrapper>} />

        {/* Protected Routes */}
        <Route path="/*" element={<Layout />} />
      </Routes>
    </AnimatePresence>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App>
        <AppRoutes />
      </App>
    </BrowserRouter>
  </React.StrictMode>
)