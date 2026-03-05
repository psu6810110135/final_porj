import { BrowserRouter, Routes, Route } from "react-router-dom";

// --- หน้าทั่วไป ---
import HomePage from "./pages/HomePage";
import ToursPage from "./pages/ToursPage";
import TourDetailPage from "./pages/TourDetailPage";
import PaymentPage from "./pages/PaymentPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import AboutUsPage from "./pages/AboutUsPage";

// --- ระบบ Auth ---
import LoginPage from "./pages/loginpage";
import RegisterPage from "./pages/RegisterPage";
import LoginSuccess from "./pages/LoginSuccess";

// --- ระบบ Admin ---
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TourManager from "./pages/admin/TourManager";
import TourScheduleManager from "./pages/admin/TourScheduleManager";
import UserManager from "./pages/admin/UserManager";
import BookingHistory from "./pages/admin/BookingHistory";
import TicketManager from "./pages/admin/TicketManager"; // 👈 นำเข้า TicketManager
import AdminGuard from "./pages/AdminGuard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- หน้าบ้านทั่วไป --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/tours" element={<ToursPage />} />
        <Route path="/tours/:id" element={<TourDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/login/success" element={<LoginSuccess />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/booking-history" element={<BookingHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        
        {/* --- 🛡️ โซนป้องกันแอดมิน --- */}
        <Route element={<AdminGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tours" element={<TourManager />} />
            <Route path="schedules" element={<TourScheduleManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="tickets" element={<TicketManager />} /> {/* 👈 เพิ่ม Route Tickets */}
            <Route path="bookings" element={<BookingHistory />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}