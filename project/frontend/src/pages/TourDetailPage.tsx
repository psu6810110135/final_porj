import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCategoryLabel, getDurationLabel } from "@/utils/tourLabels";
import { API_BASE_URL } from "@/config/api";

/* ─── Types ───────────────────────── */

interface ItineraryStep {
  time: string;
  detail: string;
}

interface Schedule {
  id: string;
  tour_id: string;
  available_date: string;
  max_capacity_override: number | null;
  is_available: boolean;
  booked_seats?: number;
  available_seats?: number;
  created_at: string;
}

interface Tour {
  id: string;
  title: string;
  description?: string;
  price: number;
  province: string;
  duration: string;
  image_cover: string;
  images?: string[];
  category: string;
  child_price?: number;
  max_group_size?: number;
  highlights?: string[] | string;
  preparation?: string[] | string;
  itinerary?: string;
  itinerary_data?: ItineraryStep[];
  included?: string[] | string;
  excluded?: string[] | string;
  conditions?: string[] | string;
  rating?: number;
  review_count?: number;
  is_active?: boolean;
}

interface ReviewUser {
  id: string;
  username?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: ReviewUser;
}

/* ─── Toast ───────────────────────── */

type ToastType = "error" | "warning" | "success" | "info";

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles: Record<
    ToastType,
    { bg: string; icon: string; border: string }
  > = {
    error: { bg: "bg-red-50", icon: "❌", border: "border-red-200" },
    warning: { bg: "bg-yellow-50", icon: "⚠️", border: "border-yellow-200" },
    success: { bg: "bg-green-50", icon: "✅", border: "border-green-200" },
    info: { bg: "bg-blue-50", icon: "ℹ️", border: "border-blue-200" },
  };
  const s = styles[type];

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-xl ${s.bg} ${s.border} max-w-[90vw] w-max min-w-[260px]`}
      style={{ animation: "toastIn 0.3s cubic-bezier(0.32,0.72,0,1)" }}
    >
      <span className="text-lg shrink-0">{s.icon}</span>
      <p className="text-sm font-semibold text-gray-800 flex-1">{message}</p>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 shrink-0 ml-1"
      >
        ✕
      </button>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const showToast = useCallback(
    (message: string, type: ToastType = "info") => setToast({ message, type }),
    [],
  );
  const closeToast = useCallback(() => setToast(null), []);
  return { toast, showToast, closeToast };
}

/* ─── Lightbox ────────────────────────── */

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      if (e.key === "ArrowRight")
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 0) {
        // Scroll down -> Next
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else if (e.deltaY < 0) {
        // Scroll up -> Prev
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [onClose, images.length]);

  return (
    <div
      className="fixed inset-0 z-[500] bg-black/75 backdrop-blur-md flex flex-col items-center justify-center"
      onClick={onClose}
      style={{ animation: "fadeIn 0.2s ease" }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20 border border-white/10"
      >
        <XIcon />
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      {/* Image Container */}
      <div className="relative w-full h-full flex items-center justify-center p-6 md:p-12 cursor-zoom-out">
        <img
          src={getImageUrl(images[currentIndex])}
          alt={`ภาพที่ ${currentIndex + 1}`}
          className="w-full h-full max-w-full max-h-full object-contain select-none shadow-2xl"
          style={{ animation: "popIn 0.3s cubic-bezier(0.32,0.72,0,1)" }}
        />

        {/* Info Overlay */}
        {images.length > 1 && (
          <div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-xs font-black tracking-[0.2em] uppercase">
              {currentIndex + 1} / {images.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Login Required Modal ───────────────────────── */

function LoginRequiredModal({
  onClose,
  onLogin,
}: {
  onClose: () => void;
  onLogin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center"
        style={{ animation: "popIn 0.3s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FF8400"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-[#2C1A0E] mb-2">
          กรุณาเข้าสู่ระบบก่อน
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถจองทัวร์ได้
          <br />
          หากยังไม่มีบัญชี สามารถสมัครสมาชิกได้เลย
        </p>
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onLogin}
            className="w-full bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-[0.98]"
          >
            เข้าสู่ระบบ →
          </button>
          <button
            onClick={onClose}
            className="w-full border-2 border-gray-100 text-gray-500 font-semibold py-3 rounded-xl text-sm hover:border-gray-200 hover:bg-gray-50 transition-all"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

function TourUnavailableModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeIn 0.2s ease" }}
      />
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md text-center"
        style={{ animation: "popIn 0.3s cubic-bezier(0.32,0.72,0,1)" }}
      >
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#DC2626"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 className="text-lg font-black text-[#2C1A0E] mb-2">
          ทัวร์นี้ยังไม่พร้อมให้บริการ
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          ขณะนี้ทัวร์อยู่ในช่วงปิดให้บริการชั่วคราว
          <br />
          กรุณาติดต่อแอดมินเพื่อขอข้อมูลเพิ่มเติม
        </p>
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-orange-200 hover:shadow-xl transition-all active:scale-[0.98]"
        >
          กลับไปหน้าทัวร์
        </button>
      </div>
    </div>
  );
}

/* ─── Helpers ───────────────────────── */

const getImageUrl = (path?: string) => {
  if (!path) return "https://placehold.co/80x80?text=No+Img";
  if (path.startsWith("http")) return path;
  return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
};

function parsePreparation(raw?: string[] | string): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseTextList(raw?: string[] | string): string[] {
  if (!raw) return [];
  if (Array.isArray(raw))
    return raw.filter(Boolean).map((v) => String(v).trim());
  // Strip PostgreSQL array braces and quotes before splitting
  const cleaned = raw
    .trim()
    .replace(/^\{/, "")
    .replace(/\}$/, "")
    .replace(/"/g, "");
  return cleaned
    .split(/\n|,|•|\u2022|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseItinerary(
  rawStructured?: ItineraryStep[] | null,
  rawText?: string,
): ItineraryStep[] {
  if (Array.isArray(rawStructured) && rawStructured.length > 0)
    return rawStructured.filter((i) => i?.detail);
  if (!rawText) return [];
  return rawText
    .split("\n")
    .map((line, index) => {
      line = line.trim();
      if (!line) return null;
      const [first, ...rest] = line.split(/[-–:]/);
      if (rest.length > 0 && first.trim().length <= 20)
        return { time: first.trim(), detail: rest.join("-").trim() };
      return { time: `ช่วงที่ ${index + 1}`, detail: line };
    })
    .filter(Boolean) as ItineraryStep[];
}

function normalizeTourPayload(raw: any): Tour {
  return {
    id: String(raw?.id ?? ""),
    title: raw?.title ?? "",
    description: raw?.description ?? "",
    price: Number(raw?.price ?? 0),
    province: raw?.province ?? "",
    duration: raw?.duration ?? "",
    image_cover: raw?.image_cover ?? raw?.coverImage ?? raw?.image ?? "",
    images: raw?.images || [],
    category: raw?.category ?? "",
    child_price: raw?.child_price ? Number(raw.child_price) : undefined,
    max_group_size: raw?.max_group_size
      ? Number(raw.max_group_size)
      : undefined,
    highlights: raw?.highlights,
    preparation: raw?.preparation,
    itinerary: raw?.itinerary,
    itinerary_data: raw?.itinerary_data ?? raw?.itineraryData,
    included: raw?.included,
    excluded: raw?.excluded,
    conditions: raw?.conditions,
    rating: raw?.rating ? Number(raw.rating) : 0,
    review_count: raw?.review_count ? Number(raw.review_count) : 0,
    is_active: raw?.is_active ?? raw?.isActive ?? true,
  };
}

/* ─── Icons ─────────────────────────── */

const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

/* ─── Booking Sheet ──────────────────── */

function BookingSheet({
  tour,
  onClose,
  showToast,
}: {
  tour: Tour;
  onClose?: () => void;
  showToast: (msg: string, type: ToastType) => void;
}) {
  const api = axios.create({ baseURL: API_BASE_URL });
  const navigate = useNavigate();
  const isTourInactive = tour.is_active === false;

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(
    null,
  );
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const normalizePhone = (value: string) =>
    value.replace(/\D/g, "").slice(0, 10);

  useEffect(() => {
    if (isTourInactive) {
      setSchedules([]);
      setSelectedSchedule(null);
      setLoadingSchedules(false);
      return;
    }

    api
      .get(`/api/tours/${tour.id}/schedules`)
      .then((res) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const valid = (res.data || [])
          .filter((s: Schedule) => {
            const d = new Date(s.available_date);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          })
          .sort(
            (a: Schedule, b: Schedule) =>
              new Date(a.available_date).getTime() -
              new Date(b.available_date).getTime(),
          );
        setSchedules(valid);
      })
      .catch(() => setSchedules([]))
      .finally(() => setLoadingSchedules(false));
  }, [api, isTourInactive, tour.id]);

  useEffect(() => {
    const token =
      localStorage.getItem("jwt_token") || localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    const fillContactFromPayload = (payload: any) => {
      const d = payload || {};
      const p = d.profile || {};

      const firstName =
        d.first_name || d.firstName || p.first_name || p.firstName || "";
      const lastName =
        d.last_name || d.lastName || p.last_name || p.lastName || "";
      const fullName =
        d.full_name ||
        d.fullName ||
        `${firstName} ${lastName}`.trim() ||
        d.username ||
        "";
      const email = d.email || p.email || "";
      const phone = d.phone || p.phone || p.tel || "";

      if (!contactName && fullName) setContactName(fullName);
      if (!contactEmail && email) setContactEmail(email);
      if (!contactPhone && phone)
        setContactPhone(normalizePhone(String(phone)));
    };

    const prefillContact = async () => {
      try {
        const res = await api.get("/api/users/me", { headers });
        fillContactFromPayload(res.data);
      } catch {
        // Backward-compatible fallback in case /api/users/me is unavailable.
        try {
          const res = await api.get("/api/auth/profile", { headers });
          fillContactFromPayload(res.data);
        } catch {
          // Ignore prefill failures; user can still input manually.
        }
      }
    };

    void prefillContact();
  }, []);

  const childPrice = Math.floor(tour.price * 0.6);
  const pax = adults + children;
  const total = tour.price * adults + childPrice * children;
  const availableSeats = selectedSchedule?.available_seats ?? 0;
  const remainingCapacity = availableSeats - pax;
  const remaining = remainingCapacity;
  const visibleSchedules = schedules.filter(
    (s) => (s.available_seats ?? 0) > 0 && s.is_available !== false,
  );

  const handleBook = async () => {
    if (isTourInactive) {
      showToast("ทัวร์นี้ยังไม่พร้อมให้บริการ กรุณาติดต่อแอดมิน", "warning");
      return;
    }

    const token =
      localStorage.getItem("jwt_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedSchedule) {
      showToast("กรุณาเลือกวันที่เดินทาง", "warning");
      return;
    }
    if (pax < 1) {
      showToast("กรุณาเลือกจำนวนผู้เดินทาง", "warning");
      return;
    }
    if (pax > (selectedSchedule.available_seats ?? 0)) {
      showToast(
        `ที่นั่งไม่พอ! เหลือเพียง ${selectedSchedule.available_seats} ที่`,
        "error",
      );
      return;
    }
    if (!contactName || !contactEmail || !contactPhone) {
      showToast("กรุณากรอกข้อมูลติดต่อให้ครบ", "warning");
      return;
    }
    if (!/^\d{10}$/.test(contactPhone)) {
      showToast("เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(
        "/api/bookings",
        {
          tourId: tour.id,
          tourScheduleId: selectedSchedule.id,
          pax,
          numberOfTravelers: pax,
          contactInfo: {
            name: contactName,
            email: contactEmail,
            phone: contactPhone,
          },
          selectedOptions: { adults, children },
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const bookingId = res.data?.id || res.data?.data?.id;
      if (bookingId) {
        navigate(`/payment/${bookingId}`, { state: { amount: total } });
      } else {
        showToast(
          "จองสำเร็จ แต่ไม่พบรหัสการจอง กรุณาตรวจสอบในประวัติการจอง",
          "info",
        );
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "จองไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
      showToast(Array.isArray(msg) ? msg.join(" | ") : msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {showLoginModal && (
        <LoginRequiredModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            localStorage.setItem(
              "redirect_after_login",
              window.location.pathname,
            );
            navigate("/login");
          }}
        />
      )}

      <div className="bg-[#FBCB97] h-full overflow-y-auto px-6 py-6 pb-20 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 flex items-center justify-center text-[#5C341E] hover:bg-black/10 z-10"
          >
            <XIcon />
          </button>
        )}
        <div className="space-y-4">
          {/* Header */}
          <div>
            <p className="text-[#6D4229] text-[13px] font-bold tracking-wide">
              เริ่มต้น
            </p>
            <p className="text-[#5C341E] text-[38px] font-black mt-[-4px]">
              ฿{tour.price.toLocaleString()}
            </p>
          </div>

          <div className="h-[2px] bg-[#D6A97D] w-full" />

          {/* Schedule Select */}
          <div className="space-y-2">
            <h3 className="text-[#6D4229] text-[15px] font-bold tracking-wide mb-3">
              เลือกวันที่เดินทาง
            </h3>
            {loadingSchedules ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                <div className="w-8 h-8 border-3 border-[#FF8400] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 mt-2">
                  กำลังโหลดวันที่ว่าง...
                </p>
              </div>
            ) : schedules.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                <p className="text-[#6D4229] font-bold text-[14.5px]">
                  ไม่มีวันที่เปิดให้จองในขณะนี้
                </p>
                <p className="text-[#8c6b5d] text-[12px] mt-1.5">
                  กรุณาติดต่อเราเพื่อสอบถามเพิ่มเติม
                </p>
              </div>
            ) : visibleSchedules.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                <p className="text-[#6D4229] font-bold text-[14.5px]">
                  รอบนี้เต็มหมดแล้ว
                </p>
                <p className="text-[#8c6b5d] text-[12px] mt-1.5">
                  กรุณาเลือกทัวร์หรือวันที่อื่น
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {visibleSchedules.map((schedule) => {
                  const isSelected = selectedSchedule?.id === schedule.id;
                  const isFull =
                    (schedule.available_seats ?? 0) <= 0 ||
                    !schedule.is_available;
                  const dateStr = new Date(
                    schedule.available_date,
                  ).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    weekday: "short",
                  });
                  return (
                    <button
                      key={schedule.id}
                      type="button"
                      onClick={() => !isFull && setSelectedSchedule(schedule)}
                      disabled={isFull}
                      className={`w-full text-left border rounded-[14px] p-3.5 transition-all ${isSelected ? "border-[#FF8400] bg-white ring-2 ring-[#FF8400]/20 shadow-sm" : isFull ? "border-gray-200 bg-white/50 opacity-60 cursor-not-allowed" : "border-transparent bg-white shadow-sm hover:border-[#FF8400]/50"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p
                            className={`text-[14.5px] font-bold ${isSelected ? "text-[#FF8400]" : "text-[#5C341E]"}`}
                          >
                            {dateStr}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {isFull ? (
                              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                เต็มแล้ว
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#8c6b5d] font-medium">
                                เหลือ{" "}
                                <span className="text-[#FF8400] font-bold">
                                  {schedule.available_seats}
                                </span>{" "}
                                ที่
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-[18px] h-[18px] bg-[#FF8400] rounded-full flex items-center justify-center mt-1">
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pax Section Card */}
          <div className="bg-white rounded-[16px] border border-gray-100 p-4 pb-2 shadow-sm mt-4">
            {/* Adult */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex flex-col">
                <span className="text-[#5C341E] font-black text-[15px]">
                  ผู้ใหญ่
                </span>
                <span className="text-gray-400 font-medium text-[12px]">
                  ฿{tour.price.toLocaleString()} / คน
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAdults((n) => Math.max(1, n - 1))}
                  className="w-9 h-9 rounded-full border-[1.5px] border-gray-200 text-gray-500 flex items-center justify-center hover:border-gray-300 transition-colors active:scale-95"
                >
                  <span className="w-[11px] h-[2.5px] bg-gray-400 rounded-full"></span>
                </button>
                <span className="w-5 text-center font-black text-[17px] text-[#2C1A0E]">
                  {adults}
                </span>
                <button
                  onClick={() => setAdults((n) => (remaining > 0 ? n + 1 : n))}
                  className="w-9 h-9 rounded-full bg-[#FF8400] text-white flex items-center justify-center hover:bg-[#e07300] transition-colors active:scale-95 shadow-sm shadow-orange-200"
                >
                  <span className="relative flex items-center justify-center">
                    <span className="absolute w-[12px] h-[2.5px] bg-white rounded-full"></span>
                    <span className="absolute h-[12px] w-[2.5px] bg-white rounded-full"></span>
                  </span>
                </button>
              </div>
            </div>

            {/* Child */}
            <div className="flex items-center justify-between pt-3 pb-2">
              <div className="flex flex-col">
                <span className="text-[#5C341E] font-black text-[15px]">
                  เด็ก
                </span>
                <span className="text-gray-400 font-medium text-[12px]">
                  ฿{childPrice.toLocaleString()} / คน
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setChildren((n) => Math.max(0, n - 1))}
                  className="w-9 h-9 rounded-full border-[1.5px] border-gray-200 text-gray-500 flex items-center justify-center hover:border-gray-300 transition-colors active:scale-95"
                >
                  <span className="w-[11px] h-[2.5px] bg-gray-400 rounded-full"></span>
                </button>
                <span className="w-5 text-center font-black text-[17px] text-[#2C1A0E]">
                  {children}
                </span>
                <button
                  onClick={() =>
                    setChildren((n) => (remaining > 0 ? n + 1 : n))
                  }
                  className="w-9 h-9 rounded-full bg-[#FF8400] text-white flex items-center justify-center hover:bg-[#e07300] transition-colors active:scale-95 shadow-sm shadow-orange-200"
                >
                  <span className="relative flex items-center justify-center">
                    <span className="absolute w-[12px] h-[2.5px] bg-white rounded-full"></span>
                    <span className="absolute h-[12px] w-[2.5px] bg-white rounded-full"></span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="h-[2px] bg-[#D6A97D] w-full mt-2" />

          {/* Price Summary */}
          <div className="bg-[#F8E1CA] rounded-[18px] p-[22px] space-y-3.5">
            <div className="flex justify-between font-bold text-[#5C341E] text-[15px]">
              <span>ผู้ใหญ่</span>
              <span>
                {adults > 0
                  ? `${(tour.price * adults).toLocaleString()} ฿`
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#5C341E] text-[15px]">
              <span>เด็ก</span>
              <span>
                {children > 0
                  ? `${(childPrice * children).toLocaleString()} ฿`
                  : "-"}
              </span>
            </div>
            <div className="h-px bg-[#E2BE9C] w-full" />
            <div className="flex justify-between font-black text-[#5C341E] text-[17px]">
              <span>รวม</span>
              <span>{total.toLocaleString()} ฿</span>
            </div>
          </div>

          <button
            onClick={handleBook}
            disabled={submitting}
            className="w-full bg-[#FF8100] hover:bg-[#E67400] text-white font-black py-3.5 rounded-xl text-2xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
          >
            {submitting ? "กำลังดำเนินการ..." : "จอง"}
          </button>

          <div className="h-[2px] bg-[#D6A97D] w-full mt-4 mb-2" />

          {/* Free Cancel */}
          <div className="pt-2">
            <p className="text-[#5C341E] font-black text-xl mb-3">ยกเลิกฟรี</p>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <svg
                  className="w-6 h-6 text-[#5C341E]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <path d="M9 16l2 2 4-4"></path>
                </svg>
              </div>
              <p className="text-[#5C341E] font-bold text-[14.5px] leading-[1.4]">
                ยกเลิกได้ล่วงหน้าสูงสุด 24 ชั่วโมงเพื่อ
                <br className="hidden sm:block" />
                รับเงินคืนเต็มจำนวน
              </p>
            </div>
          </div>

          {/* Contact Details (Minimal/Hidden visually to match design, but required for API) */}
          <div className="pt-8 space-y-2 opacity-50 hover:opacity-100 transition-opacity focus-within:opacity-100">
            <label className="text-[11px] font-bold text-[#8c6b5d] uppercase tracking-wider block">
              -- ข้อมูลติดต่อสำหรับการสั่งจอง --
            </label>
            {[
              {
                type: "text",
                placeholder: "ชื่อ-นามสกุล",
                value: contactName,
                onChange: setContactName,
              },
              {
                type: "email",
                placeholder: "อีเมล",
                value: contactEmail,
                onChange: setContactEmail,
              },
              {
                type: "tel",
                placeholder: "เบอร์โทรศัพท์ (10 หลัก)",
                value: contactPhone,
                onChange: setContactPhone,
                maxLength: 10,
              },
            ].map((f, i) => (
              <input
                key={i}
                type={f.type}
                placeholder={f.placeholder}
                value={f.value}
                onChange={(e) =>
                  f.onChange(
                    f.type === "tel"
                      ? normalizePhone(e.target.value)
                      : e.target.value,
                  )
                }
                inputMode={f.type === "tel" ? "numeric" : undefined}
                maxLength={f.maxLength}
                className="w-full bg-white/60 border border-[#E9C39B] rounded-lg px-3 py-2 text-sm text-[#5C341E] focus:outline-none focus:bg-white placeholder:text-[#ab9083]"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main Page ──────────────────────── */

export default function TourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState<Tour | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [showUnavailableModal, setShowUnavailableModal] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const allImages = tour ? [tour.image_cover, ...(tour.images || [])] : [];

  const preparation = tour ? parsePreparation(tour.preparation) : [];
  const highlights = tour ? parseTextList(tour.highlights) : [];
  const includedItems = tour ? parseTextList(tour.included) : [];
  const excludedItems = tour ? parseTextList(tour.excluded) : [];
  const conditionItems = tour ? parseTextList(tour.conditions) : [];
  const itinerary = parseItinerary(tour?.itinerary_data, tour?.itinerary);
  const isTourInactive = tour?.is_active === false;

  useEffect(() => {
    if (!id) return;
    axios
      .get(`${API_BASE_URL}/api/tours/${id}`)
      .then((res) => {
        const normalizedTour = normalizeTourPayload(
          res?.data?.data ?? res?.data,
        );
        setTour(normalizedTour);
        setShowUnavailableModal(normalizedTour.is_active === false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    axios
      .get(`${API_BASE_URL}/api/reviews/tour/${id}`)
      .then((res) => {
        const p = res?.data;
        setReviews(Array.isArray(p) ? p : Array.isArray(p?.data) ? p.data : []);
      })
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  useEffect(() => {
    document.body.style.overflow =
      sheetOpen || activeImageIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen, activeImageIndex]);

  useEffect(() => {
    if (!isTourInactive) return;
    setSheetOpen(false);
  }, [isTourInactive]);

  const closeUnavailableModal = () => {
    setShowUnavailableModal(false);
    navigate("/tours", { replace: true });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap');
        .tour-detail * { font-family: 'Prompt', sans-serif; }
        .hero-gradient { background: linear-gradient(to top, rgba(30,10,0,0.85) 0%, rgba(30,10,0,0.3) 50%, transparent 100%); }
        .sheet-overlay { animation: fadeIn 0.25s ease; }
        .sheet-panel   { animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1); }
        @keyframes fadeIn  { from { opacity: 0; }               to { opacity: 1; }             }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes toastIn { from { opacity: 0; transform: translate(-50%, -16px); } to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes popIn   { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .section-card { background: white; border-radius: 20px; padding: 20px; box-shadow: 0 1px 8px rgba(44,26,14,0.06); }
      `}</style>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {showUnavailableModal && (
        <TourUnavailableModal onClose={closeUnavailableModal} />
      )}

      <div className="tour-detail min-h-screen bg-[#F5F0EB]">
        <Navbar activePage="tours" />

        {loading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-[#FF8400] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-500">กำลังโหลด...</p>
            </div>
          </div>
        ) : error || !tour ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-5xl">😕</p>
              <p className="text-lg font-bold text-gray-700">
                ไม่พบข้อมูลทัวร์นี้
              </p>
              <Link to="/" className="text-sm text-[#FF8400] hover:underline">
                ← กลับหน้าหลัก
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Hero */}
            <div className="relative w-full h-[55vw] min-h-[240px] max-h-[480px] overflow-hidden">
              <img
                src={getImageUrl(tour.image_cover)}
                alt={tour.title}
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setActiveImageIndex(0)}
              />
              <div className="hero-gradient absolute inset-0" />
              <Link
                to="/tours"
                className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
                <span className="inline-block text-xs bg-[#FF8400] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wide mb-2">
                  {getCategoryLabel(tour.category)}
                </span>
                <h1 className="text-white text-xl md:text-3xl font-black leading-tight drop-shadow-lg">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { Icon: MapPinIcon, text: tour.province },
                    { Icon: ClockIcon, text: getDurationLabel(tour.duration) },
                    ...(tour.max_group_size
                      ? [
                          {
                            Icon: UsersIcon,
                            text: `สูงสุด ${tour.max_group_size} คน`,
                          },
                        ]
                      : []),
                  ].map(({ Icon, text }, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-white/90 text-xs font-medium bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-full"
                    >
                      <Icon /> {text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-5 pb-28 md:pb-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left */}
                <div className="lg:col-span-2 space-y-4">
                  {highlights.length > 0 && (
                    <div className="section-card bg-gradient-to-br from-white to-orange-50/40 border border-orange-100">
                      <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                        ไฮไลต์ของทัวร์
                      </h2>
                      <ul className="grid sm:grid-cols-2 gap-2.5">
                        {highlights.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-700 bg-white border border-orange-100 rounded-lg px-3 py-2"
                          >
                            ✨ {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {tour.description && (
                    <div className="section-card">
                      <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                        รายละเอียดทัวร์
                      </h2>
                      <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                        {tour.description}
                      </p>
                    </div>
                  )}

                  {itinerary.length > 0 && (
                    <div className="section-card">
                      <h2 className="text-base font-black text-[#2C1A0E] mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                        กำหนดการเดินทาง
                      </h2>
                      <div className="relative pl-8 space-y-3 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:rounded-full before:bg-[#FF8400]/20">
                        {itinerary.map((item, i) => (
                          <div
                            key={i}
                            className="relative rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50/40 to-white p-3.5"
                          >
                            <span className="absolute -left-8 top-4 h-4 w-4 rounded-full bg-[#FF8400] border-2 border-white shadow-[0_0_0_3px_rgba(255,132,0,0.25)]" />
                            <p className="text-[11px] font-extrabold text-[#FF8400] uppercase tracking-wide mb-1">
                              {item.time}
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {item.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {preparation.length > 0 && (
                    <div className="section-card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                      <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                        การเตรียมตัวก่อนเดินทาง
                      </h2>
                      <ul className="grid sm:grid-cols-2 gap-2.5">
                        {preparation.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-sm text-gray-600"
                          >
                            <span className="w-5 h-5 rounded-full bg-[#FF8400]/15 text-[#FF8400] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(includedItems.length > 0 || excludedItems.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {includedItems.length > 0 && (
                        <div className="section-card border border-green-100 bg-green-50/30">
                          <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-green-500 rounded-full inline-block" />
                            สิ่งที่รวมในแพ็กเกจ
                          </h2>
                          <ul className="space-y-2">
                            {includedItems.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-gray-700 flex items-start gap-2"
                              >
                                <span className="text-green-600 font-bold">
                                  ✓
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {excludedItems.length > 0 && (
                        <div className="section-card border border-red-100 bg-red-50/30">
                          <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                            <span className="w-1 h-5 bg-red-500 rounded-full inline-block" />
                            สิ่งที่ไม่รวม
                          </h2>
                          <ul className="space-y-2">
                            {excludedItems.map((item, i) => (
                              <li
                                key={i}
                                className="text-sm text-gray-700 flex items-start gap-2"
                              >
                                <span className="text-red-500 font-bold">
                                  ✕
                                </span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {conditionItems.length > 0 && (
                    <div className="section-card border border-gray-200">
                      <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                        เงื่อนไขการเดินทาง
                      </h2>
                      <ul className="space-y-2">
                        {conditionItems.map((item, i) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 leading-relaxed"
                          >
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Reviews */}
                  <div className="section-card border border-[#F0E8E0]">
                    <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                      รีวิวจากนักท่องเที่ยว
                    </h2>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl font-black text-[#FF8400]">
                        {(tour.rating ?? 0).toFixed(1)}
                      </span>
                      <span className="text-sm text-[#4F200D]/60">
                        จาก {tour.review_count ?? 0} รีวิว
                      </span>
                    </div>
                    {reviewsLoading ? (
                      <p className="text-sm text-[#4F200D]/55">
                        กำลังโหลดรีวิว...
                      </p>
                    ) : reviews.length === 0 ? (
                      <p className="text-sm text-[#4F200D]/55">
                        ยังไม่มีรีวิวสำหรับทัวร์นี้
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {reviews.map((review) => {
                          const name =
                            review.user?.full_name ||
                            [review.user?.first_name, review.user?.last_name]
                              .filter(Boolean)
                              .join(" ") ||
                            review.user?.username ||
                            "ผู้ใช้งาน";
                          return (
                            <div
                              key={review.id}
                              className="rounded-xl border border-[#F0E8E0] bg-[#FFFCF8] px-4 py-3"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-bold text-[#4F200D]">
                                  {name}
                                </p>
                                <p className="text-xs text-[#4F200D]/45">
                                  {new Date(
                                    review.createdAt,
                                  ).toLocaleDateString("th-TH")}
                                </p>
                              </div>
                              <p className="text-sm text-[#FF8400] mt-1">
                                {"★".repeat(
                                  Math.max(
                                    1,
                                    Math.min(5, Number(review.rating || 0)),
                                  ),
                                )}
                              </p>
                              {review.comment && (
                                <p className="text-sm text-[#4F200D]/75 mt-2 leading-relaxed">
                                  {review.comment}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Gallery */}
                  {tour.images && tour.images.length > 0 && (
                    <div className="section-card mt-4 border border-gray-100">
                      <h2 className="text-base font-black text-[#2C1A0E] mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-[#FF8400] rounded-full inline-block" />
                        รูปภาพเพิ่มเติม
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {tour.images.map((img, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in"
                            onClick={() => setActiveImageIndex(i + 1)}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt={`รูปเพิ่มเติม ${i + 1}`}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Desktop Booking */}
                <div className="hidden lg:block lg:col-span-1">
                  {isTourInactive ? (
                    <div className="sticky top-20 rounded-2xl overflow-hidden shadow-xl border border-red-100 bg-white p-6">
                      <p className="text-sm font-black text-[#2C1A0E]">
                        ทัวร์นี้ยังไม่พร้อมให้บริการ
                      </p>
                      <p className="text-sm text-[#4F200D]/60 mt-2 leading-relaxed">
                        กรุณาติดต่อแอดมินเพื่อสอบถามรายละเอียดเพิ่มเติม
                      </p>
                    </div>
                  ) : (
                    <div className="sticky top-20 rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                      <BookingSheet tour={tour} showToast={showToast} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile sticky CTA */}
            {!isTourInactive && (
              <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 shadow-2xl shadow-black/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">ราคาเริ่มต้น</p>
                    <p className="text-xl font-black text-[#FF8400]">
                      ฿{tour.price.toLocaleString()}
                      <span className="text-xs font-normal text-gray-400 ml-1">
                        / คน
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSheetOpen(true)}
                    className="flex-1 max-w-[180px] bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-orange-200 active:scale-[0.97] transition-all"
                  >
                    จองทัวร์เลย →
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Bottom Sheet */}
            {sheetOpen && !isTourInactive && (
              <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                <div
                  className="sheet-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setSheetOpen(false)}
                />
                <div className="sheet-panel relative bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
                  <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <BookingSheet
                      tour={tour}
                      onClose={() => setSheetOpen(false)}
                      showToast={showToast}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeImageIndex !== null && (
          <Lightbox
            images={allImages}
            initialIndex={activeImageIndex}
            onClose={() => setActiveImageIndex(null)}
          />
        )}

        <Footer />
      </div>
    </>
  );
}
