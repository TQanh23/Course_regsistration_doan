import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import api from '../../api/apiUtils';

function XacNhanEmailQuenPass() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  // State for the 6-digit verification code
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Mask email for display (show only first two characters and domain)
  const maskEmail = (email: string): string => {
    if (!email) return '';
    
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const name = parts[0];
    const domain = parts[1];
    
    if (name.length <= 2) return email;
    
    const maskedName = name.substring(0, 2) + '*'.repeat(name.length - 2);
    return `${maskedName}@${domain}`;
  };
  
  const maskedEmail = maskEmail(email);
  
  useEffect(() => {
    // Focus the first input on component mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    
    // Start timer initially
    setTimerActive(true);
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Separate effect for managing the countdown
  useEffect(() => {
    if (timerActive) {
      setIsResendDisabled(true);
      
      timerRef.current = window.setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            setIsResendDisabled(false);
            setTimerActive(false);
            clearInterval(timerRef.current as number);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);
  
  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;
    
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    
    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]!.focus();
    }
  };
  
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current is empty
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleResend = async () => {
    if (isResendDisabled) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call API to resend verification code
      await api.post('/auth/resend-verification', { 
        email,
        purpose: 'password-reset'
      });
      
      // Reset verification code inputs
      setVerificationCode(['', '', '', '', '', '']);
      setCountdown(60);
      setTimerActive(true);
      
      // Focus the first input
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err: any) {
      console.error('Resend code error:', err);
      setError(err.message || 'Không thể gửi lại mã. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    
    if (code.length !== 6) {
      setError('Vui lòng nhập đủ 6 chữ số');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Call API to verify code
      const response = await api.post('/auth/verify-code', {
        email,
        code,
        purpose: 'password-reset'
      });
      
      // Navigate to reset password page with token
      const { token } = response.data;
      navigate('/tao-mat-khau-moi', { 
        state: { email, token }
      });
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Mã xác thực không đúng. Vui lòng thử lại.');
      
      if (err.originalError?.response?.data?.message) {
        setError(err.originalError.response.data.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Check if all verification code fields are filled
  const isFormValid = verificationCode.every(digit => digit !== '') && !isLoading;
  
  return (
    <div className="verification-page">
      <div className="verification-container">
        <div className="header">
          <Link to="/forgot-password" className="back-button" style={{ marginLeft: '500px', marginTop: '90px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </Link>
          <div className="logo">
            <img src="/huce-logo.png" alt="HUCE Logo" />
          </div>
        </div>

        <h1 className="title">Xác nhận email</h1>
        <p className="subtitle">
          Vui lòng nhập mã xác thực được gửi đến email<br />
          {maskedEmail || 'của bạn'}
        </p>
        
        {error && <div style={{ color: '#e74c3c', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="verification-inputs">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="verification-input"
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="resend-code">
            <span>Bạn chưa nhận được mã? </span>
            <span
              onClick={!isResendDisabled && !isLoading ? handleResend : undefined}
              style={{
                color: isResendDisabled || isLoading ? '#aaa' : 'orange',
                textDecoration: 'none',
                cursor: isResendDisabled || isLoading ? 'default' : 'pointer',
                userSelect: 'none',
              }}
              role="button"
              tabIndex={isResendDisabled || isLoading ? -1 : 0}
            >
              Gửi lại {isResendDisabled ? `(${countdown})` : ''}
            </span>
          </div>

          <button 
            type="submit" 
            className={isFormValid ? 'active' : 'inactive'}
            disabled={!isFormValid}
          >
            {isLoading ? 'ĐANG XỬ LÝ...' : 'XÁC THỰC'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default XacNhanEmailQuenPass;