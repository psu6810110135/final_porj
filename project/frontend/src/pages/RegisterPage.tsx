import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "@/config/api";

/* ─── Types ─────────────────────────────────────── */
interface FormData {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

/* ─── Helpers (outside component = stable reference) ── */
const getStrength = (pw: string): number => {
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

const getInputStyle = (
  hasError: boolean,
  extraBorder?: string,
): React.CSSProperties => ({
  width: "100%",
  padding: "12px 40px 12px 38px",
  borderRadius: 12,
  border: `1.5px solid ${hasError ? "#ef4444" : (extraBorder ?? "#E0D5CF")}`,
  fontSize: 14,
  fontFamily: "Prompt, sans-serif",
  boxSizing: "border-box",
  background: hasError ? "#fff5f5" : "#FAFAFA",
  color: "#3E2723",
  outline: "none",
  transition: "all 0.2s",
});

/* ─── Field Component (outside RegisterPage to prevent remount) ── */
interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  rightSlot?: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  required = false,
  value,
  onChange,
  error,
  rightSlot,
}) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "#4E342E",
        marginBottom: 6,
      }}
    >
      {label}
      {required && <span style={{ color: "#FF8C00", marginLeft: 2 }}>*</span>}
    </label>
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          left: 13,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 15,
          pointerEvents: "none",
          opacity: 0.45,
        }}
      >
        {icon}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={getInputStyle(!!error)}
        onFocus={(e) => {
          e.target.style.borderColor = "#FF8C00";
          e.target.style.boxShadow = "0 0 0 3px rgba(255,140,0,0.12)";
          e.target.style.background = "white";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? "#ef4444" : "#E0D5CF";
          e.target.style.boxShadow = "none";
          e.target.style.background = error ? "#fff5f5" : "#FAFAFA";
        }}
      />
      {rightSlot && (
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {rightSlot}
        </span>
      )}
    </div>
    {error && (
      <p
        style={{
          color: "#ef4444",
          fontSize: 12,
          margin: "4px 0 0",
          fontWeight: 500,
        }}
      >
        {error}
      </p>
    )}
  </div>
);

/* ─── PasswordField Component (outside RegisterPage) ── */
interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  icon: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  show: boolean;
  onToggle: () => void;
  borderColor?: string;
  successMsg?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  placeholder,
  icon,
  value,
  onChange,
  error,
  show,
  onToggle,
  borderColor,
  successMsg,
}) => (
  <div style={{ marginBottom: 14 }}>
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "#4E342E",
        marginBottom: 6,
      }}
    >
      {label} <span style={{ color: "#FF8C00" }}>*</span>
    </label>
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "absolute",
          left: 13,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 15,
          pointerEvents: "none",
          opacity: 0.45,
        }}
      >
        {icon}
      </span>
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          ...getInputStyle(!!error, borderColor),
          paddingRight: 40,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#FF8C00";
          e.target.style.boxShadow = "0 0 0 3px rgba(255,140,0,0.12)";
          e.target.style.background = "white";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error
            ? "#ef4444"
            : (borderColor ?? "#E0D5CF");
          e.target.style.boxShadow = "none";
          e.target.style.background = error ? "#fff5f5" : "#FAFAFA";
        }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{
          position: "absolute",
          right: 12,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          opacity: 0.4,
          fontSize: 16,
          lineHeight: 1,
          padding: 0,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.4")}
      >
        {show ? "🙈" : "👁️"}
      </button>
    </div>
    {error && (
      <p
        style={{
          color: "#ef4444",
          fontSize: 12,
          margin: "4px 0 0",
          fontWeight: 500,
        }}
      >
        {error}
      </p>
    )}
    {successMsg && !error && (
      <p
        style={{
          color: "#22c55e",
          fontSize: 12,
          margin: "4px 0 0",
          fontWeight: 600,
        }}
      >
        {successMsg}
      </p>
    )}
  </div>
);

