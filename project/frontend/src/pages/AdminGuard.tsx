import { Navigate, Outlet } from 'react-router-dom';

const AdminGuard = () => {
  const token = localStorage.getItem('jwt_token');

  // 1. ถ้าไม่มี Token เลย ให้ไล่ไปหน้า Login
  if (!token) {
    alert('กรุณาเข้าสู่ระบบก่อนครับ 🛡️');
    return <Navigate to="/login" replace />;
  }

  try {
    // 2. แกะข้อมูลจาก Token (JWT) เพื่อดู Role
    // เราใช้ท่า decode base64 แบบง่ายๆ ไม่ต้องลง library เพิ่มครับ
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payloadBase64));

    // 3. เช็คว่าเป็น Admin หรือไม่ (อิงตามที่เราแก้ใน AuthService คราวก่อน)
    if (decodedPayload.role === 'admin') {
      return <Outlet />; // ให้ผ่านไปเล่นหน้าลูกได้
    } else {
      alert('เฉพาะ Admin เท่านั้นที่เข้าหน้านี้ได้นะจ๊ะ! ❌');
      return <Navigate to="/" replace />;
    }
  } catch (error) {
    console.error('Token เถื่อนหรือพัง:', error);
    return <Navigate to="/login" replace />;
  }
};

export default AdminGuard;