import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import PendingPayments from './pages/admin/PendingPayments';
import TourManager from './pages/admin/TourManager';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* หน้าบ้าน (ลูกค้า) */}
        <Route path="/" element={<HomePage />} />
        
        {/* หลังบ้าน (Admin) - ซ่อนอยู่ใน /admin */}
          <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="tours" element={<TourManager />} />
          <Route path="payments" element={<PendingPayments />} />
        </Route>
    </Routes>
    </BrowserRouter>
  )
}