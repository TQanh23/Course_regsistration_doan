import { useState } from 'react'
import '../../App.css'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import authService from '../../api/auth-service'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return emailRegex.test(email)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    if (!isValidEmail(email)) {
      setError('Email không hợp lệ')
      return
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự')
      return
    }

    try {
      await authService.register({
        username,
        email,
        password,
        role: 'admin'
      })
      
      // Registration successful, navigate to verification page
      navigate(`/verify-email-2?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.toString())
    }
  }

  const isFormValid = 
    username.trim() !== '' && 
    email.trim() !== '' && 
    isValidEmail(email) && 
    password.trim() !== '' && 
    confirmPassword.trim() !== '' &&
    password === confirmPassword &&
    password.length >= 8

  return (
    <div className="app">
      <div className="login-container">
        <div className="logo">
          <img src="/huce-logo.png" alt="HUCE Logo" />
        </div>
        <h1 style={{ fontSize: '35px' }}>Đăng ký tài khoản Admin</h1>
        
        {error && (
          <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>
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
            />
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          </div>

          <button 
            type="submit" 
            className={isFormValid ? 'active' : 'inactive'}
            disabled={!isFormValid}
          >
            ĐĂNG KÝ
          </button>
        </form>

        <div className="register-link">
          <span>Đã có tài khoản? </span>
          <Link to="/">Đăng nhập</Link>
        </div>
      </div>
    </div>
  )
}

export default Register