import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '@/config/api';

/* ─── Types ─────────────────────────────────────── */
type View = "login" | "forgot" | "otp" | "reset";

/* ─── OTP Input Component (outside to prevent remount) ── */
interface OtpInputProps {
  value: string[];
  onChange: (val: string[]) => void;
  hasError: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({ value, onChange, hasError }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = [...value];
      next[i] = "";
      onChange(next);
      return;
    }
    // paste สูงสุด 6 ตัว
    if (raw.length > 1) {
      const digits = raw.slice(0, 6).split("");
      const next = Array(6).fill("");
      digits.forEach((d, idx) => {
        next[idx] = d;
      });
      onChange(next);
      refs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }
    const next = [...value];
    next[i] = raw;
    onChange(next);
    if (i < 5) refs.current[i + 1]?.focus();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        justifyContent: "center",
        margin: "8px 0 4px",
      }}
    >
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKey(i, e)}
            style={{
              width: 46,
              height: 54,
              textAlign: "center",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: "Prompt, sans-serif",
              borderRadius: 12,
              outline: "none",
              border: `2px solid ${hasError ? "#ef4444" : value[i] ? "#FF8C00" : "#E0D5CF"}`,
              background: hasError
                ? "#fff5f5"
                : value[i]
                  ? "#FFF8F0"
                  : "#FAFAFA",
              color: "#3E2723",
              transition: "all 0.15s",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#FF8C00";
              e.target.style.boxShadow = "0 0 0 3px rgba(255,140,0,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = hasError
                ? "#ef4444"
                : value[i]
                  ? "#FF8C00"
                  : "#E0D5CF";
            }}
          />
        ))}
    </div>
  );
};

/* ─── Password strength helper ──────────────────── */
const getStrength = (pw: string) => {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
};
const STRENGTH_LABEL = ["", "อ่อนมาก", "อ่อน", "ปานกลาง", "แข็งแกร่ง"];
const STRENGTH_COLOR = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

