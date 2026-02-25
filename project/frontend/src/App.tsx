import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- หน้าทั่วไป ---
import HomePage from "./pages/HomePage";
import ToursPage from "./pages/ToursPage";
import TourDetailPage from "./pages/TourDetailPage";

// --- ระบบ Auth ---
import LoginPage from "./pages/loginpage"; 
import RegisterPage from "./pages/RegisterPage";

// --- ระบบ Admin ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingPayments from "./pages/admin/PendingPayments";
import TourManager from "./pages/admin/TourManager";
import UserManager from "./pages/admin/UserManager"; 
import BookingHistory from "./pages/admin/BookingHistory"; // 👈 1. เพิ่ม Import หน้านี้
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

        {/* --- 🛡️ โซนป้องกันแอดมิน --- */}
        <Route element={<AdminGuard />}> 
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tours" element={<TourManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="payments" element={<PendingPayments />} />
            <Route path="bookings" element={<BookingHistory />} /> {/* 👈 2. เพิ่ม Route หน้านี้ */}
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}