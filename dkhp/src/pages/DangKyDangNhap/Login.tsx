import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../App.css'
import React from 'react'
import { useAuth } from '../../api/auth'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() 
    
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Pass 'admin' as the role parameter for web admin application
      await login(username, password, 'admin')
      // Redirect to dashboard on successful login
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Login failed:', err)
      
      // Error message is already set by the auth context
      // but we can add additional handling here if needed
      if (!err.response && err.code !== 'ERR_NETWORK') {
        setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = username.trim() !== '' && password.trim() !== ''

  return (
    <div className="app">
      <div className="login-container">
        <div className="logo">
          <img src="/huce-logo.png" alt="HUCE Logo" />
        </div>
        <h1 style={{ fontSize: '35px' }}>Welcome to HUCE</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin}>
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
          
          <div className="forgot-password-container">
            <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu</Link>
          </div>

          <button 
            type="submit" 
            className={isFormValid && !isLoading ? 'active' : 'inactive'}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </button>
        </form>

        <div className="register-link">
          <span>Chưa có tài khoản? </span>
          <Link to="/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  )
}

export default Login