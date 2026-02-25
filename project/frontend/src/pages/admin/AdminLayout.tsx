import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  CreditCard,
  FileText,
  LogOut,
  Home,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Map, label: "Manage Tours", path: "/admin/tours" },
    { icon: Calendar, label: "Tour Schedules", path: "/admin/schedules" },
    { icon: CreditCard, label: "Verify Payments", path: "/admin/payments" },
    { icon: FileText, label: "Booking History", path: "/admin/bookings" },
  ];

  // 👈 ฟังก์ชันออกจากระบบ (แถมให้!)
  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่ไหม?")) {
      localStorage.removeItem("jwt_token");
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col fixed h-full z-10">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">
            ThaiTour <span className="text-sm text-gray-500">Admin</span>
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* 🌟 โซนปุ่มด้านล่างที่เพิ่มปุ่ม Home เข้าไป */}
        <div className="p-4 border-t flex flex-col gap-2">
          {/* ปุ่มกลับหน้า Home */}
          <Link to="/">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
            >
              <Home size={18} className="mr-2" /> Back to Home
            </Button>
          </Link>

          {/* ปุ่ม Logout ที่ใส่ฟังก์ชันคลิกให้แล้ว */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-auto h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
