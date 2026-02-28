import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Tour {
  title?: string;
  nameTh?: string;
  nameEn?: string;
}

interface Booking {
  id: string;
  bookingReference?: string;
  tourId?: string;
  status:
    | "pending_pay"
    | "pending_verify"
    | "confirmed"
    | "cancelled"
    | "expired";
  totalPrice: number;
  pax: number;
  travelDate?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  tour?: Tour;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

type BookingStatus = Booking["status"];

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string; mobileBg: string }
> = {
  pending_pay: {
    label: "รอชำระเงิน",
    className: "bg-gray-100 text-gray-500 border border-gray-300",
    mobileBg: "border-l-gray-400",
  },
  pending_verify: {
    label: "รอตรวจสอบ",
    className: "bg-orange-100 text-orange-600 border border-orange-300",
    mobileBg: "border-l-orange-400",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    className: "bg-green-500 text-white border border-green-500",
    mobileBg: "border-l-green-500",
  },
  cancelled: {
    label: "ยกเลิก",
    className: "bg-red-500 text-white border border-red-500",
    mobileBg: "border-l-red-500",
  },
  expired: {
    label: "หมดอายุ",
    className: "bg-gray-300 text-gray-600 border border-gray-300",
    mobileBg: "border-l-gray-400",
  },
};

const STATUS_OPTIONS: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending_pay", label: "รอชำระเงิน" },
  { value: "pending_verify", label: "รอตรวจสอบ" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "cancelled", label: "ยกเลิก" },
  { value: "expired", label: "หมดอายุ" },
];

