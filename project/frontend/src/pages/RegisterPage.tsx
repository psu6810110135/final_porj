import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // ✅ import Navbar

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกันครับ กรุณาเช็คอีกรอบ ❌');
      return;
    }

    try {
      await axios.post('http://localhost:3000/auth/signup', {
        username: formData.username,
        password: formData.password
      });
      
      alert('สมัครสมาชิกสำเร็จ! 🎉 กรุณาเข้าสู่ระบบ');
      navigate('/login'); 

    } catch (error: any) {
      console.error(error);
      if (error.response && error.response.status === 409) {
        alert('ชื่อผู้ใช้นี้มีคนใช้แล้วครับ ลองเปลี่ยนชื่อดูนะ 😅');
      } else {
        alert('เกิดข้อผิดพลาดในการสมัครสมาชิก ❌');
      }
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ เพิ่ม Navbar */}
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>ลงทะเบียน</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>ชื่อผู้ใช้</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                required 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>รหัสผ่าน</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={styles.input}
                placeholder="รหัสผ่าน (ขั้นต่ำ 8 ตัว)"
                required 
                minLength={8}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>ยืนยันรหัสผ่าน</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={styles.input}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                required 
              />
            </div>

            <button type="submit" style={styles.submitButton}>สมัครสมาชิก</button>
          </form>
          
          <p style={styles.loginText}>
            มีบัญชีอยู่แล้ว? 
            <Link to="/login" style={styles.loginLink}> เข้าสู่ระบบ</Link>
          </p>
        </div>
      </div>
    </>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: 'calc(100vh - 64px)', // ✅ ลบความสูง Navbar ออก ไม่ให้ล้น
    backgroundColor: '#f5f5f5', 
    fontFamily: "'Prompt', sans-serif" 
  },
  card: { 
    background: 'white', padding: '40px', borderRadius: '16px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' 
  },
  title: { 
    textAlign: 'center', color: '#5D4037', marginBottom: '24px', 
    fontSize: '24px', fontWeight: 'bold' 
  },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600' },
  input: { 
    width: '100%', padding: '12px', borderRadius: '8px', 
    border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box' 
  },
  submitButton: { 
    width: '100%', padding: '14px', backgroundColor: '#FF8C00', color: 'white', 
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', 
    fontWeight: 'bold', transition: 'background 0.3s' 
  },
  loginText: { textAlign: 'center', fontSize: '14px', marginTop: '24px', color: '#666' },
  loginLink: { color: '#FF8C00', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px', textDecoration: 'none' }
};

export default RegisterPage;