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
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/* ─── SVG Icons ─────────────────────── */

const MapPinIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
  </svg>
);

const ClockIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const UsersIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
    <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
  </svg>
);

const PhoneIcon = ({ size = 12 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
  </svg>
);

const MailIcon = ({ size = 12 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function BookingCard({ tour }: { tour: Tour }) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [date, setDate] = useState("");

  const maxGuests = tour.max_group_size ?? 15;
  const childPrice = Math.floor(tour.price * 0.6);
  const total = tour.price * adults + childPrice * children;

  const Counter = ({
    label, value, onDec, onInc, subLabel,
  }: {
    label: string; value: number;
    onDec: () => void; onInc: () => void; subLabel?: string;
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
        >−</button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button
          onClick={onInc}
          className="w-7 h-7 rounded bg-[#FF8400] text-white font-bold text-base flex items-center justify-center hover:bg-[#e07300] transition-colors"
        >+</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      {/* Price Header */}
      <div className="bg-[#FF8400] px-5 py-4">
        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">ราคาเริ่มต้น</p>
        <p className="text-white text-3xl font-black mt-0.5">
          ฿{tour.price.toLocaleString()}
          <span className="text-base font-normal ml-1">/ คน</span>
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Date Picker */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
            วันที่เดินทาง
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF8400] focus:ring-1 focus:ring-[#FF8400] bg-gray-50"
          />
        </div>

        {/* Counters */}
        <div className="border border-gray-100 rounded-lg px-4 divide-y divide-gray-100">
          <Counter
            label="ผู้ใหญ่"
            subLabel={`฿${tour.price.toLocaleString()} / คน`}
            value={adults}
            onDec={() => setAdults((n) => Math.max(1, n - 1))}
            onInc={() => setAdults((n) => Math.min(maxGuests, n + 1))}
          />
          <Counter
            label="เด็ก"
            subLabel={`฿${childPrice.toLocaleString()} / คน`}
            value={children}
            onDec={() => setChildren((n) => Math.max(0, n - 1))}
            onInc={() => setChildren((n) => Math.min(10, n + 1))}
          />
        </div>

        {/* Price Summary */}
        <div className="bg-amber-50 rounded-lg px-4 py-3 space-y-1.5 border border-amber-100">
          {adults > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ผู้ใหญ่ {adults} คน</span>
              <span className="font-medium">฿{(tour.price * adults).toLocaleString()}</span>
            </div>
          )}
          {children > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">เด็ก {children} คน</span>
              <span className="font-medium">฿{(childPrice * children).toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-amber-200 pt-1.5 flex justify-between font-bold text-[#2C1A0E]">
            <span>รวมทั้งหมด</span>
            <span className="text-[#FF8400]">฿{total.toLocaleString()}</span>
          </div>
        </div>

        {/* Book Button */}
        <button className="w-full bg-[#FF8400] hover:bg-[#e07300] active:scale-[0.98] text-white font-bold py-3.5 rounded-lg transition-all text-sm shadow-md shadow-orange-200">
          จองทัวร์เลย →
        </button>

        {/* Contact */}
        <div className="text-center space-y-1.5 pt-1">
          <p className="text-xs text-gray-400">ต้องการสอบถามเพิ่มเติม?</p>
          <p className="text-xs text-[#FF8400] font-semibold">สอบถามเพิ่มเติม</p>
          <p className="text-xs text-gray-500">ติดต่อเราได้เลย เพื่อรับส่วนลดพิเศษ</p>
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
        <Link to="/" className="hover:text-[#FF8400]">หน้าหลัก</Link>
        <span>/</span>
        <Link to="/tours" className="hover:text-[#FF8400]">ทัวร์ทั้งหมด</Link>
        <span>/</span>
        <span className="text-[#FF8400] font-medium truncate max-w-48">{tour.title}</span>
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
                  <UsersIcon className="text-[#FF8400]" /> สูงสุด {tour.max_group_size} คน
                </span>
              )}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* รายละเอียด */}
          {tour.description && (
            <section>
              <h2 className="text-lg font-bold mb-3 text-[#2C1A0E]">รายละเอียดทัวร์</h2>
              <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">{tour.description}</p>
            </section>
          )}

          {/* กำหนดการเดินทาง */}
          {itinerary.length > 0 && (
            <section>
              <h2 className="text-lg font-bold mb-4 text-[#2C1A0E]">กำหนดการเดินทาง</h2>
              <div className="relative pl-5 border-l-2 border-dashed border-[#FF8400]/30 space-y-5">
                {itinerary.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[#FF8400] border-2 border-white shadow-sm" />
                    <p className="text-xs font-bold text-[#FF8400] mb-0.5">{item.time}</p>
                    <p className="text-sm text-gray-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* การเตรียมตัว */}
          {preparation.length > 0 && (
            <section className="bg-amber-50 border border-amber-100 rounded-xl p-5">
              <h2 className="text-base font-bold mb-3 text-[#2C1A0E]">การเตรียมตัวก่อนเดินทาง</h2>
              <ul className="grid sm:grid-cols-2 gap-2">
                {preparation.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" /> {item}
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
            <p className="text-lg font-semibold text-gray-700">ไม่พบข้อมูลทัวร์นี้</p>
            <Link to="/" className="text-sm text-[#FF8400] hover:underline">← กลับหน้าหลัก</Link>
          </div>
        </div>
      ) : (
        <MainContent tour={tour} />
      )}

      <Footer />
    </div>
  );
}