// ─── Formatting ───────────────────────────────────────────────────────────────

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  try {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat("th-TH").format(price);

const getTravelDate = (b: Booking) => b.travelDate ?? b.startDate;

const getTourTitle = (b: Booking) =>
  b.tour?.title ?? b.tour?.nameTh ?? `ทัวร์ #${b.tourId ?? "-"}`;

const getBookingReference = (b: Booking) => b.bookingReference ?? b.id;

const ITEMS_PER_PAGE = 6;

// ─── Play Icon ────────────────────────────────────────────────────────────────

const PlayIcon = () => (
  <div className="w-10 h-10 rounded-full bg-[#FF8400] flex items-center justify-center flex-shrink-0 shadow-sm">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  </div>
);

// ─── Search Icon ──────────────────────────────────────────────────────────────

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Chevron Icons ────────────────────────────────────────────────────────────

const ChevronLeftIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Page ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function BookingHistoryPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filter / Search state ──
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>(
    "all",
  );

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch ──
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (!token) {
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          "http://localhost:3000/api/v1/bookings/my-bookings",
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.bookings)
            ? data.bookings
            : Array.isArray(data?.data)
              ? data.data
              : [];

        const normalized: Booking[] = items.map((item: any) => ({
          id: item.id,
          bookingReference: item.bookingReference,
          tourId: item.tourId ?? item.tour?.id,
          status: item.status,
          totalPrice: Number(item.totalPrice ?? 0),
          pax: Number(item.pax ?? item.numberOfTravelers ?? 1),
          travelDate: item.travelDate,
          startDate: item.startDate,
          endDate: item.endDate,
          createdAt: item.createdAt,
          tour: item.tour
            ? {
                title: item.tour.title,
                nameTh: item.tour.nameTh ?? item.tour.title ?? "",
                nameEn: item.tour.nameEn ?? "",
              }
            : undefined,
        }));
        setBookings(normalized);
      } catch {
        setError("ไม่สามารถโหลดข้อมูลการจองได้");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  // ── Filtered bookings ──
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Status
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      // Text search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = getTourTitle(b).toLowerCase().includes(q);
        const matchRef = getBookingReference(b).toLowerCase().includes(q);
        if (!matchTitle && !matchRef) return false;
      }
      return true;
    });
  }, [bookings, searchQuery, statusFilter]);

  // ── Pagination computed ──
  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE,
  );

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const hasFewBookings = !loading && !error && bookings.length <= 2;

  // ── Active status counts for filter pills ──
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: bookings.length };
    for (const b of bookings) {
      counts[b.status] = (counts[b.status] ?? 0) + 1;
    }
    return counts;
  }, [bookings]);

  return (
    <div className="min-h-screen bg-[#F6F1E9] flex flex-col">
      <Navbar />

      <main className="w-full flex-1 flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
          {/* ── Page Title ── */}
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="inline-block self-start bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-bold text-base px-5 py-2 rounded-full shadow-md">
              ทริปของฉัน
            </span>
            {!loading && !error && bookings.length > 0 && (
              <span className="text-sm font-semibold text-[#4F200D]/50">
                ทั้งหมด {bookings.length} รายการ
              </span>
            )}
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
              {/* ── Search & Filter Bar ── */}
              <div className="bg-white rounded-2xl border border-[#F0E8E0] shadow-sm p-3 md:p-4 mb-4 space-y-3">
                {/* Search input */}
                <div className="relative">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4F200D]/30" />
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อทัวร์ หรือเลขอ้างอิง..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F6F1E9]/60 border-0 rounded-xl text-sm font-semibold text-[#4F200D] placeholder:text-[#4F200D]/35 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-[#FF8400]/30 focus:bg-white transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4F200D]/30 hover:text-[#4F200D]/60 transition-colors"
                      onClick={() => setSearchQuery("")}
                      aria-label="ล้างคำค้นหา"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Status filter pills — scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
                  {STATUS_OPTIONS.map((opt) => {
                    const count = statusCounts[opt.value] ?? 0;
                    const isActive = statusFilter === opt.value;
                    if (opt.value !== "all" && count === 0) return null;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3.5 py-2 rounded-full transition-all shrink-0 ${
                          isActive
                            ? "bg-[#FF8400] text-white shadow-sm"
                            : "bg-[#F6F1E9]/80 text-[#4F200D]/60 hover:bg-[#F6F1E9] hover:text-[#4F200D]"
                        }`}
                      >
                        {opt.label}
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                            isActive
                              ? "bg-white/25 text-white"
                              : "bg-[#4F200D]/8 text-[#4F200D]/40"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Filter result info ── */}
              {(searchQuery || statusFilter !== "all") && (
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs font-semibold text-[#4F200D]/40">
                    พบ {filteredBookings.length} รายการ
                    {searchQuery && (
                      <span>
                        {" "}
                        สำหรับ "
                        <span className="text-[#FF8400]">{searchQuery}</span>"
                      </span>
                    )}
                  </p>
                  <button
                    className="text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                  >
                    ล้างตัวกรอง
                  </button>
                </div>
              )}

              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#F0E8E0] px-6 py-12 flex flex-col items-center gap-3 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                    <SearchIcon className="text-[#FF8400] w-6 h-6" />
                  </div>
                  <p className="text-[#4F200D]/60 font-semibold text-sm">
                    ไม่พบการจองที่ตรงกับเงื่อนไข
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile: Card list */}
                  <div className="md:hidden flex flex-col gap-3">
                    {paginatedBookings.map((booking) => (
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
                            วันเดินทาง
                          </th>
                          <th className="text-center px-4 py-4 text-[#4F200D] font-semibold text-sm">
                            จำนวน
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
                        {paginatedBookings.map((booking, idx) => (
                          <DesktopRow
                            key={booking.id}
                            booking={booking}
                            isLast={idx === paginatedBookings.length - 1}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── Pagination ── */}
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      totalItems={totalItems}
                      itemsPerPage={ITEMS_PER_PAGE}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {hasFewBookings ? <div className="flex-1 min-h-20 md:min-h-0" /> : null}
      </main>

      {hasFewBookings ? (
        <div className="max-h-40 md:max-h-48 overflow-hidden">
          <Footer />
        </div>
      ) : (
        <Footer />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Pagination ───────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Build page numbers with ellipsis
  const getPages = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">
      <p className="text-xs font-semibold text-[#4F200D]/40 order-2 sm:order-1">
        แสดง {startItem}-{endItem} จาก {totalItems} รายการ
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Prev */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeftIcon />
        </button>

        {getPages().map((page, i) =>
          page === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-[#4F200D]/25 text-xs font-bold"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                page === currentPage
                  ? "bg-[#FF8400] text-white shadow-sm"
                  : "text-[#4F200D]/50 hover:text-[#FF8400] hover:bg-[#FF8400]/10"
              }`}
            >
              {page}
            </button>
          ),
        )}

        {/* Next */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="หน้าถัดไป"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Mobile Card ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function MobileCard({ booking }: { booking: Booking }) {
  const cfg = statusConfig[booking.status];
  const tourLink = booking.tourId ? `/tours/${booking.tourId}` : undefined;
  const travelDateStr = formatDate(getTravelDate(booking));

  return (
    <div
      className={`bg-white rounded-2xl border border-[#F0E8E0] border-l-4 ${cfg.mobileBg} shadow-sm overflow-hidden`}
    >
      {/* Top row: icon + title + status */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        {tourLink ? (
          <Link
            to={tourLink}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8400]/40 rounded-full shrink-0"
            aria-label="ดูรายละเอียดทัวร์"
          >
            <PlayIcon />
          </Link>
        ) : (
          <PlayIcon />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[#4F200D] text-sm leading-snug line-clamp-2">
            {getTourTitle(booking)}
          </p>
          <p className="text-[#FF8400] text-[11px] mt-1 font-semibold line-clamp-1">
            เลขอ้างอิง: {getBookingReference(booking)}
          </p>
        </div>

        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${cfg.className}`}
        >
          {cfg.label}
        </span>
      </div>

      {/* Bottom row: details + price + action */}
      <div className="px-4 pb-3 pt-0 flex items-center justify-between border-t border-[#F6F1E9]">
        <div className="flex items-center gap-4 text-[11px] text-[#4F200D]/45 font-medium">
          <span className="flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {travelDateStr}
          </span>
          <span className="flex items-center gap-1">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {booking.pax} คน
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="font-bold text-[#4F200D] text-sm">
            ฿{formatPrice(booking.totalPrice)}
          </span>
          {booking.status === "pending_pay" && (
            <Link
              to={`/payment/${booking.id}`}
              className="text-[11px] font-bold text-white bg-[#FF8400] px-3 py-1.5 rounded-full hover:bg-[#e67600] transition-colors"
            >
              ชำระเงิน
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Desktop Row ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function DesktopRow({
  booking,
  isLast,
}: {
  booking: Booking;
  isLast: boolean;
}) {
  const cfg = statusConfig[booking.status];
  const tourLink = booking.tourId ? `/tours/${booking.tourId}` : undefined;
  const travelDateStr = formatDate(getTravelDate(booking));

  return (
    <tr
      className={`${!isLast ? "border-b border-[#F0E8E0]" : ""} hover:bg-[#FFFAF5] transition-colors`}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {tourLink ? (
            <Link
              to={tourLink}
              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8400]/40 rounded-full"
              aria-label="ดูรายละเอียดทัวร์"
            >
              <PlayIcon />
            </Link>
          ) : (
            <PlayIcon />
          )}
          <div>
            <p className="font-bold text-[#4F200D] text-sm">
              {getTourTitle(booking)}
            </p>
            <p className="text-[#FF8400] text-xs font-semibold">
              เลขอ้างอิง: {getBookingReference(booking)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-[#4F200D]/60 text-sm whitespace-nowrap font-medium">
        {travelDateStr}
      </td>
      <td className="px-4 py-4 text-center">
        <span className="text-sm font-bold text-[#4F200D]/70">
          {booking.pax} คน
        </span>
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Empty State ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="bg-white rounded-2xl border border-[#F0E8E0] px-6 py-16 flex flex-col items-center gap-4 shadow-sm">
      <div className="w-16 h-16 rounded-full bg-[#FFF3E0] flex items-center justify-center">
        <svg
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Loading Skeleton ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Skeleton filter bar */}
      <div className="bg-white rounded-2xl border border-[#F0E8E0] p-4 shadow-sm animate-pulse">
        <div className="h-10 bg-gray-100 rounded-xl mb-3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-100 rounded-full w-20" />
          ))}
        </div>
      </div>
      {/* Skeleton cards */}
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

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Error State ──────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-2xl border border-red-100 px-6 py-12 flex flex-col items-center gap-3 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <svg
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
