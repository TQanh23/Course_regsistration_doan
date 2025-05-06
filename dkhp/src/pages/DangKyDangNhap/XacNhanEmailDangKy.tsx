import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../../App.css';
import api from '../../api/apiUtils';
import { API_URL } from '../../api/api-config';

function XacNhanEmailDangKy() {
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
  const [success, setSuccess] = useState('');
  
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

  // Start countdown timer
  useEffect(() => {
    // Start timer immediately when component mounts
    startTimer();
    
    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    setCountdown(60);
    setIsResendDisabled(true);
    setTimerActive(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = window.setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          clearInterval(timerRef.current!);
          setIsResendDisabled(false);
          setTimerActive(false);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);
  };

  // Handle input change for verification code digits
  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newVerificationCode = [...verificationCode];
    // If pasting a multi-digit value
    if (value.length > 1) {
      const digits = value.split('').slice(0, 6);
      
      // Fill as many inputs as we have digits for
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newVerificationCode[index + i] = digit;
        }
      });
      
      setVerificationCode(newVerificationCode);
      
      // Focus on the input after the last digit entered, or the last input
      const focusIndex = Math.min(index + digits.length, 5);
      inputRefs.current[focusIndex]?.focus();
    } else {
      // Single digit entered
      newVerificationCode[index] = value;
      setVerificationCode(newVerificationCode);
      
      // Auto-focus next input if this one is filled
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle key press for backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && index > 0 && verificationCode[index] === '') {
      // If current field is empty and backspace is pressed, go to previous field
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event for the verification code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    if (pastedData) {
      // Filter only digits from pasted content
      const digitsOnly = pastedData.replace(/\D/g, '');
      handleInputChange(index, digitsOnly);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    
    // Validate the verification code
    if (code.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã xác nhận 6 số');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Verifying code:', { email, code });
      
      const response = await api.post('/auth/verify-email', {
        email,
        code
      });
      
      setSuccess('Xác nhận email thành công!');
      
      // Wait a short moment before redirecting
      setTimeout(() => {
        navigate('/login', { state: { verifiedEmail: email } });
      }, 1500);
      
    } catch (error: any) {
      console.error('Verification error:', error);
      
      let message = 'Xác nhận email thất bại';
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc máy chủ.';
      } else if (error.response) {
        // Server responded with error
        message = error.response.data?.message || 'Mã xác nhận không đúng hoặc đã hết hạn';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (isResendDisabled) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await api.post('/auth/resend-verification', { email });
      
      setSuccess('Đã gửi lại mã xác nhận vào email của bạn');
      startTimer();
      
    } catch (error: any) {
      console.error('Resend error:', error);
      
      let message = 'Gửi lại mã thất bại';
      
      if (error.code === 'ERR_NETWORK') {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (error.response) {
        message = error.response.data?.message || 'Không thể gửi lại mã xác nhận';
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test server connection on component mount, similar to LoginScreen
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(API_URL.replace('/api', ''));
        console.log('Server connection test:', response.status === 200 ? 'Success' : 'Failed');
      } catch (error) {
        console.error('Server connection test failed:', error);
      }
    };
    
    testConnection();
  }, []);

  // If no email is provided, redirect to registration
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Xác nhận email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Chúng tôi đã gửi mã xác nhận đến email {maskedEmail}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                Mã xác nhận
              </label>
              <div className="mt-2 flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={(e) => handlePaste(e, index)}
                    className="block w-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-center text-xl font-semibold"
                    required
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xác nhận...
                  </span>
                ) : 'Xác nhận'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Chưa nhận được mã?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResendDisabled || isLoading}
                className={`text-sm font-medium ${isResendDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-500 cursor-pointer'}`}
              >
                {timerActive ? `Gửi lại mã (${countdown}s)` : 'Gửi lại mã'}
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">Hoặc</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Thay đổi email
              </Link>
            </div>
          </div>
          
          <div className="mt-6 text-center text-xs text-gray-500">
            Server: {API_URL}
          </div>
        </div>
      </div>
    </div>
  );
}

export default XacNhanEmailDangKy;