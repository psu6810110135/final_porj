import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // ✅ import Navbar

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/auth/signin', formData);
      
      const token = response.data.accessToken;
      localStorage.setItem('jwt_token', token);
      
      alert('Login สำเร็จ! 🎉');
      console.log('Token:', token);
      navigate('/');

    } catch (error) {
      console.error(error);
      alert('Login ไม่ผ่าน! เช็คชื่อ/รหัสผ่าน หน่อยนะ ❌');
    }
  };

  return (
    <>
      <Navbar /> {/* ✅ เพิ่ม Navbar */}
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>เข้าสู่ระบบ</h2>
          
          <form onSubmit={handleSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>ชื่อผู้ใช้</label>
              <input 
                type="text" 
                name="username"
                value={formData.username}
                onChange={handleChange}
                style={styles.input}
                placeholder="Username"
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
                placeholder="Password"
                required 
              />
            </div>

            <button type="submit" style={styles.submitButton}>เข้าสู่ระบบ</button>
          </form>

          <p style={styles.orText}>หรือ เข้าสู่ระบบกับ</p>
          
          <div style={styles.socialGroup}>
            <button type="button" style={{...styles.socialBtn, color: '#3b5998', borderColor: '#3b5998'}}>
              Facebook
            </button>
            <button type="button" style={{...styles.socialBtn, color: '#DB4437', borderColor: '#DB4437'}}>
              Google
            </button>
          </div>
          
          <p style={styles.registerText}>
            หากยังไม่มีบัญชี 
            <Link to="/register" style={styles.registerLink}> ลงทะเบียน</Link>
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
    background: 'white', 
    padding: '40px', 
    borderRadius: '16px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
    width: '100%', 
    maxWidth: '400px'
  },
  title: { 
    textAlign: 'center', 
    color: '#5D4037', 
    marginBottom: '24px',
    fontSize: '24px',
    fontWeight: 'bold'
  },
  inputGroup: { 
    marginBottom: '20px' 
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '600'
  },
  input: { 
    width: '100%', 
    padding: '12px', 
    borderRadius: '8px', 
    border: '1px solid #ddd', 
    fontSize: '16px',
    boxSizing: 'border-box'
  },
  submitButton: { 
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#FF8C00', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '16px', 
    fontWeight: 'bold',
    transition: 'background 0.3s'
  },
  orText: {
    textAlign: 'center', 
    margin: '20px 0', 
    color: '#888',
    fontSize: '14px'
  },
  socialGroup: { 
    display: 'flex', 
    gap: '12px', 
    justifyContent: 'center' 
  },
  socialBtn: { 
    flex: 1, 
    padding: '10px', 
    background: 'white', 
    border: '1px solid', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    fontSize: '14px'
  },
  registerText: {
    textAlign: 'center', 
    fontSize: '14px', 
    marginTop: '24px',
    color: '#666'
  },
  registerLink: {
    color: '#FF8C00', 
    cursor: 'pointer',
    fontWeight: 'bold',
    marginLeft: '5px'
  }
};

export default LoginPage;