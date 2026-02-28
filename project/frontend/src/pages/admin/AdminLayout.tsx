import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, CreditCard, FileText, Users, LogOut, Home, Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'แดชบอร์ด', path: '/admin' },
    { icon: Map, label: 'จัดการทัวร์', path: '/admin/tours' },
    { icon: Calendar, label: 'ตารางทัวร์', path: '/admin/schedules' },
    { icon: Users, label: 'จัดการผู้ใช้งาน', path: '/admin/users' },
    { icon: CreditCard, label: 'ตรวจสอบการชำระเงิน', path: '/admin/payments' },
    { icon: FileText, label: 'ประวัติการจอง', path: '/admin/bookings' },
  ];

  const handleLogout = () => {
    if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบ?")) {
      localStorage.removeItem('jwt_token');
      navigate('/login');
    }
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#F6F1E9] font-sans overflow-hidden">
      
      {/* ─── Mobile Header ─── */}
      <div className="md:hidden bg-[#4F200D] text-white p-4 flex items-center justify-between z-20 shadow-md">
        <h1 className="text-xl font-extrabold text-[#FFD93D] tracking-wide flex items-center gap-2">
          ThaiTour <span className="text-[10px] font-medium bg-[#FF8400] text-white px-1.5 py-0.5 rounded-md">ผู้ดูแล</span>
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#FFD93D] hover:text-white transition-colors">
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ─── Sidebar Backdrop for Mobile ─── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#4F200D]/40 backdrop-blur-sm z-30 md:hidden" onClick={closeMobileMenu}></div>
      )}
      
      {/* ─── Dark Sidebar ─── */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#4F200D] shadow-xl flex flex-col h-full z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-white/10 hidden md:block">
          <h1 className="text-2xl font-extrabold text-[#FFD93D] tracking-wide flex items-center gap-2">
            ThaiTour <span className="text-xs font-medium bg-[#FF8400] text-white px-2 py-1 rounded-md">ผู้ดูแล</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={closeMobileMenu}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#FF8400] text-white font-semibold shadow-md shadow-[#FF8400]/20' 
                    : 'text-[#F6F1E9]/70 hover:bg-white/10 hover:text-[#FFD93D]'
                }`}>
                  <item.icon size={20} className={isActive ? "text-white" : "opacity-80"} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <Link to="/" onClick={closeMobileMenu}>
            <Button variant="ghost" className="w-full justify-start text-[#F6F1E9]/70 hover:bg-white/10 hover:text-[#FFD93D] transition-colors rounded-xl">
              <Home size={18} className="mr-3 opacity-80" /> กลับหน้าหลัก
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full justify-start text-[#FFD93D]/80 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-xl"
          >
            <LogOut size={18} className="mr-3 opacity-80" /> ออกจากระบบ
          </Button>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto h-full relative">
        <div className="max-w-7xl mx-auto pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}