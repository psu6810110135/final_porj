import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const EmailConflictPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || 'ไม่ทราบอีเมล';

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800&display=swap');

        .conflict-page * {
          font-family: 'Prompt', sans-serif;
          box-sizing: border-box;
        }

        .conflict-bg {
          min-height: calc(100vh - 64px);
          background: linear-gradient(135deg, #FFF8F0 0%, #FFF3E0 40%, #FFE0B2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .conflict-bg::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(255,140,0,0.12) 0%, transparent 70%);
        }

        .conflict-bg::after {
          content: '';
          position: absolute;
          bottom: -100px;
          left: -100px;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          pointer-events: none;
          background: radial-gradient(circle, rgba(93,64,55,0.08) 0%, transparent 70%);
        }

        .conflict-card {
          background: white;
          border-radius: 28px;
          width: 100%;
          max-width: 480px;
          position: relative;
          z-index: 1;
          border: 1px solid rgba(255,140,0,0.1);
          box-shadow:
            0 24px 64px rgba(93,64,55,0.14),
            0 6px 20px rgba(255,140,0,0.08);
          overflow: hidden;
          animation: cardPopIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes cardPopIn {
          from { opacity: 0; transform: translateY(24px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .conflict-top {
          background: linear-gradient(135deg, #FF8C00, #FF5722);
          padding: 36px 32px 32px;
          text-align: center;
          position: relative;
        }

        .conflict-top::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 24px;
          background: white;
          border-radius: 24px 24px 0 0;
        }

        .conflict-icon-wrapper {
          width: 80px;
          height: 80px;
          margin: 0 auto 18px;
          background: rgba(255,255,255,0.18);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 12px rgba(255,255,255,0.08);
          animation: iconPulse 2s ease-in-out infinite;
        }

        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 0 12px rgba(255,255,255,0.08); }
          50% { box-shadow: 0 0 0 18px rgba(255,255,255,0.04); }
        }

        .conflict-icon-wrapper span {
          font-size: 36px;
        }

        .conflict-title {
          color: white;
          font-size: 21px;
          font-weight: 800;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }

        .conflict-subtitle {
          color: rgba(255,255,255,0.85);
          font-size: 13.5px;
          margin: 0;
          line-height: 1.6;
          font-weight: 400;
        }

        .conflict-body {
          padding: 20px 32px 36px;
        }

        /* Email badge */
        .email-badge {
          display: flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #FFF8F0, #FFF3E0);
          border: 1.5px solid #FFE0B2;
          border-radius: 16px;
          padding: 14px 18px;
          margin-bottom: 22px;
        }

        .email-icon-circle {
          width: 40px;
          height: 40px;
          min-width: 40px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 3px 10px rgba(255,140,0,0.3);
        }

        .email-text-wrap {
          overflow: hidden;
        }

        .email-label {
          font-size: 11px;
          color: #A1887F;
          font-weight: 600;
          margin: 0 0 2px;
        }

        .email-value {
          font-size: 14px;
          color: #E65100;
          font-weight: 700;
          margin: 0;
          word-break: break-all;
        }

        /* Steps */
        .conflict-info-title {
          font-size: 14px;
          font-weight: 700;
          color: #5D4037;
          margin: 0 0 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .conflict-option {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px 18px;
          border-radius: 16px;
          margin-bottom: 10px;
          border: 1.5px solid #F0E8E0;
          background: #FAFAFA;
          transition: all 0.2s;
          cursor: default;
        }

        .conflict-option:hover {
          background: #FFF8F0;
          border-color: #FFE0B2;
        }

        .option-num {
          width: 28px;
          height: 28px;
          min-width: 28px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          border-radius: 50%;
          color: white;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
          box-shadow: 0 2px 6px rgba(255,140,0,0.3);
        }

        .option-content {
          font-size: 13.5px;
          color: #4E342E;
          line-height: 1.55;
          font-weight: 500;
        }

        .option-content b {
          color: #E65100;
          font-weight: 700;
        }

        /* Buttons */
        .conflict-actions {
          margin-top: 22px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-primary {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #FF8C00, #FF6B00);
          color: white;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-size: 15.5px;
          font-weight: 700;
          font-family: 'Prompt', sans-serif;
          transition: all 0.2s;
          letter-spacing: 0.2px;
          box-shadow: 0 5px 18px rgba(255,140,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 24px rgba(255,140,0,0.5);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-secondary {
          width: 100%;
          padding: 14px;
          background: white;
          color: #6D4C41;
          border: 1.5px solid #E0D5CF;
          border-radius: 14px;
          cursor: pointer;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Prompt', sans-serif;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-secondary:hover {
          border-color: #FF8C00;
          color: #FF8C00;
          background: #FFF8F0;
        }

        .btn-outline {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: #A1887F;
          border: 1.5px solid #E0D5CF;
          border-radius: 14px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'Prompt', sans-serif;
          transition: all 0.2s;
        }

        .btn-outline:hover {
          border-color: #A1887F;
          color: #6D4C41;
          background: #FAFAFA;
        }

        /* Divider */
        .divider-line {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .divider-line::before,
        .divider-line::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #EDE0D8;
        }

        .divider-line span {
          color: #BCAAA4;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }
      `}</style>

            <Navbar />
            <div className="conflict-page">
                <div className="conflict-bg">
                    <div className="conflict-card">

                        {/* ── Top Banner ── */}
                        <div className="conflict-top">
                            <div className="conflict-icon-wrapper">
                                <span>⚠️</span>
                            </div>
                            <h1 className="conflict-title">อีเมลนี้มีบัญชีอยู่แล้ว!</h1>
                            <p className="conflict-subtitle">
                                อีเมลที่คุณใช้ Google Login ถูกลงทะเบียนด้วย<br />
                                รหัสผ่านปกติไว้แล้ว ไม่สามารถเข้าสู่ระบบด้วย Google ได้โดยตรง
                            </p>
                        </div>

                        {/* ── Body ── */}
                        <div className="conflict-body">

                            {/* Email Badge */}
                            <div className="email-badge">
                                <div className="email-icon-circle">
                                    <span style={{ color: 'white', fontSize: 18 }}>✉️</span>
                                </div>
                                <div className="email-text-wrap">
                                    <p className="email-label">อีเมลที่ซ้ำกัน</p>
                                    <p className="email-value">{email}</p>
                                </div>
                            </div>

                            {/* Options */}
                            <p className="conflict-info-title">
                                📋 วิธีแก้ไขปัญหา
                            </p>

                            <div className="conflict-option">
                                <div className="option-num">1</div>
                                <div className="option-content">
                                    ถ้า<b>จำรหัสผ่านได้</b> — กลับไป<b>หน้าเข้าสู่ระบบ</b>แล้วกรอก
                                    Username หรือ Email พร้อมรหัสผ่านที่ตั้งไว้ตอนลงทะเบียน
                                </div>
                            </div>

                            <div className="conflict-option">
                                <div className="option-num">2</div>
                                <div className="option-content">
                                    ถ้า<b>ลืมรหัสผ่าน</b> — กดปุ่ม "ลืมรหัสผ่าน" ด้านล่าง
                                    ระบบจะส่ง OTP ไปยังอีเมล <b>{email}</b> เพื่อรีเซ็ตรหัสผ่านใหม่
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="conflict-actions">
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate('/login')}
                                >
                                    🔐 เข้าสู่ระบบด้วยรหัสผ่าน
                                </button>

                                <div className="divider-line">
                                    <span>หรือ</span>
                                </div>

                                <button
                                    className="btn-secondary"
                                    onClick={() => navigate('/login', { state: { openForgot: true, email } })}
                                >
                                    🔑 ลืมรหัสผ่าน — ไปรีเซ็ตรหัสผ่าน
                                </button>

                                <button
                                    className="btn-outline"
                                    onClick={() => navigate('/')}
                                >
                                    ← กลับหน้าหลัก
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default EmailConflictPage;
