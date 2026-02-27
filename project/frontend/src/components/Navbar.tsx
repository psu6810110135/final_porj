import { Link, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";
import { useState, useEffect, useRef } from "react";

// ─── Icons ───────────────────────────────────────────────────────────────────

const HomeIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
    <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6" />
  </svg>
);

const CompassIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="12" r="9" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const ShoppingCartIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const LogoutIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
    <path d="M9 12h12l-3 -3" />
    <path d="M18 15l3 -3" />
  </svg>
);

const DashboardIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 4h6v8h-6z" />
    <path d="M4 16h6v4h-6z" />
    <path d="M14 12h6v8h-6z" />
    <path d="M14 4h6v5h-6z" />
  </svg>
);

const InfoIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8l.01 0" />
    <path d="M11 12l1 0l0 4l1 0" />
  </svg>
);

const PhoneIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
  </svg>
);

const CalendarIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

interface NavbarProps {
  activePage?: "home" | "tours" | "about" | "contact";
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [atTop, setAtTop] = useState(true);
  const lastScrollY = useRef(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const isAtTop = currentY < 10;
      const scrollingUp = currentY < lastScrollY.current;
      const scrollingDown = currentY > lastScrollY.current;
      const scrollDelta = Math.abs(currentY - lastScrollY.current);

      setAtTop(isAtTop);

      // Only trigger hide/show after meaningful scroll (avoid micro-jitter)
      if (scrollDelta > 4) {
        if (isAtTop || scrollingUp) {
          setVisible(true);
        } else if (scrollingDown && currentY > 80) {
          setVisible(false);
          setMenuOpen(false); // close dropdown when hiding
        }
        lastScrollY.current = currentY;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const token = localStorage.getItem("jwt_token");
  const isLoggedIn = !!token;

  let isAdmin = false;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      isAdmin = payload.role === "admin";
    } catch (e) {
      console.error("Token error");
    }
  }

