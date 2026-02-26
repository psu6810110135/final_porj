import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface FormData {
  username: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.username.trim()) newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    if (formData.password.length < 8) newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัว';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name as keyof FormData]) {
      setErrors({ ...errors, [e.target.name]: undefined });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:3000/auth/signup', {
        username: formData.username,
        password: formData.password
      });
      alert('สมัครสมาชิกสำเร็จ! 🎉 กรุณาเข้าสู่ระบบ');
      navigate('/login');
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 409) {
        setErrors({ username: 'ชื่อผู้ใช้นี้มีคนใช้แล้ว ลองเปลี่ยนชื่อดูนะ' });
      } else {
        alert('เกิดข้อผิดพลาดในการสมัครสมาชิก ❌');
      }
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

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .auth-logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          box-shadow: 0 4px 12px rgba(255,140,0,0.35);
        }

        .auth-title {
          text-align: center;
          color: #3E2723;
          margin-bottom: 28px;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .auth-subtitle {
          text-align: center;
          color: #8D6E63;
          font-size: 14px;
          margin-top: -20px;
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

        .input-wrapper {
          position: relative;
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

        .error-text {
          color: #E53935;
          font-size: 12px;
          margin-top: 5px;
          display: block;
          font-weight: 500;
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
          <h2 className="auth-title">ลงทะเบียน</h2>
          <p className="auth-subtitle">สร้างบัญชีใหม่เพื่อเริ่มต้นการเดินทาง</p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label className="input-label">ชื่อผู้ใช้</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`input-field ${errors.username ? 'error' : ''}`}
                  placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                  required
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">รหัสผ่าน</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'error' : ''}`}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required
                minLength={8}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">ยืนยันรหัสผ่าน</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'กำลังสมัคร...' : 'ลงทะเบียน'}
            </button>
          </form>

          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">หรือ ลงทะเบียนกับ</span>
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
            มีบัญชีอยู่แล้ว?
            <Link to="/login" className="footer-link">เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;