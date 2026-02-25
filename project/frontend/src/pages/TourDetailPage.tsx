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
  max_group_size?: number;
  preparation?: string[] | string;
  itinerary_data?: ItineraryStep[];
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

/* ─── SVG Icons ─────────────────────── */

const MapPinIcon = ({ className = "" }: { className?: string }) => (
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
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
  </svg>
);

const ClockIcon = ({ className = "" }: { className?: string }) => (
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
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const UsersIcon = ({ className = "" }: { className?: string }) => (
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
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const PhoneIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
  </svg>
);

const MailIcon = ({ size = 12 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
    <path d="M3 7l9 6l9 -6" />
  </svg>
);

/* ─── Cover Image ───────────────────── */

function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full h-72 md:h-96 overflow-hidden rounded-xl bg-gray-100">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

/* ─── Booking Card ─────────────────── */

function parseDurationDays(duration?: string): number {
  if (!duration) return 1;
  const match = duration.match(/(\d+)/);
  const days = match ? Number(match[1]) : 1;
  return Number.isFinite(days) && days > 0 ? days : 1;
}

function BookingCard({ tour }: { tour: Tour }) {
  const rawBase = "http://localhost:3000";
  const baseURL = rawBase.replace(/\/$/, "").replace(/\/api\/v1$/, "");

  const api = axios.create({
    baseURL,
  });
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
      localStorage.getItem("jwt_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken");
    if (!token) return;

    api
      .get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = res.data || {};
        const profile = data.profile || {};
        if (
          !contactName &&
          (data.full_name || profile.full_name || data.username)
        ) {
          setContactName(
            data.full_name || profile.full_name || data.username || "",
          );
        }
        if (!contactEmail && (data.email || profile.email)) {
          setContactEmail(data.email || profile.email || "");
        }
        if (!contactPhone && (profile.phone || profile.tel)) {
          setContactPhone(profile.phone || profile.tel || "");
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const childPrice = Math.floor(tour.price * 0.6);
  const pax = adults + children;
  const total = tour.price * adults + childPrice * children;

  // Use selected schedule's available seats for capacity validation
  const availableSeats = selectedSchedule?.available_seats ?? 0;
  const remainingCapacity = availableSeats - pax;

  const visibleSchedules = schedules.filter(
    (s) => (s.available_seats ?? 0) > 0 && s.is_available !== false,
  );

  const Counter = ({
    label,
    value,
    onDec,
    onInc,
    subLabel,
  }: {
    label: string;
    value: number;
    onDec: () => void;
    onInc: () => void;
    subLabel?: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-[#2C1A0E]">{label}</p>
        {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec}
          className="w-7 h-7 rounded border border-gray-300 text-gray-600 font-bold text-base flex items-center justify-center hover:border-[#FF8400] hover:text-[#FF8400] transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          onClick={onInc}
          className="w-7 h-7 rounded bg-[#FF8400] text-white font-bold text-base flex items-center justify-center hover:bg-[#e07300] transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div
      className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg"
      data-component-name="BookingCard"
    >
      {/* Price Header */}
      <div className="bg-[#FF8400] px-5 py-4">
        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
          ราคาเริ่มต้น
        </p>
        <p className="text-white text-3xl font-black mt-0.5">
          ฿{tour.price.toLocaleString()}
          <span className="text-base font-normal ml-1">/ คน</span>
        </p>
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
                const availableSeats = schedule.available_seats ?? 0;

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
                                {availableSeats}
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
        <div className="border border-gray-100 rounded-lg px-4 divide-y divide-gray-100">
          <Counter
            label="ผู้ใหญ่"
            subLabel={`฿${tour.price.toLocaleString()} / คน`}
            value={adults}
            onDec={() => setAdults((n) => Math.max(1, n - 1))}
            onInc={() => setAdults((n) => (remainingCapacity > 0 ? n + 1 : n))}
          />
          <Counter
            label="เด็ก"
            subLabel={`฿${childPrice.toLocaleString()} / คน`}
            value={children}
            onDec={() => setChildren((n) => Math.max(0, n - 1))}
            onInc={() =>
              setChildren((n) => (remainingCapacity > 0 ? n + 1 : n))
            }
          />
        </div>

        {/* Price Summary */}
        <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-1.5 border border-amber-100">
          {adults > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ผู้ใหญ่ {adults} คน</span>
              <span className="font-medium">
                ฿{(tour.price * adults).toLocaleString()}
              </span>
            </div>
          )}
          {children > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">เด็ก {children} คน</span>
              <span className="font-medium">
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
          <div className="border-t border-amber-200 pt-1.5 flex justify-between font-bold text-[#2C1A0E]">
            <span>รวมทั้งหมด</span>
            <span className="text-[#FF8400]">฿{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Contact info */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">
            ข้อมูลติดต่อ
          </label>
          <input
            type="text"
            placeholder="ชื่อ-สกุล"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF8400] focus:ring-1 focus:ring-[#FF8400] bg-white"
          />
          <input
            type="email"
            placeholder="อีเมล"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF8400] focus:ring-1 focus:ring-[#FF8400] bg-white"
          />
          <input
            type="tel"
            placeholder="เบอร์โทร"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF8400] focus:ring-1 focus:ring-[#FF8400] bg-white"
          />
        </div>

        {/* Book Button */}
        <button
          onClick={async () => {
            if (!selectedSchedule) return alert("กรุณาเลือกวันที่เดินทาง");
            if (!pax || pax < 1) return alert("กรุณาเลือกจำนวนผู้เดินทาง");

            const availableSeats = selectedSchedule.available_seats ?? 0;
            if (pax > availableSeats) {
              return alert(`ที่นั่งไม่พอ! เหลือเพียง ${availableSeats} ที่`);
            }

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
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              alert("จองสำเร็จ! กรุณาชำระเงินตามขั้นตอนที่ได้รับ");
              // reset
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
          className="w-full bg-[#FF8400] hover:bg-[#e07300] active:scale-[0.98] text-white font-bold py-3.5 rounded-lg transition-all text-sm shadow-md shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "กำลังจอง..." : "จองทัวร์เลย →"}
        </button>

        {/* Contact */}
        <div className="text-center space-y-1.5 pt-1">
          <p className="text-xs text-gray-400">ต้องการสอบถามเพิ่มเติม?</p>
          <p className="text-xs text-[#FF8400] font-semibold">
            สอบถามเพิ่มเติม
          </p>
          <p className="text-xs text-gray-500">
            ติดต่อเราได้เลย เพื่อรับส่วนลดพิเศษ
          </p>
          <div className="flex gap-2 pt-1">
            <button className="flex-1 border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:border-[#FF8400] hover:text-[#FF8400] transition-colors flex items-center justify-center gap-1.5">
              <PhoneIcon size={12} /> โทร
            </button>
            <button className="flex-1 border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:border-[#FF8400] hover:text-[#FF8400] transition-colors flex items-center justify-center gap-1.5">
              <MailIcon size={12} /> อีเมล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Content ─────────────────── */

function MainContent({ tour }: { tour: Tour }) {
  const preparation = parsePreparation(tour.preparation);
  const itinerary = tour.itinerary_data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
        <Link to="/" className="hover:text-[#FF8400]">
          หน้าหลัก
        </Link>
        <span>/</span>
        <Link to="/tours" className="hover:text-[#FF8400]">
          ทัวร์ทั้งหมด
        </Link>
        <span>/</span>
        <span className="text-[#FF8400] font-medium truncate max-w-48">
          {tour.title}
        </span>
      </nav>

      {/* Back Button */}
      <Link
        to="/tours"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium text-[#4F200D] hover:text-[#FF8400] transition-colors group"
      >
        <span className="w-7 h-7 rounded-full border border-[#4F200D]/20 flex items-center justify-center group-hover:border-[#FF8400] group-hover:bg-[#FF8400] group-hover:text-white transition-all">
          ←
        </span>
        กลับหน้าทัวร์
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left (2/3) ── */}
        <div className="lg:col-span-2 space-y-7">
          <CoverImage src={tour.image_cover} alt={tour.title} />

          {/* Title & Meta */}
          <div>
            <span className="text-xs bg-[#FF8400] text-white px-2.5 py-1 rounded-full font-semibold uppercase tracking-wide">
              {tour.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-black mt-2 leading-tight text-[#2C1A0E]">
              {tour.title}
            </h1>
            <div className="flex flex-wrap gap-5 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="text-[#FF8400]" /> {tour.province}
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="text-[#FF8400]" /> {tour.duration}
              </span>
              {tour.max_group_size && (
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="text-[#FF8400]" /> สูงสุด{" "}
                  {tour.max_group_size} คน
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* รายละเอียด */}
          {tour.description && (
            <section>
              <h2 className="text-lg font-bold mb-3 text-[#2C1A0E]">
                รายละเอียดทัวร์
              </h2>
              <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                {tour.description}
              </p>
            </section>
          )}

          {/* กำหนดการเดินทาง */}
          {itinerary.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 text-[#2C1A0E]">
                กำหนดการเดินทาง
              </h2>
              <div className="relative pl-5 border-l-2 border-dashed border-[#FF8400]/30 space-y-5">
                {itinerary.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#FF8400] border-2 border-white shadow-sm" />
                    <p className="text-xs font-bold text-[#FF8400] mb-0.5">
                      {item.time}
                    </p>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* การเตรียมตัว */}
          {preparation.length > 0 && (
            <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <h2 className="text-base font-bold mb-3 text-[#2C1A0E]">
                การเตรียมตัวก่อนเดินทาง
              </h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {preparation.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{" "}
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* ── Right (1/3) ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <BookingCard tour={tour} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page Component ───────────────── */

export default function TourDetailPage() {
  const { id } = useParams();
  const [tour, setTour] = useState<Tour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/v1/tours/${id}`);
        setTour(res.data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchTour();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C1A0E]">
      <Navbar activePage="tours" />

      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#FF8400] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูลทัวร์...</p>
          </div>
        </div>
      ) : error || !tour ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-4xl">😕</p>
            <p className="text-lg font-semibold text-gray-700">
              ไม่พบข้อมูลทัวร์นี้
            </p>
            <Link to="/" className="text-sm text-[#FF8400] hover:underline">
              ← กลับหน้าหลัก
            </Link>
          </div>
        </div>
      ) : (
        <MainContent tour={tour} />
      )}

      <Footer />
    </div>
  );
}
