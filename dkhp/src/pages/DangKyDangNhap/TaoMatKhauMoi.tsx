import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import api from '../../api/apiUtils';

const TaoMatKhauMoi: React.FC = () => {
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get token from URL or state
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (!matKhau.trim() || matKhau.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (matKhau !== xacNhanMatKhau) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to reset password
      await api.post('/auth/reset-password', {
        token,
        email,
        newPassword: matKhau
      });
      
      // Show success message
      setSuccess('Đổi mật khẩu thành công!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại sau.');
      
      if (err.originalError?.response?.data?.message) {
        // Use specific error message from API if available
        setError(err.originalError.response.data.message);
      }
      
      if (err.originalError?.response?.status === 401) {
        // Invalid or expired token
        setError('Liên kết đổi mật khẩu đã hết hạn. Vui lòng yêu cầu lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    matKhau.trim() !== '' && 
    matKhau.length >= 6 &&
    xacNhanMatKhau.trim() !== '' && 
    matKhau === xacNhanMatKhau;

  return (
    <div className="app">
      <div className="login-container">
        <Link to="/login" className="back-button" style={{ position: 'absolute', left: '20px', top: '20px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>
        
        <div className="logo">
          <img src="/huce-logo.png" alt="HUCE Logo" />
        </div>
        
        <h1 style={{ fontSize: '35px' }}>Đặt lại mật khẩu</h1>
        
        {error && <div style={{ color: '#e74c3c', marginBottom: '20px' }}>{error}</div>}
        {success && <div style={{ color: '#2ecc71', marginBottom: '20px' }}>{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/lock-icon.svg" alt="Lock" className="field-icon" />
            </div>
            <input
              type="password"
              id="matKhau"
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder=" "
              disabled={isLoading}
            />
            <label htmlFor="matKhau">Mật khẩu mới</label>
          </div>
          
          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/lock-icon.svg" alt="Lock" className="field-icon" />
            </div>
            <input
              type="password"
              id="xacNhanMatKhau"
              value={xacNhanMatKhau}
              onChange={(e) => setXacNhanMatKhau(e.target.value)}
              placeholder=" "
              disabled={isLoading}
            />
            <label htmlFor="xacNhanMatKhau">Xác nhận mật khẩu</label>
          </div>
          
          <button 
            type="submit" 
            className={isFormValid && !isLoading ? 'active' : 'inactive'}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐỔI MẬT KHẨU'}
          </button>
        </form>
        
        <div className="login-link" style={{ marginTop: '20px' }}>
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default TaoMatKhauMoi;