import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- หน้าทั่วไป ---
import HomePage from "./pages/HomePage";
import ToursPage from "./pages/ToursPage";
import TourDetailPage from "./pages/TourDetailPage";

// --- ระบบ Auth ---
import LoginPage from "./pages/loginpage"; // เช็คชื่อไฟล์ตัวพิมพ์เล็ก-ใหญ่ด้วยนะครับ
import RegisterPage from "./pages/RegisterPage";

// --- ระบบ Admin ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingPayments from "./pages/admin/PendingPayments";
import TourManager from "./pages/admin/TourManager";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้าบ้าน (ลูกค้าทั่วไป) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetailPage />} />

        {/* ระบบเข้าสู่ระบบ/สมัครสมาชิก */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* หลังบ้าน (Admin) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tours" element={<TourManager />} />
          <Route path="payments" element={<PendingPayments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}