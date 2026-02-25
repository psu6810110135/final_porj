import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Map, CreditCard, FileText, Users, LogOut, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Map, label: 'Manage Tours', path: '/admin/tours' },
    { icon: Users, label: 'Manage Users', path: '/admin/users' },
    { icon: CreditCard, label: 'Verify Payments', path: '/admin/payments' },
    { icon: FileText, label: 'Booking History', path: '/admin/bookings' },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('jwt_token');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen bg-[#F6F1E9] font-sans overflow-hidden">
      
      {/* Dark Sidebar */}
      <aside className="w-64 bg-[#4F200D] shadow-xl flex flex-col h-full z-20 relative">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-extrabold text-[#FFD93D] tracking-wide flex items-center gap-2">
            ThaiTour <span className="text-xs font-medium bg-[#FF8400] text-white px-2 py-1 rounded-md">Admin</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
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
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-[#F6F1E9]/70 hover:bg-white/10 hover:text-[#FFD93D] transition-colors rounded-xl">
              <Home size={18} className="mr-3 opacity-80" /> Back to Home
            </Button>
          </Link>

          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full justify-start text-[#FFD93D]/80 hover:bg-red-500/20 hover:text-red-400 transition-colors rounded-xl"
          >
            <LogOut size={18} className="mr-3 opacity-80" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto h-screen relative">
        <div className="max-w-7xl mx-auto pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}