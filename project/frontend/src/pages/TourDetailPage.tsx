import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
}

/* ─── Helpers ───────────────────────── */

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

  return raw
    .split(/\n|,|•|\u2022|;/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseItinerary(
  rawStructured?: ItineraryStep[] | null,
  rawText?: string,
): ItineraryStep[] {
  if (Array.isArray(rawStructured) && rawStructured.length > 0) {
    return rawStructured.filter((item) => item?.detail);
  }

  if (!rawText) return [];

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const [first, ...rest] = line.split(/[-–:]/);
    if (rest.length > 0 && first.trim().length <= 20) {
      return { time: first.trim(), detail: rest.join("-").trim() };
    }
    return { time: `ช่วงที่ ${index + 1}`, detail: line };
  });
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

/* ─── Booking Sheet (Mobile bottom sheet + Desktop sidebar) ── */

function BookingSheet({ tour, onClose }: { tour: Tour; onClose?: () => void }) {
  const baseURL = "http://localhost:3000";
  const api = axios.create({ baseURL });
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

  // Fetch tour schedules
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoadingSchedules(true);
        const res = await api.get(`/api/v1/tours/${tour.id}/schedules`);
        const data = res.data || [];
        // Filter out past dates and sort by date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const validSchedules = data
          .filter((s: Schedule) => {
            const scheduleDate = new Date(s.available_date);
            scheduleDate.setHours(0, 0, 0, 0);
            return scheduleDate >= today;
          })
          .sort(
            (a: Schedule, b: Schedule) =>
              new Date(a.available_date).getTime() -
              new Date(b.available_date).getTime(),
          );
        setSchedules(validSchedules);
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };
    fetchSchedules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour.id]);

  // Prefill contact info from logged-in user
  useEffect(() => {
    const token =
      localStorage.getItem("jwt_token") || localStorage.getItem("token");
    if (!token) return;
    api
      .get("/auth/profile", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const d = res.data || {};
        const p = d.profile || {};
        if (!contactName)
          setContactName(d.full_name || p.full_name || d.username || "");
        if (!contactEmail) setContactEmail(d.email || p.email || "");
        if (!contactPhone) setContactPhone(p.phone || p.tel || "");
      })
      .catch(() => {});
  }, []);

  const childPrice = Math.floor(tour.price * 0.6);
  const pax = adults + children;
  const total = tour.price * adults + childPrice * children;

  // Schedule-based capacity (one-day tours)
  const availableSeats = selectedSchedule?.available_seats ?? 0;
  const remainingCapacity = availableSeats - pax;
  const visibleSchedules = schedules.filter(
    (s) => (s.available_seats ?? 0) > 0 && s.is_available !== false,
  );

  const remaining = remainingCapacity;

  const Counter = ({
    label,
    value,
    onDec,
    onInc,
    sub,
  }: {
    label: string;
    value: number;
    onDec: () => void;
    onInc: () => void;
    sub?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-[#2C1A0E]">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec}
          className="w-8 h-8 rounded-full border-2 border-gray-200 text-gray-500 font-bold flex items-center justify-center hover:border-[#FF8400] hover:text-[#FF8400] transition-colors active:scale-95"
        >
          −
        </button>
        <span className="w-6 text-center text-base font-bold text-[#2C1A0E]">
          {value}
        </span>
        <button
          onClick={onInc}
          className="w-8 h-8 rounded-full bg-[#FF8400] text-white font-bold flex items-center justify-center hover:bg-[#e07300] transition-colors active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white h-full overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF8400] to-[#FF6B00] px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
            ราคาเริ่มต้น
          </p>
          <p className="text-white text-2xl font-black">
            ฿{tour.price.toLocaleString()}
            <span className="text-sm font-normal ml-1">/ คน</span>
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <XIcon />
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Schedule Selection */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            เลือกวันที่เดินทาง
          </label>
          {loadingSchedules ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-3 border-[#FF8400] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-gray-500 mt-2">
                กำลังโหลดวันที่ว่าง...
              </p>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">
                ไม่มีวันที่เปิดให้จองในขณะนี้
              </p>
              <p className="text-xs text-gray-400 mt-1">
                กรุณาติดต่อเราเพื่อสอบถามเพิ่มเติม
              </p>
            </div>
          ) : visibleSchedules.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-500">รอบนี้เต็มหมดแล้ว</p>
              <p className="text-xs text-gray-400 mt-1">
                กรุณาเลือกทัวร์หรือวันที่อื่น
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {visibleSchedules.map((schedule) => {
                const date = new Date(schedule.available_date);
                const isSelected = selectedSchedule?.id === schedule.id;
                const isFull =
                  (schedule.available_seats ?? 0) <= 0 ||
                  !schedule.is_available;
                const dateStr = date.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "short",
                });
                const seatCount = schedule.available_seats ?? 0;
                return (
                  <button
                    key={schedule.id}
                    type="button"
                    onClick={() => !isFull && setSelectedSchedule(schedule)}
                    disabled={isFull}
                    className={`w-full text-left border-2 rounded-lg p-3 transition-all ${
                      isSelected
                        ? "border-[#FF8400] bg-orange-50"
                        : isFull
                          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                          : "border-gray-200 hover:border-[#FF8400] hover:bg-orange-50/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${isSelected ? "text-[#FF8400]" : "text-[#2C1A0E]"}`}
                        >
                          {dateStr}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {isFull ? (
                            <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded">
                              เต็มแล้ว
                            </span>
                          ) : (
                            <span className="text-xs text-gray-600">
                              เหลือ{" "}
                              <span className="font-semibold text-[#FF8400]">
                                {seatCount}
                              </span>{" "}
                              ที่
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-[#FF8400] rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
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
          {selectedSchedule && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-semibold text-green-800">
                ✓ เลือกวันที่แล้ว
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                {new Date(selectedSchedule.available_date).toLocaleDateString(
                  "th-TH",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-200">
                <span className="text-xs text-green-700">ที่นั่งว่าง:</span>
                <span className="text-sm font-bold text-green-800">
                  {selectedSchedule.available_seats} ที่
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Capacity Warning */}
        {selectedSchedule && pax > 0 && (
          <div
            className={`p-3 rounded-lg border ${
              remainingCapacity < 0
                ? "bg-red-50 border-red-200"
                : remainingCapacity <= 3
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-blue-50 border-blue-200"
            }`}
          >
            {remainingCapacity < 0 ? (
              <>
                <p className="text-xs font-semibold text-red-800">
                  ⚠️ เกินจำนวนที่นั่งว่าง!
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  คุณเลือก {pax} คน แต่เหลือเพียง {availableSeats} ที่เท่านั้น
                </p>
              </>
            ) : remainingCapacity <= 3 ? (
              <>
                <p className="text-xs font-semibold text-yellow-800">
                  ⚠️ ที่นั่งใกล้เต็ม!
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  หลังจองจะเหลือเพียง {remainingCapacity} ที่
                </p>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-blue-800">
                  ✓ ที่นั่งเพียงพอ
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  หลังจองจะเหลือ {remainingCapacity} ที่
                </p>
              </>
            )}
          </div>
        )}

        {/* Counters */}
        <div className="border-2 border-gray-100 rounded-xl px-4 divide-y divide-gray-100">
          <Counter
            label="ผู้ใหญ่"
            sub={`฿${tour.price.toLocaleString()} / คน`}
            value={adults}
            onDec={() => setAdults((n) => Math.max(1, n - 1))}
            onInc={() => setAdults((n) => (remaining > 0 ? n + 1 : n))}
          />
          <Counter
            label="เด็ก"
            sub={`฿${childPrice.toLocaleString()} / คน`}
            value={children}
            onDec={() => setChildren((n) => Math.max(0, n - 1))}
            onInc={() => setChildren((n) => (remaining > 0 ? n + 1 : n))}
          />
        </div>

        {/* Price Summary */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 space-y-2">
          {adults > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ผู้ใหญ่ {adults} คน</span>
              <span className="font-semibold">
                ฿{(tour.price * adults).toLocaleString()}
              </span>
            </div>
          )}
          {children > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">เด็ก {children} คน</span>
              <span className="font-semibold">
                ฿{(childPrice * children).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>ผู้เดินทางรวม</span>
            <span>
              {pax} คน
              {selectedSchedule && (
                <span
                  className={
                    remainingCapacity < 0 ? "text-red-500 font-semibold" : ""
                  }
                >
                  {" "}
                  (จาก {availableSeats} ที่)
                </span>
              )}
            </span>
          </div>
          <div className="border-t border-amber-200 pt-2 flex justify-between font-black text-[#2C1A0E]">
            <span>รวมทั้งหมด</span>
            <span className="text-[#FF8400] text-lg">
              ฿{total.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
            ข้อมูลติดต่อ
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
              placeholder: "เบอร์โทรศัพท์",
              value: contactPhone,
              onChange: setContactPhone,
            },
          ].map((f, i) => (
            <input
              key={i}
              type={f.type}
              placeholder={f.placeholder}
              value={f.value}
              onChange={(e) => f.onChange(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#FF8400] bg-gray-50 transition-colors placeholder:text-gray-300"
            />
          ))}
        </div>

        {/* Book Button */}
        <button
          onClick={async () => {
            if (!selectedSchedule) return alert("กรุณาเลือกวันที่เดินทาง");
            if (!pax || pax < 1) return alert("กรุณาเลือกจำนวนผู้เดินทาง");
            const seats = selectedSchedule.available_seats ?? 0;
            if (pax > seats)
              return alert(`ที่นั่งไม่พอ! เหลือเพียง ${seats} ที่`);
            if (!contactName || !contactEmail || !contactPhone)
              return alert("กรุณากรอกข้อมูลติดต่อให้ครบ");
            const token =
              localStorage.getItem("jwt_token") ||
              localStorage.getItem("token") ||
              localStorage.getItem("accessToken");
            if (!token) return alert("กรุณาเข้าสู่ระบบก่อนจองทัวร์");
            const payload = {
              tourId: tour.id,
              tourScheduleId: selectedSchedule.id,
              pax,
              contactInfo: {
                name: contactName,
                email: contactEmail,
                phone: contactPhone,
              },
            };
            try {
              setSubmitting(true);
              await api.post("/api/v1/bookings", payload, {
                headers: { Authorization: `Bearer ${token}` },
              });
              alert("จองสำเร็จ! กรุณาชำระเงินตามขั้นตอนที่ได้รับ");
              setChildren(0);
              setAdults(1);
              setSelectedSchedule(null);
            } catch (err: any) {
              const msg = err?.response?.data?.message || "จองไม่สำเร็จ";
              alert(Array.isArray(msg) ? msg.join("\n") : msg);
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting || !selectedSchedule}
          className="w-full bg-gradient-to-r from-[#FF8400] to-[#FF6B00] text-white font-black py-4 rounded-xl transition-all text-base shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] hover:shadow-xl hover:shadow-orange-200"
        >
          {submitting ? "กำลังจอง..." : "จองทัวร์เลย →"}
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          มีคำถาม? ติดต่อเราได้เลย ☎️
        </p>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────── */

export default function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const preparation = tour ? parsePreparation(tour.preparation) : [];
  const highlights = tour ? parseTextList(tour.highlights) : [];
  const includedItems = tour ? parseTextList(tour.included) : [];
  const excludedItems = tour ? parseTextList(tour.excluded) : [];
  const conditionItems = tour ? parseTextList(tour.conditions) : [];
  const itinerary = parseItinerary(tour?.itinerary_data, tour?.itinerary);

  useEffect(() => {
    if (id) {
      axios
        .get(`http://localhost:3000/api/v1/tours/${id}`)
        .then((res) => {
          const payload = res?.data?.data ?? res?.data;
          setTour(normalizeTourPayload(payload));
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Lock scroll when sheet open
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700;800;900&display=swap');
        .tour-detail * { font-family: 'Prompt', sans-serif; }
        .hero-gradient {
          background: linear-gradient(to top, rgba(30,10,0,0.85) 0%, rgba(30,10,0,0.3) 50%, transparent 100%);
        }
        .sheet-overlay {
          animation: fadeIn 0.25s ease;
        }
        .sheet-panel {
          animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1);
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .section-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 1px 8px rgba(44,26,14,0.06);
        }
      `}</style>

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
            {/* ── Hero Image (full-bleed, title overlay) ── */}
            <div className="relative w-full h-[55vw] min-h-[240px] max-h-[480px] overflow-hidden">
              <img
                src={tour.image_cover}
                alt={tour.title}
                className="w-full h-full object-cover"
              />
              <div className="hero-gradient absolute inset-0" />

              {/* Back button */}
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

              {/* Title overlaid on image */}
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
                <span className="inline-block text-xs bg-[#FF8400] text-white px-3 py-1 rounded-full font-bold uppercase tracking-wide mb-2">
                  {tour.category}
                </span>
                <h1 className="text-white text-xl md:text-3xl font-black leading-tight drop-shadow-lg">
                  {tour.title}
                </h1>
                <div className="flex flex-wrap gap-3 mt-2">
                  {[
                    { Icon: MapPinIcon, text: tour.province },
                    { Icon: ClockIcon, text: tour.duration },
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

            {/* ── Content + Sidebar ── */}
            <div className="max-w-7xl mx-auto px-4 py-5 pb-28 md:pb-8">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* ── Left: Content ── */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Highlights */}
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

                  {/* Description */}
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

                  {/* Itinerary */}
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

                  {/* Preparation */}
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
                </div>

                {/* ── Right: Booking (Desktop only) ── */}
                <div className="hidden lg:block lg:col-span-1">
                  <div className="sticky top-20 rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                    <BookingSheet tour={tour} />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Mobile: Sticky Bottom CTA ── */}
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

            {/* ── Mobile: Bottom Sheet ── */}
            {sheetOpen && (
              <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
                {/* Backdrop */}
                <div
                  className="sheet-overlay absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setSheetOpen(false)}
                />
                {/* Panel */}
                <div className="sheet-panel relative bg-white rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Handle */}
                  <div className="flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                  </div>
                  <div className="overflow-y-auto flex-1">
                    <BookingSheet
                      tour={tour}
                      onClose={() => setSheetOpen(false)}
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <Footer />
      </div>
    </>
  );
}
