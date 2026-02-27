import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Schedule {
  startDate: string;
}

interface Tour {
  nameTh: string;
  nameEn: string;
}

interface Booking {
  id: string;
  status:
    | "pending_pay"
    | "pending_verify"
    | "confirmed"
    | "cancelled"
    | "expired";
  totalPrice: number;
  schedule?: Schedule;
  tour?: Tour;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusConfig: Record<
  Booking["status"],
  { label: string; className: string }
> = {
  pending_pay: {
    label: "รอชำระเงิน",
    className: "bg-gray-100 text-gray-500 border border-gray-300",
  },
  pending_verify: {
    label: "รอตรวจสอบ",
    className: "bg-orange-100 text-orange-600 border border-orange-300",
  },
  confirmed: {
    label: "ชำระสำเร็จ",
    className: "bg-green-500 text-white border border-green-500",
  },
  cancelled: {
    label: "ยกเลิก",
    className: "bg-red-500 text-white border border-red-500",
  },
  expired: {
    label: "หมดอายุ",
    className: "bg-gray-300 text-gray-600 border border-gray-300",
  },
};

// ─── Formatting ───────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("th-TH").format(price);

// ─── Play Icon (orange circle with triangle) ──────────────────────────────────

const PlayIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#FF8400] flex items-center justify-center flex-shrink-0 shadow-sm">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="white"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/v1/bookings/my-bookings",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("ไม่สามารถโหลดข้อมูลการจองได้");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* ── Page Title ── */}
        <div className="mb-6">
          <span className="inline-block bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-bold text-base px-5 py-2 rounded-full shadow-md">
            ทริปของฉัน
          </span>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : bookings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Mobile: Card list */}
            <div className="md:hidden flex flex-col gap-3">
              {bookings.map((booking) => (
                <MobileCard key={booking.id} booking={booking} />
              ))}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-[#F0E8E0] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#FFF3E0] border-b border-[#F0E8E0]">
                    <th className="text-left px-6 py-4 text-[#4F200D] font-semibold text-sm">
                      ทัวร์
                    </th>
                    <th className="text-left px-4 py-4 text-[#4F200D] font-semibold text-sm">
                      วันที่
                    </th>
                    <th className="text-center px-4 py-4 text-[#4F200D] font-semibold text-sm">
                      สถานะ
                    </th>
                    <th className="text-right px-6 py-4 text-[#4F200D] font-semibold text-sm">
                      ราคา
                    </th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, idx) => (
                    <DesktopRow
                      key={booking.id}
                      booking={booking}
                      isLast={idx === bookings.length - 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}

// ─── Mobile Card ──────────────────────────────────────────────────────────────

function MobileCard({ booking }: { booking: Booking }) {
  const cfg = statusConfig[booking.status];
  return (
    <div className="bg-white rounded-2xl border border-[#F0E8E0] px-4 py-4 flex items-center gap-4 shadow-sm">
      <PlayIcon />

      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#4F200D] text-base leading-snug line-clamp-1">
          {booking.tour?.nameTh ?? "ทัวร์"}
        </p>
        <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">
          {booking.tour?.nameEn ?? ""}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          {formatDate(booking.schedule?.startDate)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.className}`}
        >
          {cfg.label}
        </span>
        {booking.status === "pending_pay" && (
          <Link
            to={`/payment/${booking.id}`}
            className="text-xs font-bold text-white bg-[#FF8400] px-3 py-1 rounded-full hover:bg-[#e67600] transition-colors"
          >
            ชำระเงิน
          </Link>
        )}
        <span className="font-bold text-[#4F200D] text-sm">
          ฿{formatPrice(booking.totalPrice)}
        </span>
      </div>
    </div>
  );
}

// ─── Desktop Row ──────────────────────────────────────────────────────────────

function DesktopRow({
  booking,
  isLast,
}: {
  booking: Booking;
  isLast: boolean;
}) {
  const cfg = statusConfig[booking.status];
  return (
    <tr
      className={`${!isLast ? "border-b border-[#F0E8E0]" : ""} hover:bg-[#FFFAF5] transition-colors`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <PlayIcon />
          <div>
            <p className="font-bold text-[#4F200D] text-sm">
              {booking.tour?.nameTh ?? "ทัวร์"}
            </p>
            <p className="text-gray-400 text-xs">
              {booking.tour?.nameEn ?? ""}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-gray-500 text-sm whitespace-nowrap">
        {formatDate(booking.schedule?.startDate)}
      </td>
      <td className="px-4 py-4 text-center">
        <span
          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${cfg.className}`}
        >
          {cfg.label}
        </span>
      </td>
      <td className="px-6 py-4 text-right font-bold text-[#4F200D]">
        ฿{formatPrice(booking.totalPrice)}
      </td>
      <td className="px-4 py-4">
        {booking.status === "pending_pay" && (
          <Link
            to={`/payment/${booking.id}`}
            className="text-xs font-bold text-white bg-[#FF8400] px-4 py-2 rounded-full hover:bg-[#e67600] transition-colors whitespace-nowrap"
          >
            ชำระเงิน
          </Link>
        )}
      </td>
    </tr>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E8E0] px-6 py-16 flex flex-col items-center gap-4 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#FFF3E0] flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FF8400"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <p className="text-[#4F200D] font-semibold text-lg">ยังไม่มีการจอง</p>
      <p className="text-gray-400 text-sm text-center">
        คุณยังไม่มีประวัติการจองทัวร์ในระบบ
      </p>
      <Link
        to="/tours"
        className="mt-2 bg-[#FF8400] text-white font-bold px-6 py-2.5 rounded-full hover:bg-[#e67600] transition-colors text-sm"
      >
        ค้นหาทัวร์
      </Link>
    </div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-[#F0E8E0] px-4 py-4 flex items-center gap-4 shadow-sm animate-pulse"
        >
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="h-6 bg-gray-200 rounded-full w-20" />
            <div className="h-4 bg-gray-100 rounded w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 px-6 py-12 flex flex-col items-center gap-3 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#EF4444"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-red-500 font-semibold">{message}</p>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#4F200D] text-white mt-16">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <p className="font-bold text-lg mb-2">THAI TOUR</p>
          <p className="text-white/60 text-sm leading-relaxed">
            เที่ยวอย่างมั่นใจไปกับเรา
            <br />
            สร้างความทรงจำดีๆ ประทับใจ
            <br />
            สัมผัสบริการระดับพรีเมียม
          </p>
        </div>
        <div>
          <p className="font-semibold mb-3">ข้อมูลองค์กร</p>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>เกี่ยวกับเรา</li>
            <li>สถานที่ท่องเที่ยว</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">Support</p>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>ศูนย์ช่วยเหลือ</li>
            <li>เงื่อนไขการให้บริการ</li>
            <li>นโยบายความเป็นส่วนตัว</li>
            <li>ติดต่อเรา</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-3">ติดตามข่าวสาร</p>
          <p className="text-white/60 text-sm mb-3">
            สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดต และข้อเสนอสุดพิเศษ
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="กรอกอีเมลของคุณ"
              className="flex-1 px-4 py-2 rounded-l-full text-[#4F200D] text-sm outline-none"
            />
            <button className="bg-[#FF8400] px-4 py-2 rounded-r-full font-bold text-sm hover:bg-[#e67600] transition-colors">
              สมัคร
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-white/40 text-xs">
        © 2026 Thai Tours Service All Rights Reserved
      </div>
    </footer>
  );
}