/* ─── Main Component ─────────────────────────────── */
const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [view, setView] = useState<View>("login");

  /* Google Conflict Modal state */
  const [showConflictModal, setShowConflictModal] = useState(false);

  /* Login state */
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [isGoogleAccountError, setIsGoogleAccountError] = useState(false);

  /* Forgot state */
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");

  /* OTP state */
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [countdown, setCountdown] = useState(0);

  /* Reset state */
  const [resetForm, setResetForm] = useState({ password: "", confirm: "" });
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [otpToken, setOtpToken] = useState(""); // token จาก OTP verify

  /* Detect ?error=google_conflict จาก Google OAuth redirect */
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'email_exists' || error === 'google_conflict') {
      setShowConflictModal(true);
      // ล้าง query param ออกจาก URL โดยไม่ reload
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  /* รับ state จากหน้า EmailConflict → เปิด forgot password พร้อม email ที่กรอกไว้ */
  useEffect(() => {
    const state = location.state as { openForgot?: boolean; email?: string } | null;
    if (state?.openForgot) {
      setView('forgot');
      if (state.email) {
        setForgotEmail(state.email);
      }
      // ล้าง state ออกเพื่อกัน re-trigger
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  /* Countdown timer */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const strength = getStrength(resetForm.password);

  /* ── Login ── */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    setIsGoogleAccountError(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signin`, loginForm);
      localStorage.setItem('jwt_token', res.data.accessToken);
      const redirectUrl = localStorage.getItem('redirect_after_login');
      if (redirectUrl) {
        localStorage.removeItem('redirect_after_login');
        navigate(redirectUrl);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;

      if (msg === 'GOOGLE_ACCOUNT') {
        setIsGoogleAccountError(true);
        setLoginError('บัญชีนี้ผูกกับ Google กรุณากดปุ่ม "เข้าสู่ระบบด้วย Google" ด้านล่าง');
      } else if (status === 400) {
        // จัดการ Error Validation จาก Backend (400 Bad Request)
        setLoginError(Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : 'ข้อมูลไม่ถูกต้อง'));
      } else {
        setLoginError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  /* ── Forgot: ส่ง OTP ── */
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setForgotError("กรุณากรอกอีเมล");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setForgotError("รูปแบบอีเมลไม่ถูกต้อง");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email: forgotEmail });
      setCountdown(60);
      setView('otp');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === 'GOOGLE_ACCOUNT') {
        setForgotError('บัญชีนี้ลงทะเบียนผ่าน Google ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณากลับไปเข้าสู่ระบบด้วย Google');
      } else if (err.response?.status === 400 || err.response?.status === 404) {
        setForgotError('ไม่พบอีเมลนี้ในระบบ');
      } else {
        setForgotError('เกิดข้อผิดพลาด กรุณาลองใหม่');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: forgotEmail,
      });
      setCountdown(60);
      setOtp(Array(6).fill(""));
      setOtpError("");
    } catch {
      setOtpError("ส่ง OTP ใหม่ไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  /* ── OTP verify ── */
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setOtpError("กรุณากรอก OTP ให้ครบ 6 หลัก");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: forgotEmail,
        otp: code,
      });
      setOtpToken(res.data.resetToken || "");
      setView("reset");
    } catch (err: any) {
      if (err.response?.status === 400)
        setOtpError("รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว");
      else setOtpError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Reset password ── */
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetForm.password.length < 8) {
      setResetError("รหัสผ่านต้องมีอย่างน้อย 8 ตัว");
      return;
    }
    if (resetForm.password !== resetForm.confirm) {
      setResetError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setResetLoading(true);
    setResetError("");
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email: forgotEmail,
        resetToken: otpToken,
        newPassword: resetForm.password,
      });
      /* สำเร็จ — กลับ login พร้อม banner */
      setView("login");
      setLoginError("");
      setResetForm({ password: "", confirm: "" });
      setOtp(Array(6).fill(""));
      setForgotEmail("");
    } catch (err: any) {
      setResetError("ไม่สามารถรีเซ็ตรหัสผ่านได้ กรุณาเริ่มใหม่");
    } finally {
      setResetLoading(false);
    }
  };

  /* ── Shared input style ── */
  const iStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: 12,
    border: `1.5px solid ${hasError ? "#E53935" : "#E0D5CF"}`,
    fontSize: 15,
    fontFamily: "Prompt, sans-serif",
    boxSizing: "border-box",
    transition: "all 0.2s",
    background: hasError ? "#FFF5F5" : "#FAFAFA",
    color: "#3E2723",
    outline: "none",
  });

  const iStylePw = (hasError: boolean): React.CSSProperties => ({
    ...iStyle(hasError),
    paddingRight: 44,
  });

  const VIEW_TITLES: Record<View, { title: string; subtitle: string; icon: string }> = {
    login: { title: 'เข้าสู่ระบบ', subtitle: 'ยินดีต้อนรับกลับมา! เข้าสู่ระบบเพื่อดำเนินการต่อ', icon: '👋' },
    forgot: { title: 'ลืมรหัสผ่าน', subtitle: 'กรอกอีเมลที่ผูกกับบัญชีของคุณ เราจะส่ง OTP ให้', icon: '🔑' },
    otp: { title: 'ยืนยัน OTP', subtitle: `กรอกรหัส 6 หลักที่ส่งไปยัง ${forgotEmail}`, icon: '📨' },
    reset: { title: 'ตั้งรหัสผ่านใหม่', subtitle: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร', icon: '🛡️' },
  };

  const { title, subtitle, icon } = VIEW_TITLES[view];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap');

        .auth-page * { font-family: 'Prompt', sans-serif; box-sizing: border-box; }

        .auth-container {
          display: flex; justify-content: center; align-items: center;
          min-height: calc(100vh - 64px);
          background: linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 40%, #FFE0B2 100%);
          padding: 24px; position: relative; overflow: hidden;
        }
        .auth-container::before {
          content: ''; position: absolute; top: -100px; right: -100px;
          width: 400px; height: 400px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
        }
        .auth-container::after {
          content: ''; position: absolute; bottom: -80px; left: -80px;
          width: 300px; height: 300px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(93,64,55,0.08) 0%, transparent 70%);
        }

        .auth-card {
          background: white; border-radius: 28px; width: 100%; max-width: 420px;
          position: relative; z-index: 1; border: 1px solid rgba(255,140,0,0.1);
          box-shadow: 0 20px 60px rgba(93,64,55,0.12), 0 4px 16px rgba(255,140,0,0.08);
          overflow: hidden;
        }

        .auth-header {
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          padding: 26px 40px 22px; position: relative;
        }
        .auth-header::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 20px; background: white; border-radius: 20px 20px 0 0;
        }
        .auth-body { padding: 16px 40px 36px; }

        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          color: white; border: none; border-radius: 12px; cursor: pointer;
          font-size: 16px; font-weight: 700; font-family: 'Prompt', sans-serif;
          transition: all 0.2s; letter-spacing: 0.3px;
          box-shadow: 0 4px 16px rgba(255,140,0,0.4); margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,140,0,0.5); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.68; cursor: not-allowed; }

        .back-link {
          display: inline-flex; align-items: center; gap: 6px;
          color: #A1887F; font-size: 13px; font-weight: 600;
          cursor: pointer; background: none; border: none;
          padding: 0; transition: color 0.2s; margin-bottom: 18px;
        }
        .back-link:hover { color: #FF8C00; }

        .divider { display: flex; align-items: center; gap: 12px; margin: 20px 0; }
        .divider-line { flex: 1; height: 1px; background: #EDE0D8; }
        .divider-text { color: #A1887F; font-size: 13px; white-space: nowrap; }

        .google-btn {
          width: 100%; padding: 13px; background: white; border: 1.5px solid #E0D5CF;
          border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 600;
          font-family: 'Prompt', sans-serif; color: #4E342E; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .google-btn:hover { border-color: #FF8C00; background: #FFF8F0; box-shadow: 0 2px 10px rgba(255,140,0,0.12); }

        .error-banner {
          background: #FFF5F5; border: 1.5px solid #FFCDD2; border-radius: 12px;
          padding: 11px 14px; color: #E53935; font-size: 13px;
          margin-bottom: 16px; font-weight: 500; display: flex; align-items: center; gap: 8px;
        }
        .success-banner {
          background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px;
          padding: 11px 14px; color: #16a34a; font-size: 13px;
          margin-bottom: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;
        }

        .input-label { display: block; margin-bottom: 7px; color: #4E342E; font-weight: 600; font-size: 14px; }
        .input-group { margin-bottom: 18px; }
        .eyebtn { position: absolute; right: 13px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; font-size: 17px; padding: 0; opacity: 0.4; transition: opacity 0.2s; line-height: 1; }
        .eyebtn:hover { opacity: 0.75; }

        .strength-bar { display: flex; gap: 3px; margin-top: 6px; }
        .strength-seg { height: 4px; flex: 1; border-radius: 2px; transition: background 0.3s; }

        .footer-text { text-align: center; font-size: 14px; margin-top: 20px; color: #8D6E63; }
        .footer-link { color: #FF8C00; cursor: pointer; font-weight: 700; margin-left: 4px; text-decoration: none; transition: color 0.2s; }
        .footer-link:hover { color: #FF6B00; }

        .step-dots { display: flex; gap: 6px; justify-content: center; margin-bottom: 4px; }
        .dot { height: 5px; border-radius: 3px; transition: all 0.3s; background: #E0D5CF; width: 20px; }
        .dot.active { background: #FF8C00; width: 36px; box-shadow: 0 0 6px rgba(255,140,0,0.4); }
        .dot.done { background: #FF8C00; opacity: 0.45; width: 20px; }

        .resend-btn { background: none; border: none; cursor: pointer; font-family: 'Prompt', sans-serif; font-size: 13px; font-weight: 700; padding: 0; transition: color 0.2s; }
        .resend-btn:disabled { cursor: default; }

        @keyframes slideIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .slide-in { animation: slideIn 0.22s ease; }

        @keyframes pulse-border {
          0%, 100% { box-shadow: 0 0 0 3px rgba(255,140,0,0.25); }
          50% { box-shadow: 0 0 0 6px rgba(255,140,0,0.1); }
        }

        /* ── Conflict Modal ── */
        .conflict-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(30, 15, 5, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeOverlay 0.25s ease;
        }
        @keyframes fadeOverlay {
          from { opacity: 0; } to { opacity: 1; }
        }

        .conflict-modal {
          background: white;
          border-radius: 24px;
          width: 100%; max-width: 420px;
          box-shadow: 0 28px 80px rgba(30,15,5,0.22), 0 6px 24px rgba(255,140,0,0.1);
          overflow: hidden;
          animation: popModal 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes popModal {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .conflict-banner {
          background: linear-gradient(135deg, #FF8C00, #FF5722);
          padding: 28px 32px 24px;
          text-align: center;
          position: relative;
        }
        .conflict-icon-ring {
          width: 68px; height: 68px;
          background: rgba(255,255,255,0.18);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 30px;
          margin: 0 auto 14px;
          box-shadow: 0 0 0 10px rgba(255,255,255,0.08);
        }

        .conflict-body {
          padding: 28px 32px 32px;
        }

        .conflict-step {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          margin-bottom: 10px;
          background: #FFF8F0;
          border: 1.5px solid #FFE0B2;
          transition: background 0.2s;
        }
        .conflict-step:last-of-type { margin-bottom: 0; }
        .conflict-step-num {
          width: 26px; height: 26px; min-width: 26px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          border-radius: 50%;
          color: white; font-size: 12px; font-weight: 800;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .conflict-step-text {
          font-size: 13.5px; color: #4E342E;
          line-height: 1.55; font-weight: 500;
          font-family: 'Prompt', sans-serif;
        }
        .conflict-step-text b { color: #E65100; }

        .conflict-btn-primary {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          color: white; border: none; border-radius: 13px;
          font-size: 15.5px; font-weight: 700;
          font-family: 'Prompt', sans-serif;
          cursor: pointer; letter-spacing: 0.2px;
          box-shadow: 0 5px 18px rgba(255,140,0,0.4);
          transition: all 0.2s; margin-top: 20px;
        }
        .conflict-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 7px 22px rgba(255,140,0,0.5); }
        .conflict-btn-primary:active { transform: translateY(0); }

        .conflict-btn-secondary {
          width: 100%; padding: 12px;
          background: transparent;
          color: #A1887F; border: 1.5px solid #E0D5CF;
          border-radius: 13px;
          font-size: 14px; font-weight: 600;
          font-family: 'Prompt', sans-serif;
          cursor: pointer; margin-top: 10px;
          transition: all 0.2s;
        }
        .conflict-btn-secondary:hover { border-color: #A1887F; color: #6D4C41; background: #FFF8F0; }

        .conflict-close {
          position: absolute; top: 14px; right: 16px;
          background: rgba(255,255,255,0.2); border: none;
          width: 30px; height: 30px; border-radius: 50%;
          color: white; font-size: 14px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; font-weight: 700;
        }
        .conflict-close:hover { background: rgba(255,255,255,0.35); }
      `}</style>

      {/* ── Google Conflict Modal ── */}
      {showConflictModal && (
        <div className="conflict-overlay" onClick={() => setShowConflictModal(false)}>
          <div className="conflict-modal" onClick={e => e.stopPropagation()}>

            {/* Banner */}
            <div className="conflict-banner">
              <button className="conflict-close" onClick={() => setShowConflictModal(false)}>✕</button>
              <div className="conflict-icon-ring">⚠️</div>
              <h2 style={{ color: 'white', fontSize: 19, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Prompt, sans-serif' }}>
                อีเมลนี้มีบัญชีอยู่แล้ว!
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0, fontFamily: 'Prompt, sans-serif', lineHeight: 1.5 }}>
                บัญชีนี้ลงทะเบียนด้วยรหัสผ่านปกติ<br />ไม่สามารถเข้าสู่ระบบด้วย Google ได้โดยตรง
              </p>
            </div>

            {/* Body */}
            <div className="conflict-body">
              <p style={{ color: '#5D4037', fontWeight: 700, fontSize: 14, margin: '0 0 14px', fontFamily: 'Prompt, sans-serif' }}>
                📋 วิธีแก้ไข:
              </p>

              <div className="conflict-step">
                <div className="conflict-step-num">1</div>
                <div className="conflict-step-text">
                  ถ้า<b>จำรหัสผ่านได้</b> — กดปิดหน้าต่างนี้แล้วกรอก
                  <b> Username / Email + รหัสผ่าน</b> เข้าสู่ระบบปกติ
                </div>
              </div>

              <div className="conflict-step">
                <div className="conflict-step-num">2</div>
                <div className="conflict-step-text">
                  ถ้า<b>ลืมรหัสผ่าน</b> — กดปุ่มด้านล่างเพื่อไปหน้า
                  <b> รีเซ็ตรหัสผ่าน</b> ผ่านอีเมลได้เลย
                </div>
              </div>

              <button
                className="conflict-btn-primary"
                onClick={() => {
                  setShowConflictModal(false);
                  setView('forgot');
                }}
              >
                🔑 ลืมรหัสผ่าน — ไปรีเซ็ตรหัสผ่าน
              </button>

              <button
                className="conflict-btn-secondary"
                onClick={() => setShowConflictModal(false)}
              >
                ✕ ปิด — ฉันจำรหัสผ่านได้แล้ว
              </button>
            </div>

          </div>
        </div>
      )}

      <Navbar />
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            {/* ── Header ── */}
            <div className="auth-header">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    background: "rgba(255,255,255,0.22)",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {icon}
                </div>
                <div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: 11,
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    GoTrip
                  </p>
                  <h2
                    style={{
                      color: "white",
                      fontSize: 22,
                      fontWeight: 800,
                      margin: 0,
                      letterSpacing: "-0.4px",
                    }}
                  >
                    {title}
                  </h2>
                </div>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="auth-body">
              {/* ─────────── VIEW: LOGIN ─────────── */}
              {view === "login" && (
                <div className="slide-in">
                  <p
                    style={{
                      color: "#8D6E63",
                      fontSize: 14,
                      margin: "0 0 22px",
                      textAlign: "center",
                    }}
                  >
                    {subtitle}
                  </p>

                  {loginError && (
                    <div className="error-banner">
                      <span>⚠️</span>
                      {loginError}
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <div className="input-group">
                      <label className="input-label">ชื่อผู้ใช้</label>
                      <input
                        type="text"
                        name="username"
                        value={loginForm.username}
                        placeholder="Username"
                        required
                        autoComplete="username"
                        style={iStyle(!!loginError)}
                        onChange={(e) => {
                          setLoginForm((p) => ({
                            ...p,
                            username: e.target.value,
                          }));
                          setLoginError("");
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#FF8C00";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(255,140,0,0.1)";
                          e.target.style.background = "white";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = loginError
                            ? "#E53935"
                            : "#E0D5CF";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = loginError
                            ? "#FFF5F5"
                            : "#FAFAFA";
                        }}
                      />
                    </div>

                    <div
                      className="input-group"
                      style={{ position: "relative" }}
                    >
                      <label className="input-label">รหัสผ่าน</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showLoginPass ? "text" : "password"}
                          name="password"
                          value={loginForm.password}
                          placeholder="Password"
                          required
                          autoComplete="current-password"
                          style={iStylePw(!!loginError)}
                          onChange={(e) => {
                            setLoginForm((p) => ({
                              ...p,
                              password: e.target.value,
                            }));
                            setLoginError("");
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#FF8C00";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(255,140,0,0.1)";
                            e.target.style.background = "white";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = loginError
                              ? "#E53935"
                              : "#E0D5CF";
                            e.target.style.boxShadow = "none";
                            e.target.style.background = loginError
                              ? "#FFF5F5"
                              : "#FAFAFA";
                          }}
                        />
                        <button
                          type="button"
                          className="eyebtn"
                          onClick={() => setShowLoginPass((p) => !p)}
                        >
                          {showLoginPass ? "🙈" : "👁️"}
                        </button>
                      </div>
                    </div>

                    {/* Forgot link */}
                    <div
                      style={{
                        textAlign: "right",
                        marginTop: -10,
                        marginBottom: 18,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setView("forgot");
                          setLoginError("");
                        }}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#FF8C00",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "Prompt, sans-serif",
                          padding: 0,
                        }}
                      >
                        ลืมรหัสผ่าน?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loginLoading}
                    >
                      {loginLoading ? "⏳ กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
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
                    style={isGoogleAccountError ? {
                      borderColor: '#FF8C00',
                      background: '#FFF8F0',
                      boxShadow: '0 0 0 3px rgba(255,140,0,0.25)',
                      animation: 'pulse-border 1.5s ease-in-out infinite',
                    } : {}}
                    onClick={() => { window.location.href = `${API_BASE_URL}/api/auth/google`; }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {isGoogleAccountError ? '👉 กดที่นี่เพื่อเข้าสู่ระบบด้วย Google' : 'Google'}
                  </button>

                  <p className="footer-text">
                    หากยังไม่มีบัญชี
                    <Link to="/register" className="footer-link">
                      ลงทะเบียน
                    </Link>
                  </p>
                </div>
              )}

              {/* ─────────── VIEW: FORGOT ─────────── */}
              {view === "forgot" && (
                <div className="slide-in">
                  <button
                    className="back-link"
                    onClick={() => {
                      setView("login");
                      setForgotError("");
                      setForgotEmail("");
                    }}
                  >
                    ← กลับสู่หน้าเข้าสู่ระบบ
                  </button>

                  <p
                    style={{
                      color: "#8D6E63",
                      fontSize: 14,
                      margin: "0 0 22px",
                    }}
                  >
                    {subtitle}
                  </p>

                  {forgotError && (
                    <div className="error-banner">
                      <span>⚠️</span>
                      {forgotError}
                    </div>
                  )}

                  <form onSubmit={handleForgot}>
                    <div className="input-group">
                      <label className="input-label">อีเมลที่ผูกกับบัญชี</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        placeholder="email@example.com"
                        onChange={(e) => {
                          setForgotEmail(e.target.value);
                          setForgotError("");
                        }}
                        style={iStyle(!!forgotError)}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#FF8C00";
                          e.target.style.boxShadow =
                            "0 0 0 4px rgba(255,140,0,0.1)";
                          e.target.style.background = "white";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = forgotError
                            ? "#E53935"
                            : "#E0D5CF";
                          e.target.style.boxShadow = "none";
                          e.target.style.background = forgotError
                            ? "#FFF5F5"
                            : "#FAFAFA";
                        }}
                      />
                    </div>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? "⏳ กำลังส่ง..." : "📨 ส่งรหัส OTP"}
                    </button>
                  </form>
                </div>
              )}

              {/* ─────────── VIEW: OTP ─────────── */}
              {view === "otp" && (
                <div className="slide-in">
                  <button
                    className="back-link"
                    onClick={() => {
                      setView("forgot");
                      setOtpError("");
                      setOtp(Array(6).fill(""));
                    }}
                  >
                    ← แก้ไขอีเมล
                  </button>

                  {/* Step dots */}
                  <div className="step-dots">
                    <div className="dot done" />
                    <div className="dot active" />
                    <div className="dot" />
                  </div>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#BCAAA4",
                      margin: "4px 0 16px",
                      fontWeight: 500,
                    }}
                  >
                    ขั้นตอนที่ 2 จาก 3
                  </p>

                  <p
                    style={{
                      color: "#8D6E63",
                      fontSize: 13,
                      margin: "0 0 6px",
                      textAlign: "center",
                    }}
                  >
                    ส่ง OTP ไปที่{" "}
                    <span style={{ color: "#FF8C00", fontWeight: 700 }}>
                      {forgotEmail}
                    </span>
                  </p>
                  <p
                    style={{
                      color: "#BCAAA4",
                      fontSize: 12,
                      margin: "0 0 18px",
                      textAlign: "center",
                    }}
                  >
                    รหัสมีอายุ 10 นาที
                  </p>

                  {otpError && (
                    <div className="error-banner">
                      <span>⚠️</span>
                      {otpError}
                    </div>
                  )}

                  <form onSubmit={handleOtpSubmit}>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      hasError={!!otpError}
                    />

                    {/* Resend */}
                    <div style={{ textAlign: "center", margin: "14px 0 20px" }}>
                      <span style={{ color: "#A1887F", fontSize: 13 }}>
                        ไม่ได้รับรหัส?{" "}
                      </span>
                      <button
                        type="button"
                        className="resend-btn"
                        disabled={countdown > 0}
                        style={{ color: countdown > 0 ? "#BCAAA4" : "#FF8C00" }}
                        onClick={handleResend}
                      >
                        {countdown > 0 ? `ส่งใหม่ใน ${countdown}s` : "ส่งใหม่"}
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={otpLoading || otp.join("").length < 6}
                    >
                      {otpLoading ? "⏳ กำลังยืนยัน..." : "ยืนยัน OTP →"}
                    </button>
                  </form>
                </div>
              )}

              {/* ─────────── VIEW: RESET ─────────── */}
              {view === "reset" && (
                <div className="slide-in">
                  {/* Step dots */}
                  <div className="step-dots">
                    <div className="dot done" />
                    <div className="dot done" />
                    <div className="dot active" />
                  </div>
                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 11,
                      color: "#BCAAA4",
                      margin: "4px 0 16px",
                      fontWeight: 500,
                    }}
                  >
                    ขั้นตอนที่ 3 จาก 3
                  </p>

                  <p
                    style={{
                      color: "#8D6E63",
                      fontSize: 14,
                      margin: "0 0 20px",
                      textAlign: "center",
                    }}
                  >
                    {subtitle}
                  </p>

                  {resetError && (
                    <div className="error-banner">
                      <span>⚠️</span>
                      {resetError}
                    </div>
                  )}

                  <form onSubmit={handleReset}>
                    {/* New password */}
                    <div className="input-group">
                      <label className="input-label">รหัสผ่านใหม่</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showNewPass ? "text" : "password"}
                          value={resetForm.password}
                          placeholder="อย่างน้อย 8 ตัวอักษร"
                          style={iStylePw(!!resetError)}
                          onChange={(e) => {
                            setResetForm((p) => ({
                              ...p,
                              password: e.target.value,
                            }));
                            setResetError("");
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#FF8C00";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(255,140,0,0.1)";
                            e.target.style.background = "white";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = resetError
                              ? "#E53935"
                              : "#E0D5CF";
                            e.target.style.boxShadow = "none";
                            e.target.style.background = resetError
                              ? "#FFF5F5"
                              : "#FAFAFA";
                          }}
                        />
                        <button
                          type="button"
                          className="eyebtn"
                          onClick={() => setShowNewPass((p) => !p)}
                        >
                          {showNewPass ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {/* Strength */}
                      {resetForm.password && (
                        <>
                          <div className="strength-bar">
                            {[1, 2, 3, 4].map(n => (
                              <div key={n} className="strength-seg" style={{ background: strength >= n ? STRENGTH_COLOR[strength] : '#E0D5CF' }} />
                            ))}
                          </div>
                          <p
                            style={{
                              fontSize: 11,
                              color: STRENGTH_COLOR[strength],
                              fontWeight: 600,
                              margin: "4px 0 0",
                            }}
                          >
                            ความแข็งแกร่ง: {STRENGTH_LABEL[strength]}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Confirm */}
                    <div className="input-group">
                      <label className="input-label">ยืนยันรหัสผ่านใหม่</label>
                      <div style={{ position: "relative" }}>
                        <input
                          type={showConfirmPass ? "text" : "password"}
                          value={resetForm.confirm}
                          placeholder="กรอกรหัสผ่านอีกครั้ง"
                          style={{
                            ...iStylePw(false),
                            borderColor: resetForm.confirm
                              ? resetForm.confirm === resetForm.password
                                ? "#22c55e"
                                : "#E0D5CF"
                              : "#E0D5CF",
                          }}
                          onChange={(e) => {
                            setResetForm((p) => ({
                              ...p,
                              confirm: e.target.value,
                            }));
                            setResetError("");
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = "#FF8C00";
                            e.target.style.boxShadow =
                              "0 0 0 4px rgba(255,140,0,0.1)";
                            e.target.style.background = "white";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor =
                              resetForm.confirm === resetForm.password &&
                                resetForm.confirm
                                ? "#22c55e"
                                : "#E0D5CF";
                            e.target.style.boxShadow = "none";
                            e.target.style.background = "#FAFAFA";
                          }}
                        />
                        <button
                          type="button"
                          className="eyebtn"
                          onClick={() => setShowConfirmPass((p) => !p)}
                        >
                          {showConfirmPass ? "🙈" : "👁️"}
                        </button>
                      </div>
                      {resetForm.confirm &&
                        resetForm.confirm === resetForm.password && (
                          <p
                            style={{
                              color: "#22c55e",
                              fontSize: 12,
                              margin: "4px 0 0",
                              fontWeight: 600,
                            }}
                          >
                            ✓ รหัสผ่านตรงกัน
                          </p>
                        )}
                    </div>

                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={resetLoading}
                    >
                      {resetLoading
                        ? "⏳ กำลังบันทึก..."
                        : "🔒 บันทึกรหัสผ่านใหม่"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
