import { useState } from 'react'
import '../../App.css'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/apiUtils'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Add email validation function
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form fields
    if (!username.trim()) {
      setError('Vui lòng nhập tên đăng nhập');
      return;
    }
    
    if (!email.trim() || !isValidEmail(email)) {
      setError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call the registration API
      await api.post('/auth/register', {
        username,
        email,
        password,
        role: 'admin' // Register as admin for web admin app
      });
      
      console.log('Registration successful');
      
      // Navigate to email verification page
      navigate('/verify-email-2', { state: { email } });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại sau.');
      
      if (err.originalError?.response?.data?.message) {
        // Use specific error message from API if available
        setError(err.originalError.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Check form validity
  const isFormValid = 
    username.trim() !== '' && 
    email.trim() !== '' && 
    isValidEmail(email) &&
    password.trim() !== '' && 
    password.length >= 6 &&
    confirmPassword.trim() !== '' &&
    password === confirmPassword;

  return (
    <div className="app">
      <div className="login-container">
        <div className="logo">
          <img src="/huce-logo.png" alt="HUCE Logo" />
        </div>
        <h1 style={{ fontSize: '35px' }}>Đăng ký tài khoản</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister}>
          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/user-icon.svg" alt="User" className="field-icon" />
            </div>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=" "
              disabled={isLoading}
            />
            <label htmlFor="username">Tên đăng nhập</label>
          </div>

          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/email-icon.svg" alt="Email" className="field-icon" />
            </div>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              disabled={isLoading}
            />
            <label htmlFor="email">Email</label>
          </div>

          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/lock-icon.svg" alt="Lock" className="field-icon" />
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              disabled={isLoading}
            />
            <label htmlFor="password">Mật khẩu</label>
          </div>

          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/lock-icon.svg" alt="Lock" className="field-icon" />
            </div>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              disabled={isLoading}
            />
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          </div>

          <button 
            type="submit" 
            className={isFormValid && !isLoading ? 'active' : 'inactive'}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <div className="register-link">
          <span>Đã có tài khoản? </span>
          <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}

export default Register