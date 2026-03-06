import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

/* ── Toast notification (ไม่ใช้ browser alert เลย) ── */
interface ToastProps {
  message: string;
  icon: string;
  onDone: () => void;
  redirectTo: string;
}

const GuardToast: React.FC<ToastProps> = ({ message, icon, onDone, redirectTo }) => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Progress bar countdown 2.5 วินาที
    const start = Date.now();
    const duration = 2500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(interval);
        onDone();
        navigate(redirectTo, { replace: true });
      }
    }, 30);
    return () => clearInterval(interval);
  }, [navigate, onDone, redirectTo]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap');

        .guard-toast-wrap {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          animation: toastSlideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.92); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)      scale(1);    }
        }

        .guard-toast {
          background: white;
          border-radius: 18px;
          padding: 18px 22px 14px;
          min-width: 320px; max-width: 420px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.14), 0 3px 12px rgba(255,140,0,0.12);
          border: 1.5px solid #FFE0B2;
          font-family: 'Prompt', sans-serif;
          overflow: hidden;
        }

        .guard-toast-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .guard-toast-icon {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .guard-toast-icon.deny  { background: #FFF3E0; }
        .guard-toast-icon.login { background: #FFF8F0; }

        .guard-toast-title {
          font-size: 15px; font-weight: 700; color: #3E2723;
          margin: 0 0 2px;
        }
        .guard-toast-sub {
          font-size: 12.5px; color: #A1887F; margin: 0; font-weight: 500;
        }

        .guard-toast-bar {
          height: 3px;
          border-radius: 99px;
          background: #FFE0B2;
          overflow: hidden;
          margin-top: 2px;
        }
        .guard-toast-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #FF8C00, #FF6B00);
          transition: width 30ms linear;
        }
      `}</style>

      <div className="guard-toast-wrap">
        <div className="guard-toast">
          <div className="guard-toast-header">
            <div className={`guard-toast-icon ${redirectTo === '/login' ? 'login' : 'deny'}`}>
              {icon}
            </div>
            <div>
              <p className="guard-toast-title">{message}</p>
              <p className="guard-toast-sub">กำลังพาคุณไปยังหน้าที่ถูกต้อง...</p>
            </div>
          </div>
          <div className="guard-toast-bar">
            <div className="guard-toast-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </>
  );
};

/* ── AdminGuard หลัก ── */
const AdminGuard = () => {
  const [toast, setToast] = useState<{ message: string; icon: string; redirectTo: string } | null>(null);
  const [decision, setDecision] = useState<'allow' | 'deny-no-token' | 'deny-not-admin' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');

    // 1. ไม่มี token เลย
    if (!token) {
      setToast({ message: 'กรุณาเข้าสู่ระบบก่อนนะครับ 🛡️', icon: '🔐', redirectTo: '/login' });
      setDecision('deny-no-token');
      return;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));

      // 2. ตรวจ token หมดอายุ
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('jwt_token');
        setToast({ message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่', icon: '⏰', redirectTo: '/login' });
        setDecision('deny-no-token');
        return;
      }

      // 3. ตรวจ role
      if (payload.role === 'admin') {
        setDecision('allow');
      } else {
        setToast({ message: 'เฉพาะ Admin เท่านั้นที่เข้าหน้านี้ได้', icon: '🚫', redirectTo: '/' });
        setDecision('deny-not-admin');
      }
    } catch {
      // token เสีย
      localStorage.removeItem('jwt_token');
      setToast({ message: 'Token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่', icon: '⚠️', redirectTo: '/login' });
      setDecision('deny-no-token');
    }
  }, []);

  // รอจนกว่า useEffect จะตัดสินใจก่อน (ป้องกัน flash)
  if (decision === null) return null;

  // อนุญาต
  if (decision === 'allow') return <Outlet />;

  // ปฏิเสธ — แสดง toast แล้วค่อย redirect ผ่าน toast component
  if (toast) {
    return (
      <GuardToast
        message={toast.message}
        icon={toast.icon}
        redirectTo={toast.redirectTo}
        onDone={() => setToast(null)}
      />
    );
  }

  // fallback safety
  return <Navigate to="/login" replace />;
};

export default AdminGuard;