/* ─── Main Component ─────────────────────────────── */
const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [banner, setBanner] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const strength = getStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const e: Partial<FormData> = {};
    if (!formData.firstName.trim()) e.firstName = 'กรุณากรอกชื่อ';
    if (!formData.lastName.trim()) e.lastName = 'กรุณากรอกนามสกุล';
    if (!formData.username.trim()) e.username = 'กรุณากรอกชื่อผู้ใช้';
    else if (formData.username.trim().length < 4) e.username = 'ชื่อผู้ใช้ต้องมีอย่างน้อย 4 ตัวอักษร';
    if (!formData.email.trim()) e.email = 'กรุณากรอกอีเมล';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'รูปแบบอีเมลไม่ถูกต้อง';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Partial<FormData> = {};
    if (formData.password.length < 8)
      e.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setErrors({});
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setLoading(true);
    setBanner(null);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        username: formData.username,
        email: formData.email,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        password: formData.password,
        profile: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber || undefined, // undefined แทน null เพื่อกัน 400 error จาก validation pipe
        },
      });
      setBanner({
        type: "success",
        msg: "สมัครสมาชิกสำเร็จ! 🎉 กำลังพาไปหน้าเข้าสู่ระบบ...",
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.message;

      if (status === 409) {
        setStep(1);
        setErrors({ username: "ชื่อผู้ใช้หรืออีเมลนี้มีคนใช้แล้ว", email: "ชื่อผู้ใช้หรืออีเมลนี้มีคนใช้แล้ว" });
        setBanner({ type: "error", msg: "ชื่อผู้ใช้หรืออีเมลนี้มีคนใช้แล้ว" });
      } else if (status === 400) {
        // ดึง Error 400 จาก class-validator ของ NestJS ออกมาแสดงผล
        const errorMsg = Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
        setBanner({
          type: "error",
          msg: `ตรวจสอบข้อมูล: ${errorMsg}`,
        });
      } else {
        setBanner({
          type: "error",
          msg: "ระบบขัดข้อง หรือไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmBorderColor = errors.confirmPassword
    ? "#ef4444"
    : formData.confirmPassword && formData.confirmPassword === formData.password
      ? "#22c55e"
      : "#E0D5CF";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap');
        .reg-page * { font-family: 'Prompt', sans-serif; box-sizing: border-box; }
        .reg-wrap {
          min-height: calc(100vh - 64px);
          background: linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 45%, #FFE0B2 100%);
          display: flex; align-items: center; justify-content: center;
          padding: 32px 16px; position: relative; overflow: hidden;
        }
        .reg-wrap::before {
          content: ''; position: absolute; top: -120px; right: -120px;
          width: 450px; height: 450px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
        }
        .reg-wrap::after {
          content: ''; position: absolute; bottom: -80px; left: -80px;
          width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(93,64,55,0.07) 0%, transparent 70%);
        }
        .reg-card {
          background: white; border-radius: 28px; width: 100%; max-width: 460px;
          position: relative; z-index: 1; border: 1px solid rgba(255,140,0,0.1);
          box-shadow: 0 24px 64px rgba(93,64,55,0.13), 0 4px 16px rgba(255,140,0,0.07);
          overflow: hidden;
        }
        .reg-header {
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          padding: 26px 36px 22px; position: relative;
        }
        .reg-header::after {
          content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
          height: 20px; background: white; border-radius: 20px 20px 0 0;
        }
        .reg-body { padding: 16px 36px 32px; }
        .step-track { display: flex; gap: 6px; justify-content: center; margin-bottom: 6px; }
        .step-seg { height: 5px; border-radius: 3px; transition: all 0.35s ease; }
        .step-done { background: #FF8C00; width: 40px; }
        .step-active { background: #FF8C00; width: 40px; box-shadow: 0 0 8px rgba(255,140,0,0.5); }
        .step-idle { background: #E0D5CF; width: 24px; }
        .submit-btn {
          width: 100%; padding: 14px; background: linear-gradient(135deg, #FF8C00, #FF6B00);
          color: white; border: none; border-radius: 12px; cursor: pointer;
          font-size: 15px; font-weight: 700; font-family: 'Prompt', sans-serif;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(255,140,0,0.4);
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 22px rgba(255,140,0,0.5); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .back-btn {
          padding: 14px 20px; background: white; border: 1.5px solid #E0D5CF;
          color: #8D6E63; border-radius: 12px; cursor: pointer; font-size: 14px;
          font-weight: 600; font-family: 'Prompt', sans-serif; transition: all 0.2s; white-space: nowrap;
        }
        .back-btn:hover { border-color: #FF8C00; color: #FF8C00; background: #FFF8F0; }
        .google-btn {
          width: 100%; padding: 12px; background: white; border: 1.5px solid #E0D5CF;
          border-radius: 12px; cursor: pointer; font-size: 14px; font-weight: 600;
          font-family: 'Prompt', sans-serif; color: #4E342E; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 10px;
        }
        .google-btn:hover { border-color: #FF8C00; background: #FFF8F0; }
        .banner {
          padding: 11px 14px; border-radius: 12px; font-size: 13px; font-weight: 600;
          margin-bottom: 14px; display: flex; align-items: center; gap: 8px;
        }
        .banner-success { background: #f0fdf4; border: 1.5px solid #86efac; color: #16a34a; }
        .banner-error   { background: #fff5f5; border: 1.5px solid #fca5a5; color: #dc2626; }
        .summary-box {
          background: #FFF8F0; border: 1.5px solid rgba(255,140,0,0.2);
          border-radius: 14px; padding: 14px 16px; margin-bottom: 18px;
        }
        .strength-bar { display: flex; gap: 3px; margin-top: 5px; }
        .strength-seg { height: 4px; flex: 1; border-radius: 2px; transition: background 0.3s; }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slideDown 0.22s ease; }
      `}</style>

      <Navbar />
      <div className="reg-page">
        <div className="reg-wrap">
          <div className="reg-card">
            {/* Header */}
            <div className="reg-header">
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
                    width: 44,
                    height: 44,
                    background: "rgba(255,255,255,0.22)",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  🧭
                </div>
                <div>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.72)",
                      fontSize: 12,
                      fontWeight: 500,
                      margin: 0,
                    }}
                  >
                    เริ่มต้นการเดินทาง
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
                    สร้างบัญชีใหม่
                  </h2>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="reg-body">
              {/* Step dots */}
              <div className="step-track">
                <div
                  className={`step-seg ${step >= 1 ? "step-done" : "step-idle"}`}
                />
                <div
                  className={`step-seg ${step === 2 ? "step-active" : "step-idle"}`}
                />
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "#BCAAA4",
                  marginBottom: 18,
                  fontWeight: 500,
                }}
              >
                {step === 1
                  ? "ขั้นตอนที่ 1 จาก 2 — ข้อมูลส่วนตัว"
                  : "ขั้นตอนที่ 2 จาก 2 — ตั้งรหัสผ่าน"}
              </p>

              {/* Banner */}
              {banner && (
                <div
                  className={`banner ${banner.type === "success" ? "banner-success" : "banner-error"} slide-in`}
                >
                  <span>{banner.type === "success" ? "✅" : "❌"}</span>
                  {banner.msg}
                </div>
              )}

              {/* ── Step 1 ── */}
              {step === 1 && (
                <div className="slide-in">
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0 12px",
                    }}
                  >
                    <Field
                      label="ชื่อ"
                      name="firstName"
                      placeholder="ชาญชัย"
                      icon="👤"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                    />
                    <Field
                      label="นามสกุล"
                      name="lastName"
                      placeholder="ใจดี"
                      icon="👤"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                    />
                  </div>
                  <Field label="ชื่อผู้ใช้" name="username" placeholder="เช่น chaichai99" icon="🪪" required value={formData.username} onChange={handleChange} error={errors.username} />
                  <Field label="อีเมล" name="email" type="email" placeholder="email@example.com" icon="✉️" required value={formData.email} onChange={handleChange} error={errors.email} />
                  <Field label="เบอร์โทรศัพท์" name="phoneNumber" type="tel" placeholder="08X-XXX-XXXX (ไม่จำเป็น)" icon="📱" value={formData.phoneNumber} onChange={handleChange} />

                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleNext}
                    style={{ marginTop: 6, marginBottom: 18 }}
                  >
                    ถัดไป →
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{ flex: 1, height: 1, background: "#EDE0D8" }}
                    />
                    <span style={{ color: "#BCAAA4", fontSize: 12 }}>หรือ</span>
                    <div
                      style={{ flex: 1, height: 1, background: "#EDE0D8" }}
                    />
                  </div>

                  <button
                    type="button"
                    className="google-btn"
                    onClick={() => {
                      window.location.href = `${API_BASE_URL}/api/auth/google`;
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    ลงทะเบียนด้วย Google
                  </button>

                  <p
                    style={{
                      textAlign: "center",
                      fontSize: 13,
                      marginTop: 16,
                      color: "#8D6E63",
                    }}
                  >
                    มีบัญชีอยู่แล้ว?
                    <Link
                      to="/login"
                      style={{
                        color: "#FF8C00",
                        fontWeight: 700,
                        marginLeft: 5,
                        textDecoration: "none",
                      }}
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </p>
                </div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <form onSubmit={handleSubmit} noValidate className="slide-in">
                  <PasswordField
                    label="รหัสผ่าน"
                    name="password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    icon="🔒"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    show={showPass}
                    onToggle={() => setShowPass((p) => !p)}
                  />

                  {/* Strength bar */}
                  {formData.password && (
                    <div style={{ marginBottom: 16, marginTop: -8 }}>
                      <div className="strength-bar">
                        {[1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="strength-seg"
                            style={{
                              background:
                                strength >= n
                                  ? STRENGTH_COLOR[strength]
                                  : "#E0D5CF",
                            }}
                          />
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
                    </div>
                  )}

                  <PasswordField
                    label="ยืนยันรหัสผ่าน"
                    name="confirmPassword"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    icon="🔑"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    show={showConfirm}
                    onToggle={() => setShowConfirm((p) => !p)}
                    borderColor={confirmBorderColor}
                    successMsg={
                      !errors.confirmPassword &&
                        formData.confirmPassword &&
                        formData.confirmPassword === formData.password
                        ? "✓ รหัสผ่านตรงกัน"
                        : undefined
                    }
                  />

                  {/* Summary */}
                  <div className="summary-box">
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#FF8C00",
                        marginBottom: 10,
                      }}
                    >
                      📋 ข้อมูลที่จะลงทะเบียน
                    </p>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px 16px",
                      }}
                    >
                      {(
                        [
                          [
                            "ชื่อ-นามสกุล",
                            `${formData.firstName} ${formData.lastName}`,
                          ],
                          ["ชื่อผู้ใช้", formData.username],
                          ["อีเมล", formData.email],
                          ["เบอร์โทร", formData.phoneNumber || "—"],
                        ] as [string, string][]
                      ).map(([k, v]) => (
                        <div key={k}>
                          <p
                            style={{
                              fontSize: 11,
                              color: "#A1887F",
                              margin: 0,
                            }}
                          >
                            {k}
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#4E342E",
                              margin: 0,
                              wordBreak: "break-all",
                            }}
                          >
                            {v}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className="back-btn"
                      onClick={() => {
                        setStep(1);
                        setErrors({});
                      }}
                    >
                      ← กลับ
                    </button>
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={loading}
                      style={{ flex: 1 }}
                    >
                      {loading ? "⏳ กำลังสมัคร..." : "🎉 สมัครสมาชิก"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
