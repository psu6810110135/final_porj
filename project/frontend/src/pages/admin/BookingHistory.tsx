import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Map,
  Calendar,
  User,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Loader2,
  AlertCircle,
  CalendarRange,
  Users,
  X,
  Mail,
  Phone,
  Clock,
  Receipt,
  MessageSquare,
  Ban,
  Banknote,
  Hash,
  CalendarDays,
  Ticket,
  CircleDollarSign,
  Percent,
  TriangleAlert,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

// --- Types ---
interface BookingTour {
  id: string;
  title: string;
}

interface BookingUser {
  id: string;
  username: string;
}

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
}

interface Booking {
  id: string;
  bookingReference: string;
  tour: BookingTour | null;
  user: BookingUser | null;
  contactInfo: ContactInfo;
  travelDate: string | null;
  startDate: string | null;
  endDate: string | null;
  pax: number;
  basePrice: number;
  discount: number;
  totalPrice: number;
  status: string;
  paymentDeadline: string | null;
  specialRequests: string | null;
  cancellationReason: string | null;
  refundAmount: number | null;
  selectedOptions: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

type SortField = "createdAt" | "totalPrice" | "startDate";
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];

/* ─── Custom Select Component ─── */
interface Option {
  value: string | number;
  label: string;
}

const CustomSelect = ({
  value,
  onChange,
  options,
  className,
}: {
  value: string | number;
  onChange: (val: any) => void;
  options: Option[];
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value)) || options[0];

  return (
    <div className="relative flex-1 sm:flex-none w-full sm:w-auto" ref={ref}>
      <div
        className={`flex items-center justify-between ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown
          className={`w-4 h-4 ml-2 transition-transform duration-200 text-[#4F200D]/50 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full min-w-[140px] mt-2 bg-white border-2 border-[#F6F1E9] rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar py-2">
            {options.map((opt) => (
              <div
                key={String(opt.value)}
                className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors ${
                  String(value) === String(opt.value)
                    ? "bg-[#FFD93D]/30 text-[#FF8400]"
                    : "text-[#4F200D] hover:bg-[#F6F1E9]"
                }`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("jwt_token");
    axios
      .get<Booking[]>("http://localhost:3000/api/v1/admin/bookings", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((res) => {
        setBookings(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Failed to load bookings:", err);
        setError("ไม่สามารถโหลดข้อมูลการจองได้ กรุณาลองใหม่อีกครั้ง");
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTourDates = (b: Booking) => {
    if (b.startDate && b.endDate) {
      return { start: formatDate(b.startDate), end: formatDate(b.endDate) };
    }
    if (b.travelDate) {
      return { start: formatDate(b.travelDate), end: formatDate(b.travelDate) };
    }
    return { start: "-", end: "-" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1 font-bold shadow-none text-xs">ยืนยันแล้ว</Badge>;
      case "pending_verify":
        return <Badge className="bg-[#FFD93D]/40 text-[#FF8400] border-0 px-3 py-1 font-bold shadow-none text-xs">รอตรวจสอบ</Badge>;
      case "pending_pay":
        return <Badge className="bg-blue-100 text-blue-600 border-0 px-3 py-1 font-bold shadow-none text-xs">รอชำระเงิน</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-600 border-0 px-3 py-1 font-bold shadow-none text-xs">ยกเลิกแล้ว</Badge>;
      case "expired":
        return <Badge className="bg-gray-200 text-gray-500 border-0 px-3 py-1 font-bold shadow-none text-xs">หมดอายุ</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-0 px-3 py-1 font-bold shadow-none text-xs">{status}</Badge>;
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || dateFrom || dateTo;

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("jwt_token");
      await axios.delete(
        `http://localhost:3000/api/v1/admin/bookings/${bookingToDelete.id}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      setBookings((prev) => prev.filter((b) => b.id !== bookingToDelete.id));
      setBookingToDelete(null);
    } catch (err) {
      console.error("Failed to delete booking:", err);
      alert("ไม่สามารถลบการจองได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setDeleting(false);
    }
  };

  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        b.bookingReference?.toLowerCase().includes(q) ||
        b.contactInfo?.name?.toLowerCase().includes(q) ||
        b.contactInfo?.email?.toLowerCase().includes(q) ||
        b.contactInfo?.phone?.toLowerCase().includes(q) ||
        b.tour?.title?.toLowerCase().includes(q) ||
        b.user?.username?.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || b.status === statusFilter;

      let matchesDate = true;
      const tourStart = b.startDate || b.travelDate;
      if (dateFrom && tourStart) matchesDate = matchesDate && new Date(tourStart) >= new Date(dateFrom);
      if (dateTo && tourStart) matchesDate = matchesDate && new Date(tourStart) <= new Date(dateTo);

      return matchesSearch && matchesStatus && matchesDate;
    });

    result.sort((a, b) => {
      let valA: number, valB: number;
      if (sortField === "totalPrice") {
        valA = Number(a.totalPrice) || 0;
        valB = Number(b.totalPrice) || 0;
      } else if (sortField === "startDate") {
        valA = new Date(a.startDate || a.travelDate || 0).getTime();
        valB = new Date(b.startDate || b.travelDate || 0).getTime();
      } else {
        valA = new Date(a.createdAt).getTime();
        valB = new Date(b.createdAt).getTime();
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return result;
  }, [bookings, searchQuery, statusFilter, dateFrom, dateTo, sortField, sortDir]);

  const totalItems = filteredBookings.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedBookings = filteredBookings.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(safeCurrentPage * itemsPerPage, totalItems);

  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter, dateFrom, dateTo, itemsPerPage]);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safeCurrentPage > 3) pages.push("...");
      const start = Math.max(2, safeCurrentPage - 1);
      const end = Math.min(totalPages - 1, safeCurrentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (safeCurrentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap cursor-pointer select-none hover:text-[#FF8400] transition-colors"
      onClick={() => toggleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {children}
        <ArrowUpDown size={13} className={sortField === field ? "text-[#FF8400]" : "text-[#4F200D]/30"} />
      </div>
    </th>
  );

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4F200D]">
            ประวัติการจอง
          </h1>
          <p className="text-xs sm:text-sm font-medium text-[#4F200D]/60 mt-1">
            ตรวจสอบและจัดการประวัติการสั่งจองทัวร์ของลูกค้าทั้งหมด
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-[#FF8400]/10 text-[#FF8400] border-0 px-4 py-2 font-bold shadow-none text-xs sm:text-sm">
            ทั้งหมด {bookings.length} รายการ
          </Badge>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border-0 shadow-sm space-y-4">
        {/* Row 1: Search + Status */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4F200D]/40 w-5 h-5" />
            <Input
              placeholder="ค้นหา (รหัส, ชื่อ, อีเมล, ทัวร์)..."
              className="pl-12 py-5 sm:py-6 bg-[#F6F1E9]/50 border-0 rounded-2xl font-bold text-[#4F200D] placeholder:font-medium focus:bg-white focus:ring-2 focus:ring-[#FFD93D] transition-all text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <CustomSelect
            className="text-sm border-0 bg-[#F6F1E9]/50 px-4 py-3 sm:px-6 sm:py-3.5 rounded-2xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all w-full sm:w-auto min-w-[160px]"
            value={statusFilter}
            onChange={(val) => setStatusFilter(String(val))}
            options={[
              { value: "all", label: "สถานะทั้งหมด" },
              { value: "pending_pay", label: "รอชำระเงิน" },
              { value: "pending_verify", label: "รอตรวจสอบ" },
              { value: "confirmed", label: "ยืนยันแล้ว" },
              { value: "cancelled", label: "ยกเลิกแล้ว" },
              { value: "expired", label: "หมดอายุ" },
            ]}
          />
        </div>

        {/* Row 2: Date range filter + Clear */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto bg-[#F6F1E9]/30 p-2 sm:p-1.5 sm:pl-3 rounded-2xl border border-[#F6F1E9]">
            <div className="flex items-center gap-2 mb-2 sm:mb-0">
              <CalendarRange size={16} className="text-[#4F200D]/40 shrink-0" />
              <span className="text-sm font-bold text-[#4F200D]/60 whitespace-nowrap">
                วันเริ่มทัวร์:
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                className="text-sm w-full sm:w-auto border-0 bg-white px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-[#4F200D]/40 font-bold text-xs sm:text-sm">ถึง</span>
              <input
                type="date"
                className="text-sm w-full sm:w-auto border-0 bg-white px-3 py-2 rounded-xl focus:ring-2 focus:ring-[#FFD93D] text-[#4F200D] font-bold cursor-pointer outline-none transition-all"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {hasActiveFilters && (
              <span className="text-xs sm:text-sm font-semibold text-[#4F200D]/50">
                พบ {filteredBookings.length} จาก {bookings.length}
              </span>
            )}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="text-xs sm:text-sm font-bold text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-3 sm:px-4 py-2 h-auto"
                onClick={clearFilters}
              >
                <X size={14} className="mr-1" />
                ล้างตัวกรอง
              </Button>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-3xl border-0 shadow-sm p-16 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#FF8400] animate-spin" />
          <p className="text-[#4F200D]/60 font-bold text-sm">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-white rounded-3xl border-0 shadow-sm p-8 sm:p-12 flex flex-col items-center gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-red-500 font-bold text-center text-sm">{error}</p>
          <Button
            className="bg-[#FF8400] hover:bg-[#FF8400]/90 text-white font-bold rounded-2xl px-6"
            onClick={() => window.location.reload()}
          >
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      )}

      {/* Bookings Table */}
      {!loading && !error && (
        <div className="bg-white rounded-3xl border-0 shadow-sm overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm min-w-[900px]">
              <thead className="bg-[#F6F1E9]/80 border-b-2 border-[#F6F1E9]">
                <tr>
                  <th className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">รหัสการจอง</th>
                  <th className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs">ข้อมูลทัวร์</th>
                  <th className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs">ข้อมูลลูกค้า</th>
                  <SortableHeader field="startDate">วันเริ่มทัวร์</SortableHeader>
                  <th className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Users size={13} />จำนวน</div>
                  </th>
                  <SortableHeader field="totalPrice">ยอดรวม</SortableHeader>
                  <th className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs whitespace-nowrap">สถานะ</th>
                  <SortableHeader field="createdAt">วันที่จอง</SortableHeader>
                  <th className="px-4 py-4 sm:px-5 sm:py-5 font-black text-[#4F200D] uppercase tracking-wider text-[10px] sm:text-xs text-right whitespace-nowrap">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F1E9]">
                {paginatedBookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-[#4F200D]/40 font-bold text-sm">
                      ไม่พบข้อมูลการจองที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                ) : (
                  paginatedBookings.map((b) => {
                    const dates = getTourDates(b);
                    return (
                      <tr key={b.id} className="hover:bg-[#FFD93D]/5 transition-colors group">
                        <td className="px-4 py-3 sm:px-5 sm:py-4">
                          <span className="font-black text-[#FF8400] bg-[#FF8400]/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg whitespace-nowrap text-[10px] sm:text-xs">
                            {b.bookingReference || b.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 max-w-[180px] sm:max-w-[220px]">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 bg-[#F6F1E9] rounded-xl text-[#4F200D]/50 group-hover:text-[#FF8400] transition-colors shrink-0 hidden sm:block">
                              <Map size={16} strokeWidth={2.5} />
                            </div>
                            <span className="font-bold text-[#4F200D] line-clamp-2 text-xs sm:text-sm">{b.tour?.title || "ทัวร์ถูกลบ"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <User size={12} className="text-[#4F200D]/40 shrink-0" strokeWidth={3} />
                              <span className="font-bold text-[#4F200D] truncate text-xs sm:text-sm">{b.contactInfo?.name || b.user?.username || "-"}</span>
                            </div>
                            {b.contactInfo?.phone && <span className="text-[10px] sm:text-xs font-semibold text-[#4F200D]/50 ml-4 sm:ml-5">{b.contactInfo.phone}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                             <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[10px] sm:text-sm"><Calendar size={12} strokeWidth={2.5} /> {dates.start}</div>
                             {dates.end !== dates.start && <div className="flex items-center gap-1.5 text-red-500 font-semibold text-[10px] sm:text-xs mt-0.5 ml-0.5">ถึง {dates.end}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap text-center">
                          <span className="font-bold text-[#4F200D] bg-[#F6F1E9] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs sm:text-sm">{b.pax} คน</span>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                          <span className="font-black text-[#4F200D] text-xs sm:text-sm">฿{Number(b.totalPrice).toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">{getStatusBadge(b.status)}</td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                          <span className="text-[#4F200D]/60 font-semibold text-[10px] sm:text-xs">{formatDate(b.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3 sm:px-5 sm:py-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 rounded-xl" title="ดูรายละเอียด" onClick={() => setSelectedBooking(b)}>
                              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-[#4F200D]/40 hover:text-red-500 hover:bg-red-50 rounded-xl" title="ลบการจอง" onClick={() => setBookingToDelete(b)}>
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar - Responsive */}
          {totalItems > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between md:justify-center gap-4 px-4 py-4 sm:px-6 sm:py-5 border-t-2 border-[#F6F1E9] bg-white relative">
              <div className="flex items-center gap-2 text-xs sm:text-sm md:absolute md:left-6 w-full md:w-auto justify-between md:justify-start">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#4F200D]/60">แสดง</span>
                  <CustomSelect
                    className="border-0 bg-[#F6F1E9]/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[#4F200D] font-bold cursor-pointer outline-none focus:ring-2 focus:ring-[#FFD93D] text-xs sm:text-sm min-w-[60px]"
                    value={itemsPerPage}
                    onChange={(val) => setItemsPerPage(Number(val))}
                    options={ITEMS_PER_PAGE_OPTIONS.map(n => ({ value: n, label: String(n) }))}
                  />
                </div>
                <span className="font-semibold text-[#4F200D]/60">
                   {startItem}-{endItem} จาก {totalItems}
                </span>
              </div>

              <div className="flex items-center gap-1 bg-[#F6F1E9]/30 p-1 sm:p-1.5 rounded-2xl border-2 border-[#F6F1E9] w-full sm:w-auto justify-center">
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 disabled:opacity-30" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage(1)}><ChevronsLeft size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 disabled:opacity-30" disabled={safeCurrentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}><ChevronLeft size={16} /></Button>
                
                <div className="flex items-center gap-0.5 sm:gap-1 px-1">
                  {getPageNumbers().map((page, i) => page === "..." ? (
                    <span key={`dots-${i}`} className="px-1 text-[#4F200D]/30 font-bold text-xs sm:text-sm">...</span>
                  ) : (
                    <Button key={page} variant="ghost" size="icon" className={`h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-xs sm:text-sm font-bold transition-all ${page === safeCurrentPage ? "bg-[#FF8400] text-white hover:bg-[#FF8400]/90 shadow-sm" : "text-[#4F200D]/60 hover:text-[#FF8400] hover:bg-[#FF8400]/10"}`} onClick={() => setCurrentPage(page as number)}>{page}</Button>
                  ))}
                </div>

                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 disabled:opacity-30" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}><ChevronRight size={16} /></Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 rounded-xl text-[#4F200D]/40 hover:text-[#FF8400] hover:bg-[#FF8400]/10 disabled:opacity-30" disabled={safeCurrentPage >= totalPages} onClick={() => setCurrentPage(totalPages)}><ChevronsRight size={16} /></Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== Booking Detail Modal ===== */}
      {selectedBooking && <BookingDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} getStatusBadge={getStatusBadge} getTourDates={getTourDates} />}

      {/* ===== Delete Confirm Modal ===== */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => !deleting && setBookingToDelete(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-col items-center pt-6 sm:pt-8 pb-2">
              <div className="p-3 sm:p-4 bg-red-100 rounded-full mb-3 sm:mb-4"><TriangleAlert size={28} className="text-red-500" /></div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#4F200D]">ยืนยันการลบการจอง</h2>
              <p className="text-xs sm:text-sm text-[#4F200D]/60 font-medium mt-2 text-center px-6">คุณต้องการลบการจองนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>
            </div>
            <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 rounded-2xl border border-red-200 space-y-2">
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-red-400">รหัส</span><span className="font-black text-red-600 text-[10px] sm:text-sm">{bookingToDelete.bookingReference || bookingToDelete.id.slice(0, 8)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-red-400">ทัวร์</span><span className="font-bold text-[#4F200D] text-[10px] sm:text-sm truncate ml-4">{bookingToDelete.tour?.title || "ทัวร์ถูกลบ"}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-red-400">ลูกค้า</span><span className="font-bold text-[#4F200D] text-[10px] sm:text-sm">{bookingToDelete.contactInfo?.name || bookingToDelete.user?.username || "-"}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs font-bold text-red-400">ยอดเงิน</span><span className="font-black text-[#4F200D] text-xs sm:text-sm">฿{Number(bookingToDelete.totalPrice).toLocaleString()}</span></div>
            </div>
            <div className="flex gap-2 sm:gap-3 p-4 sm:p-6 pt-4 sm:pt-5">
              <Button className="flex-1 bg-[#F6F1E9] hover:bg-[#F6F1E9]/80 text-[#4F200D] font-bold rounded-xl sm:rounded-2xl py-4 sm:py-5 shadow-none text-xs sm:text-sm" onClick={() => setBookingToDelete(null)} disabled={deleting}>ยกเลิก</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl sm:rounded-2xl py-4 sm:py-5 shadow-none gap-2 text-xs sm:text-sm" onClick={handleDeleteBooking} disabled={deleting}>{deleting ? <><Loader2 size={16} className="animate-spin" /> ลบ...</> : <><Trash2 size={16} /> ลบการจอง</>}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingDetailModal({ booking: b, onClose, getStatusBadge, getTourDates }: any) {
  const dates = getTourDates(b);
  const statusLabel = (s: string) => ({ pending_pay: "รอชำระเงิน", pending_verify: "รอตรวจสอบการชำระ", confirmed: "ยืนยันแล้ว", cancelled: "ยกเลิกแล้ว", expired: "หมดอายุ" }[s] || s);
  const statusBgColor = (s: string) => ({ pending_pay: "bg-blue-50 border-blue-200", pending_verify: "bg-amber-50 border-amber-200", confirmed: "bg-emerald-50 border-emerald-200", cancelled: "bg-red-50 border-red-200", expired: "bg-gray-50 border-gray-200" }[s] || "bg-gray-50 border-gray-200");
  const formatDateTime = (dateStr: string | null) => dateStr ? new Date(dateStr).toLocaleString("th-TH", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
  const isDeadlinePassed = b.paymentDeadline && new Date(b.paymentDeadline) < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
        <div className={`p-4 sm:p-6 pb-3 sm:pb-4 rounded-t-2xl sm:rounded-t-3xl border-b-2 ${statusBgColor(b.status)} sticky top-0 z-10 backdrop-blur-md`}>
          <div className="flex items-start justify-between gap-2 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <Ticket size={16} className="text-[#FF8400] hidden sm:block" />
                <span className="font-black text-[#FF8400] bg-[#FF8400]/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm">{b.bookingReference || b.id.slice(0, 8)}</span>
                {getStatusBadge(b.status)}
              </div>
              <p className="text-[10px] sm:text-xs text-[#4F200D]/50 font-semibold">สถานะ: {statusLabel(b.status)}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl text-[#4F200D]/40 hover:text-[#4F200D] hover:bg-[#4F200D]/10 shrink-0" onClick={onClose}><X size={18} /></Button>
          </div>
        </div>
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex items-start gap-3 p-3 sm:p-4 bg-[#F6F1E9]/60 rounded-xl sm:rounded-2xl">
            <div className="p-2 sm:p-2.5 bg-[#FF8400]/10 rounded-xl text-[#FF8400] shrink-0"><Map size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} /></div>
            <div><p className="text-[10px] sm:text-xs font-bold text-[#4F200D]/50 uppercase tracking-wider">ทัวร์</p><p className="font-extrabold text-[#4F200D] text-sm sm:text-lg mt-0.5">{b.tour?.title || "ทัวร์ถูกลบ"}</p></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 bg-emerald-50 rounded-xl sm:rounded-2xl text-center flex flex-row sm:flex-col items-center sm:items-stretch justify-between sm:justify-start">
              <div className="flex items-center gap-2 sm:block"><CalendarDays size={16} className="text-emerald-600 sm:mx-auto sm:mb-1.5" /><p className="text-[10px] sm:text-xs font-bold text-emerald-600/70 text-left sm:text-center">เริ่มทัวร์</p></div>
              <p className="font-extrabold text-emerald-700 text-xs sm:text-sm mt-0 sm:mt-0.5">{dates.start}</p>
            </div>
            <div className="p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl text-center flex flex-row sm:flex-col items-center sm:items-stretch justify-between sm:justify-start">
               <div className="flex items-center gap-2 sm:block"><CalendarDays size={16} className="text-red-500 sm:mx-auto sm:mb-1.5" /><p className="text-[10px] sm:text-xs font-bold text-red-500/70 text-left sm:text-center">สิ้นสุดทัวร์</p></div>
               <p className="font-extrabold text-red-600 text-xs sm:text-sm mt-0 sm:mt-0.5">{dates.end}</p>
            </div>
            <div className="p-3 sm:p-4 bg-blue-50 rounded-xl sm:rounded-2xl text-center flex flex-row sm:flex-col items-center sm:items-stretch justify-between sm:justify-start">
               <div className="flex items-center gap-2 sm:block"><Users size={16} className="text-blue-600 sm:mx-auto sm:mb-1.5" /><p className="text-[10px] sm:text-xs font-bold text-blue-600/70 text-left sm:text-center">ผู้เดินทาง</p></div>
               <p className="font-extrabold text-blue-700 text-xs sm:text-sm mt-0 sm:mt-0.5">{b.pax} คน</p>
            </div>
          </div>
          <div className="p-3 sm:p-4 bg-[#F6F1E9]/40 rounded-xl sm:rounded-2xl space-y-3">
            <p className="text-[10px] sm:text-xs font-black text-[#4F200D]/50 uppercase tracking-wider flex items-center gap-2"><User size={14} /> ข้อมูลผู้ติดต่อ</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white rounded-lg shadow-sm"><User size={14} className="text-[#FF8400]" /></div><div><p className="text-[10px] sm:text-xs text-[#4F200D]/40 font-semibold">ชื่อ</p><p className="font-bold text-[#4F200D] text-xs sm:text-sm">{b.contactInfo?.name || "-"}</p></div></div>
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white rounded-lg shadow-sm"><Mail size={14} className="text-[#FF8400]" /></div><div className="min-w-0"><p className="text-[10px] sm:text-xs text-[#4F200D]/40 font-semibold">อีเมล</p><p className="font-bold text-[#4F200D] text-xs sm:text-sm truncate">{b.contactInfo?.email || "-"}</p></div></div>
              <div className="flex items-center gap-2.5"><div className="p-1.5 bg-white rounded-lg shadow-sm"><Phone size={14} className="text-[#FF8400]" /></div><div><p className="text-[10px] sm:text-xs text-[#4F200D]/40 font-semibold">เบอร์โทร</p><p className="font-bold text-[#4F200D] text-xs sm:text-sm">{b.contactInfo?.phone || "-"}</p></div></div>
            </div>
            {b.user && <p className="text-[10px] sm:text-xs text-[#4F200D]/40 font-semibold mt-1">บัญชีผู้ใช้: <span className="text-[#4F200D]/60">{b.user.username}</span></p>}
          </div>
          <div className="p-3 sm:p-4 bg-[#F6F1E9]/40 rounded-xl sm:rounded-2xl space-y-3">
            <p className="text-[10px] sm:text-xs font-black text-[#4F200D]/50 uppercase tracking-wider flex items-center gap-2"><Receipt size={14} /> รายละเอียดราคา</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-[#4F200D]/60 font-semibold flex items-center gap-2"><CircleDollarSign size={14} className="text-[#4F200D]/40" />ราคาฐาน</span><span className="font-bold text-[#4F200D] text-xs sm:text-sm">฿{Number(b.basePrice || 0).toLocaleString()}</span></div>
              {Number(b.discount) > 0 && <div className="flex justify-between items-center"><span className="text-xs sm:text-sm text-emerald-600 font-semibold flex items-center gap-2"><Percent size={14} className="text-emerald-500" />ส่วนลด</span><span className="font-bold text-emerald-600 text-xs sm:text-sm">-฿{Number(b.discount).toLocaleString()}</span></div>}
              <div className="border-t border-[#4F200D]/10 pt-2 flex justify-between items-center"><span className="text-sm sm:text-base text-[#4F200D] font-extrabold flex items-center gap-2"><Banknote size={14} className="text-[#FF8400]" />ยอดรวมทั้งหมด</span><span className="font-black text-[#FF8400] text-base sm:text-lg">฿{Number(b.totalPrice).toLocaleString()}</span></div>
            </div>
          </div>
          {b.paymentDeadline && (
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center gap-3 ${isDeadlinePassed ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
              <Clock size={18} className={isDeadlinePassed ? "text-red-500" : "text-amber-600"} />
              <div><p className="text-[10px] sm:text-xs font-bold text-[#4F200D]/50">กำหนดชำระเงิน</p><p className={`font-extrabold text-xs sm:text-sm ${isDeadlinePassed ? "text-red-600" : "text-amber-700"}`}>{formatDateTime(b.paymentDeadline)} {isDeadlinePassed && " (เลยกำหนดแล้ว)"}</p></div>
            </div>
          )}
          {b.specialRequests && (
            <div className="p-3 sm:p-4 bg-purple-50 rounded-xl sm:rounded-2xl">
              <p className="text-[10px] sm:text-xs font-black text-purple-600/60 uppercase tracking-wider flex items-center gap-2 mb-1.5 sm:mb-2"><MessageSquare size={14} /> คำขอพิเศษ</p>
              <p className="text-xs sm:text-sm text-purple-800 font-semibold leading-relaxed whitespace-pre-wrap">{b.specialRequests}</p>
            </div>
          )}
          {b.status === "cancelled" && (
            <div className="p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl border border-red-200 space-y-1.5 sm:space-y-2">
              <p className="text-[10px] sm:text-xs font-black text-red-500/70 uppercase tracking-wider flex items-center gap-2"><Ban size={14} /> ข้อมูลการยกเลิก</p>
              {b.cancellationReason && <div><p className="text-[10px] sm:text-xs font-bold text-red-400">เหตุผลที่ยกเลิก:</p><p className="text-xs sm:text-sm text-red-700 font-semibold mt-0.5">{b.cancellationReason}</p></div>}
            </div>
          )}
          <div className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-1.5 sm:gap-y-1 pt-2 sm:pt-3 border-t border-[#F6F1E9]">
            <p className="text-[10px] sm:text-xs text-[#4F200D]/40 font-semibold flex items-center gap-1.5"><Calendar size={12} className="shrink-0" />สร้างเมื่อ: {formatDateTime(b.createdAt)}</p>
            {b.updatedAt && b.updatedAt !== b.createdAt && <p className="text-[10px] sm:text-xs text-[#4F200D]/40 font-semibold flex items-center gap-1.5"><Clock size={12} className="shrink-0" />อัปเดตล่าสุด: {formatDateTime(b.updatedAt)}</p>}
            <p className="text-[10px] sm:text-xs text-[#4F200D]/30 font-mono flex items-center gap-1.5 mt-1 sm:mt-0"><Hash size={12} className="shrink-0" />{b.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}