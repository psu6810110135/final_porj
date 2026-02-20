import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- หน้าทั่วไป ---
import HomePage from "./pages/HomePage";
import ToursPage from "./pages/ToursPage";
import TourDetailPage from "./pages/TourDetailPage";
import PaymentPage from "./pages/PaymentPage";

// --- ระบบ Auth ---
import LoginPage from "./pages/loginpage"; // เช็คชื่อไฟล์ตัวพิมพ์เล็ก-ใหญ่ด้วยนะครับ
import RegisterPage from "./pages/RegisterPage";

// --- ระบบ Admin ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingPayments from "./pages/admin/PendingPayments";
import TourManager from "./pages/admin/TourManager";
import AdminGuard from "./pages/AdminGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- หน้าบ้านทั่วไป --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetailPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />

        {/* --- 🛡️ โซนป้องกันแอดมิน --- */}
        <Route element={<AdminGuard />}> 
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tours" element={<TourManager />} />
            <Route path="payments" element={<PendingPayments />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}