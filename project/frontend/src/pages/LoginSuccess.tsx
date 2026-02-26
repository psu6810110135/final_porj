import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('jwt_token', token);
      setStatus('success');
      const timer = setTimeout(() => navigate('/'), 1800);
      return () => clearTimeout(timer);
    } else {
      setStatus('error');
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&display=swap');

        .success-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 40%, #FFE0B2 100%);
          font-family: 'Prompt', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .success-container::before {
          content: '';
          position: absolute;
          top: -100px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
          border-radius: 50%;
        }

        .success-container::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(93,64,55,0.08) 0%, transparent 70%);
          border-radius: 50%;
        }

        .success-card {
          background: white;
          padding: 52px 48px;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(93,64,55,0.12), 0 4px 16px rgba(255,140,0,0.08);
          text-align: center;
          max-width: 380px;
          width: 100%;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(255,140,0,0.1);
          animation: cardIn 0.4s ease;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .icon-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 36px;
        }

        .icon-circle.loading {
          background: #FFF3E0;
          animation: pulse 1.4s ease-in-out infinite;
        }

        .icon-circle.success {
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          box-shadow: 0 6px 20px rgba(255,140,0,0.4);
          animation: popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .icon-circle.error {
          background: #FFF5F5;
          border: 2px solid #FFCDD2;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.8; }
        }

        @keyframes popIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .spinner {
          width: 38px;
          height: 38px;
          border: 3px solid #FFE0B2;
          border-top-color: #FF8C00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .card-title {
          font-size: 22px;
          font-weight: 700;
          color: #3E2723;
          margin-bottom: 8px;
        }

        .card-subtitle {
          font-size: 14px;
          color: #8D6E63;
          font-weight: 400;
          line-height: 1.6;
        }

        .progress-bar {
          margin-top: 28px;
          height: 4px;
          background: #FFF3E0;
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 99px;
          animation: fillBar 1.8s linear forwards;
        }

        .progress-fill.success-fill {
          background: linear-gradient(90deg, #FF8C00, #FF6B00);
        }

        .progress-fill.error-fill {
          background: #E53935;
          animation-duration: 2s;
        }

        @keyframes fillBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      <div className="success-container">
        <div className="success-card">
          <div className={`icon-circle ${status}`}>
            {status === 'loading' && <div className="spinner" />}
            {status === 'success' && <span style={{ color: 'white' }}>✓</span>}
            {status === 'error' && <span>⚠️</span>}
          </div>

          <div className="card-title">
            {status === 'loading' && 'กำลังเข้าสู่ระบบ...'}
            {status === 'success' && 'เข้าสู่ระบบสำเร็จ!'}
            {status === 'error' && 'เกิดข้อผิดพลาด'}
          </div>

          <div className="card-subtitle">
            {status === 'loading' && 'กรุณารอสักครู่'}
            {status === 'success' && 'ยินดีต้อนรับ! กำลังพาคุณไปยังหน้าหลัก...'}
            {status === 'error' && 'ไม่พบ Token กำลังพาคุณกลับไปหน้าเข้าสู่ระบบ...'}
          </div>

          {status !== 'loading' && (
            <div className="progress-bar">
              <div className={`progress-fill ${status === 'success' ? 'success-fill' : 'error-fill'}`} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginSuccess;