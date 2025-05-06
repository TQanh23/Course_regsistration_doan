import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../App.css';
import api from '../../api/apiUtils';

function QuenMatKhau() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  // Email validation function using regex
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email.trim() || !isValidEmail(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to request password reset
      await api.post('/auth/forgot-password', { email });
      
      // Show success message
      setSuccess('Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn.');
      
      // Navigate to verification page after 2 seconds
      setTimeout(() => {
        navigate('/verify-email-1', { state: { email } });
      }, 2000);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setError(err.message || 'Không thể gửi yêu cầu. Vui lòng thử lại sau.');
      
      if (err.originalError?.response?.data?.message) {
        // Use specific error message from API if available
        setError(err.originalError.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if email is valid for button state
  const isEmailValid = isValidEmail(email);

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="header">
          <Link to="/login" className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="logo" style={{ width: '150px', height: '150px' }}>
            <img src="/huce-logo.png" alt="HUCE Logo" />
          </div>
        </div>

        <h1 className="title">Khôi phục tài khoản</h1>
        <p className="subtitle">Nhập email để gửi yêu cầu lấy lại mật khẩu</p>
        
        {error && <div style={{ color: '#e74c3c', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        {success && <div style={{ color: '#2ecc71', marginBottom: '20px', textAlign: 'center' }}>{success}</div>}

        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px' }}>
          <div className="input-field" style={{ width: '100%' }}>
            <div className="icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="field-icon">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              required
              disabled={isLoading}
              style={{ width: '100%' }}
            />
            <label htmlFor="email">Email</label>
          </div>

          <button 
            type="submit" 
            className={isEmailValid && !isLoading ? 'active' : 'inactive'}
            disabled={!isEmailValid || isLoading}
            style={{ width: '100%', padding: '12px 0' }}
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'GỬI YÊU CẦU'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default QuenMatKhau;