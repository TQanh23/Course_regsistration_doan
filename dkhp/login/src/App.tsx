import { useState } from 'react'
import { Link } from 'react-router-dom'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Xử lý đăng nhập ở đây
    console.log('Login attempt:', { username, password })
  }

  const isFormValid = username.trim() !== '' && password.trim() !== ''

  return (
    <div className="app">
      <div className="login-container">
        <div className="logo">
          <img src="/huce-logo.png" alt="HUCE Logo" />
        </div>
        <h1>Welcome to HUCE</h1>
        
        <form onSubmit={handleLogin}>
          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/user-icon.svg" alt="User" className="field-icon" />
            </div>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-field">
            <div className="icon-wrapper">
              <img src="/lock-icon.svg" alt="Lock" className="field-icon" />
            </div>
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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

export default App
