import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";

// --- ➕ เพิ่มไอคอน Dashboard สำหรับ Admin ---
const DashboardIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 4h6v8h-6z" /><path d="M4 16h6v4h-6z" />
    <path d="M14 12h6v8h-6z" /><path d="M14 4h6v5h-6z" />
  </svg>
);

const LogoutIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </svg>
);

const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const ShoppingCartIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

interface NavbarProps {
  activePage?: "home" | "tours" | "about" | "contact";
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwt_token');
  const isLoggedIn = !!token;
  
  // --- 🛡️ เช็คว่าเป็น Admin หรือไม่ ---
  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      isAdmin = payload.role === 'admin'; //
    } catch (e) {
      console.error("Token error");
    }
  }

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบใช่ไหม?")) {
      localStorage.removeItem('jwt_token');
      navigate('/login');
    }
  };

  const linkClass = (page: string) =>
    activePage === page
      ? "font-bold text-lg md:text-xl text-[#FF8400]"
      : "font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 md:px-8">
        <div className="flex items-center h-16 md:h-24">
          {/* Logo */}
          <div className="flex-1 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <div className="relative h-10 md:h-16">
                <img src={logoImage} alt="Thai Tours Logo" className="h-full w-auto object-contain" />
              </div>
              <span className="text-lg md:text-xl font-bold text-[#4F200D] hidden sm:block">
                Thai Tours Service
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/" className={linkClass("home")}>Home</Link>
            <Link to="/tours" className={linkClass("tours")}>Tours</Link>
            <Link to="/about" className={linkClass("about")}>About Us</Link>
            <Link to="/contact" className={linkClass("contact")}>Contact</Link>
          </div>

          {/* Cart & User Icons */}
          <div className="flex-1 flex items-center justify-end gap-3">
            
            {/* --- 🔑 ปุ่ม Admin Dashboard (โชว์เฉพาะ Admin และอยู่ก่อนตะกร้า) --- */}
            {isAdmin && (
              <Link to="/admin">
                <button 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#FF8400]/20 bg-[#FF8400]/5 hover:bg-[#FF8400]/20 flex items-center justify-center p-0 transition-colors"
                  title="Admin Dashboard"
                >
                  <DashboardIcon className="w-4 h-4 md:w-5 md:h-5 text-[#FF8400]" />
                </button>
              </Link>
            )}

            <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-[#FF8400]/10 flex items-center justify-center p-0 transition-colors">
              <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
            </button>

            {isLoggedIn ? (
              <button 
                onClick={handleLogout}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-red-50 flex items-center justify-center p-0 transition-colors"
                title="Logout"
              >
                <LogoutIcon className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
              </button>
            ) : (
              <Link to="/login">
                <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-[#FF8400]/10 flex items-center justify-center p-0 transition-colors">
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}