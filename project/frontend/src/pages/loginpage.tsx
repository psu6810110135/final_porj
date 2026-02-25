import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface FormData {
  username: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (loginError) setLoginError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/signin', formData);
      const token = response.data.accessToken;
      localStorage.setItem('jwt_token', token);
      navigate('/');
    } catch (error) {
      console.error(error);
      setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 64px);
          background: linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 40%, #FFE0B2 100%);
          font-family: 'Prompt', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .auth-container::before {
          content: '';
          position: absolute;
          top: -100px;
          right: -100px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }

        .auth-container::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(93,64,55,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .auth-card {
          background: white;
          padding: 44px 40px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(93,64,55,0.12), 0 4px 16px rgba(255,140,0,0.08);
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(255,140,0,0.1);
        }

        .auth-title {
          text-align: center;
          color: #3E2723;
          margin-bottom: 8px;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .auth-subtitle {
          text-align: center;
          color: #8D6E63;
          font-size: 14px;
          margin-bottom: 28px;
          font-weight: 400;
        }

        .input-group {
          margin-bottom: 18px;
        }

        .input-label {
          display: block;
          margin-bottom: 7px;
          color: #4E342E;
          font-weight: 600;
          font-size: 14px;
        }

        .input-field {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1.5px solid #E0D5CF;
          font-size: 15px;
          font-family: 'Prompt', sans-serif;
          box-sizing: border-box;
          transition: all 0.2s ease;
          background: #FAFAFA;
          color: #3E2723;
          outline: none;
        }

        .input-field:focus {
          border-color: #FF8C00;
          background: white;
          box-shadow: 0 0 0 4px rgba(255,140,0,0.1);
        }

        .input-field.error {
          border-color: #E53935;
          background: #FFF5F5;
        }

        .input-field::placeholder {
          color: #BCAAA4;
          font-weight: 300;
        }

        .error-banner {
          background: #FFF5F5;
          border: 1px solid #FFCDD2;
          border-radius: 10px;
          padding: 11px 14px;
          color: #E53935;
          font-size: 13.5px;
          margin-bottom: 18px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 700;
          font-family: 'Prompt', sans-serif;
          transition: all 0.2s ease;
          margin-top: 6px;
          letter-spacing: 0.3px;
          box-shadow: 0 4px 16px rgba(255,140,0,0.4);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(255,140,0,0.5);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 22px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #EDE0D8;
        }

        .divider-text {
          color: #A1887F;
          font-size: 13px;
          white-space: nowrap;
          font-weight: 400;
        }

        .google-btn {
          width: 100%;
          padding: 13px;
          background: white;
          border: 1.5px solid #E0D5CF;
          border-radius: 12px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Prompt', sans-serif;
          color: #4E342E;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .google-btn:hover {
          border-color: #FF8C00;
          background: #FFF8F0;
          box-shadow: 0 2px 10px rgba(255,140,0,0.12);
        }

        .google-icon {
          width: 20px;
          height: 20px;
        }

        .footer-text {
          text-align: center;
          font-size: 14px;
          margin-top: 22px;
          color: #8D6E63;
        }

        .footer-link {
          color: #FF8C00;
          cursor: pointer;
          font-weight: 700;
          margin-left: 4px;
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-link:hover {
          color: #FF6B00;
        }
      `}</style>

      <Navbar />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">เข้าสู่ระบบ</h2>
          <p className="auth-subtitle">ยินดีต้อนรับกลับมา! เข้าสู่ระบบเพื่อดำเนินการต่อ</p>

          {loginError && (
            <div className="error-banner">
              <span>⚠️</span> {loginError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">ชื่อผู้ใช้</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input-field ${loginError ? 'error' : ''}`}
                placeholder="Username"
                required
                autoComplete="username"
              />
            </div>

            <div className="input-group">
              <label className="input-label">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${loginError ? 'error' : ''}`}
                placeholder="Password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">หรือ เข้าสู่ระบบกับ</span>
            <div className="divider-line" />
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={() => window.location.href = 'http://localhost:3000/auth/google'}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          <p className="footer-text">
            หากยังไม่มีบัญชี
            <Link to="/register" className="footer-link">ลงทะเบียน</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginPage;