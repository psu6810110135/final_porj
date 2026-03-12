import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getToken, removeToken } from '../utils/auth';


/* ── Toast แจ้งเตือนว่า login แล้ว ── */
const AlreadyLoggedToast: React.FC<{ onDone: () => void }> = ({ onDone }) => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState(100);
    const [name, setName] = useState('');

    useEffect(() => {
        // พยายามอ่านชื่อจาก token
        try {
            const token = getToken();
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setName(payload.email || payload.username || '');
            }

        } catch { /* ไม่สนใจ */ }
    }, []);

    useEffect(() => {
        const start = Date.now();
        const duration = 2200;
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (elapsed >= duration) {
                clearInterval(interval);
                onDone();
                navigate('/', { replace: true });
            }
        }, 30);
        return () => clearInterval(interval);
    }, [navigate, onDone]);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap');

        .guest-toast-wrap {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          animation: guestToastIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes guestToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-20px) scale(0.9); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }

        .guest-toast {
          background: white;
          border-radius: 18px;
          padding: 18px 22px 14px;
          min-width: 320px; max-width: 440px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.13), 0 3px 12px rgba(34,197,94,0.1);
          border: 1.5px solid #BBF7D0;
          font-family: 'Prompt', sans-serif;
          overflow: hidden;
        }

        .guest-toast-header {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 10px;
        }

        .guest-toast-icon-ring {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          font-size: 21px; flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(34,197,94,0.3);
        }

        .guest-toast-title {
          font-size: 15px; font-weight: 700; color: #14532d; margin: 0 0 3px;
        }
        .guest-toast-sub {
          font-size: 12.5px; color: #4ade80; margin: 0; font-weight: 600;
          color: #6b7280;
        }

        .guest-toast-bar {
          height: 3px;
          border-radius: 99px;
          background: #DCFCE7;
          overflow: hidden;
          margin-top: 2px;
        }
        .guest-toast-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg, #22c55e, #16a34a);
          transition: width 30ms linear;
        }
      `}</style>

            <div className="guest-toast-wrap">
                <div className="guest-toast">
                    <div className="guest-toast-header">
                        <div className="guest-toast-icon-ring">✓</div>
                        <div>
                            <p className="guest-toast-title">
                                คุณเข้าสู่ระบบแล้ว{name ? ` (${name})` : ''} 👋
                            </p>
                            <p className="guest-toast-sub">กำลังพาคุณกลับหน้าหลัก...</p>
                        </div>
                    </div>
                    <div className="guest-toast-bar">
                        <div className="guest-toast-fill" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        </>
    );
};

/* ── GuestGuard หลัก ── */
const GuestGuard = () => {
    const [status, setStatus] = useState<'checking' | 'guest' | 'logged-in'>('checking');
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const token = getToken();

        if (!token) {
            setStatus('guest');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));

            // ถ้า token หมดอายุ ถือว่าเป็น guest
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                removeToken();
                setStatus('guest');
                return;
            }

            // Token ยังใช้งานได้ = login แล้ว
            setStatus('logged-in');
            setShowToast(true);
        } catch {
            // token เสีย ถือว่า guest
            removeToken();
            setStatus('guest');
        }

    }, []);

    // รอ check
    if (status === 'checking') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#FDFBF7]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF8400] border-t-transparent"></div>
                    <p className="text-sm font-bold text-[#4F200D]/60">กำลังตรวจสอบ...</p>
                </div>
            </div>
        );
    }


    // ยังไม่ได้ login → ให้ผ่านหน้า login/register ได้ปกติ
    if (status === 'guest') return <Outlet />;

    // Login แล้ว → แสดง toast แล้ว redirect ไป home
    if (showToast) {
        return <AlreadyLoggedToast onDone={() => setShowToast(false)} />;
    }

    return <Navigate to="/" replace />;
};

export default GuestGuard;