  const handleLogout = () => {
    setMenuOpen(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("jwt_token");
    setShowLogoutModal(false);
    navigate("/login");
  };

  // Desktop link style
  const linkClass = (page: string) =>
    activePage === page
      ? "font-bold text-lg md:text-xl text-[#FF8400]"
      : "font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors";

  // Mobile top icon button style
  const mobileIconBtn = (active = false) =>
    `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-xl transition-all duration-200 ${
      active ? "text-[#FF8400]" : "text-[#6B4226] hover:text-[#FF8400]"
    }`;

  const iconBtnBase =
    "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center p-0 transition-all duration-200 border border-[#F0E8E0]";

  return (
    <>
      <style>{`
        .nav-shadow { box-shadow: 0 2px 16px rgba(79,32,13,0.09); }
        .backdrop-blur-nav {
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        /* Push page content below fixed navbar */
        body { padding-top: 64px; }
        @media (min-width: 768px) { body { padding-top: 96px; } }
        .dropdown-enter {
          animation: dropDown 0.2s ease forwards;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .mobile-nav-label {
          font-size: 10px;
          font-weight: 600;
          line-height: 1;
          font-family: 'Prompt', sans-serif;
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-nav transition-transform duration-300 ease-in-out ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${atTop ? "" : "nav-shadow"}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="flex items-center h-16 md:h-24">
            {/* ── Logo (left) ── */}
            <div className="flex-1 flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <div className="relative h-10 md:h-16">
                  <img
                    src={logoImage}
                    alt="Thai Tours Logo"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <span className="text-base md:text-xl font-bold text-[#4F200D] hidden sm:block tracking-wide">
                  Thai Tours Service
                </span>
              </Link>
            </div>

            {/* ── Center: Desktop nav / Mobile All 4 icons ── */}
            <div className="flex-none flex items-center justify-center">
              {/* Desktop: icons + text */}
              <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {[
                  { to: "/", label: "หน้าหลัก", key: "home", Icon: HomeIcon },
                  {
                    to: "/tours",
                    label: "ทัวร์",
                    key: "tours",
                    Icon: CompassIcon,
                  },
                  {
                    to: "/about",
                    label: "เกี่ยวกับเรา",
                    key: "about",
                    Icon: InfoIcon,
                  },
                  {
                    to: "/contact",
                    label: "ติดต่อเรา",
                    key: "contact",
                    Icon: PhoneIcon,
                  },
                ].map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    className={`flex items-center gap-1.5 ${linkClass(item.key)}`}
                  >
                    <item.Icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
              {/* Mobile: All 4 nav icons centered */}
              <div className="flex md:hidden items-center gap-1">
                <Link to="/" className={mobileIconBtn(activePage === "home")}>
                  <HomeIcon className="w-5 h-5" />
                  <span className="mobile-nav-label">หน้าหลัก</span>
                </Link>
                <Link
                  to="/tours"
                  className={mobileIconBtn(activePage === "tours")}
                >
                  <CompassIcon className="w-5 h-5" />
                  <span className="mobile-nav-label">ทัวร์</span>
                </Link>
                <Link
                  to="/about"
                  className={mobileIconBtn(activePage === "about")}
                >
                  <InfoIcon className="w-5 h-5" />
                  <span className="mobile-nav-label">เกี่ยวกับ</span>
                </Link>
                <Link
                  to="/contact"
                  className={mobileIconBtn(activePage === "contact")}
                >
                  <PhoneIcon className="w-5 h-5" />
                  <span className="mobile-nav-label">ติดต่อ</span>
                </Link>
              </div>
            </div>

            {/* ── Right: Cart + Hamburger (mobile) / Cart + Auth (desktop) ── */}
            <div className="flex-1 flex items-center justify-end gap-1 md:gap-2">
              {/* Desktop only: Admin */}
              {isAdmin && (
                <Link to="/admin" className="hidden md:flex">
                  <button
                    className={`${iconBtnBase} bg-[#FF8400]/8 border-[#FF8400]/25 hover:bg-[#FF8400]/20`}
                    title="Admin Dashboard"
                  >
                    <DashboardIcon className="w-5 h-5 text-[#FF8400]" />
                  </button>
                </Link>
              )}
              {/* Cart */}
              <button className={`${iconBtnBase} bg-white hover:bg-amber-50`}>
                <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
              </button>
              {/* Desktop only: User Dropdown */}
              {isLoggedIn ? (
                <div className="hidden md:block relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className={`${iconBtnBase} bg-white hover:bg-amber-50 flex items-center gap-1 px-3`}
                  >
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
                    <ChevronDownIcon
                      className={`w-3 h-3 text-[#4F200D] transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#F0E8E0] overflow-hidden dropdown-enter z-50">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[#4F200D] hover:bg-[#FFF3E0] hover:text-[#FF8400] transition-colors"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span className="font-medium text-sm">โปรไฟล์</span>
                      </Link>
                      <Link
                        to="/booking-history"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-3 px-4 py-3 text-[#4F200D] hover:bg-[#FFF3E0] hover:text-[#FF8400] transition-colors"
                      >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="font-medium text-sm">
                          ประวัติการจอง
                        </span>
                      </Link>
                      <div className="border-t border-[#F0E8E0]" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogoutIcon className="w-4 h-4" />
                        <span className="font-medium text-sm">ออกจากระบบ</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex">
                  <button
                    className={`${iconBtnBase} bg-white hover:bg-amber-50`}
                  >
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
                  </button>
                </Link>
              )}
              {/* Mobile only: Hamburger */}
              <button
                className={`md:hidden ${iconBtnBase} bg-white hover:bg-amber-50`}
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="เปิดเมนู"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5 text-[#4F200D]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  {menuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Dropdown (account only) ── */}
        {menuOpen && (
          <div className="md:hidden border-t border-[#F0E8E0] bg-white dropdown-enter">
            <div className="px-4 py-3 flex flex-col gap-1">
              {/* Admin (ถ้ามี) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#FF8400] hover:bg-[#FF8400]/10 transition-colors"
                >
                  <DashboardIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">Admin Dashboard</span>
                </Link>
              )}

              {/* Profile / Login */}
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#4F200D] hover:bg-[#FFF3E0] hover:text-[#FF8400] transition-colors"
                  >
                    <UserIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">โปรไฟล์</span>
                  </Link>
                  <Link
                    to="/booking-history"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#4F200D] hover:bg-[#FFF3E0] hover:text-[#FF8400] transition-colors"
                  >
                    <CalendarIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">ประวัติการจอง</span>
                  </Link>
                  <div className="border-t border-[#F0E8E0] my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <LogoutIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#4F200D] hover:bg-[#FFF3E0] hover:text-[#FF8400] transition-colors"
                >
                  <UserIcon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease" }}
            onClick={() => setShowLogoutModal(false)}
          />
          {/* Modal */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{
              animation: "popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            {/* Top accent */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF8400] to-[#FF6B00]" />

            <div className="px-6 pt-6 pb-5 text-center">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" />
                  <path d="M9 12h12l-3 -3" />
                  <path d="M18 15l3 -3" />
                </svg>
              </div>

              <h3 className="text-lg font-bold text-[#2C1A0E] mb-1">
                ออกจากระบบ?
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                คุณต้องการออกจากระบบใช่ไหม?
                <br />
                จะต้องเข้าสู่ระบบใหม่อีกครั้ง
              </p>
            </div>

            <div className="px-5 pb-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="py-3 rounded-xl border-2 border-gray-100 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-colors active:scale-[0.97]"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmLogout}
                className="py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors active:scale-[0.97] shadow-md shadow-red-100"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
