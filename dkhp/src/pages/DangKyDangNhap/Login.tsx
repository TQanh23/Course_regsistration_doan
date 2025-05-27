import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../../App.css'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../../api/auth-service'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const response = await authService.login(username, password, 'admin')
      if (response.success) {
        // Login successful, navigate to home
        navigate('/trang-chu')
      } else {
        setError(response.message || 'Đăng nhập thất bại')
      }
    } catch (err: any) {
      setError(err.toString())
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
          <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
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
            />
            <label htmlFor="password">Mật khẩu</label>
          </div>
          
          <div className="forgot-password-container">
            <Link to="/forgot-password" className="forgot-password-link">Quên mật khẩu</Link>
          </div>

          <button 
            type="submit" 
            className={isFormValid ? 'active' : 'inactive'}
            disabled={!isFormValid}
          >
            ĐĂNG NHẬP
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