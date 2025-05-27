import React from 'react';
import { motion } from 'framer-motion';
import './TrangChu.css';

const TrangChu: React.FC = () => {
  return (
    <div className="trang-chu-container">
      <header className="header">
        <div className="logo-container">
          <img src="/huce-logo.png" alt="Logo" className="logo" />
        </div>
        <div className="welcome-text">Hệ thống đăng ký học phần</div>
      </header>
      
      <motion.div 
        className="content-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="background-image"></div>
        <h2 className="greeting">Chào mừng bạn đã đến với giao diện trang chủ quản trị viên!</h2>
      </motion.div>
    </div>
  );
};

export default TrangChu;