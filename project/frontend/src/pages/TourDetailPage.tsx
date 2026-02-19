import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  MapPin, Clock, Users,
  Phone, Mail,
  Facebook, Instagram, Youtube, Home, Info, PhoneCall,
} from "lucide-react";

/* ─── Types (ตรงกับ DB จริง) ─────────────── */
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
  preparation?: string[];   // คั่นด้วยคอมม่า หรือ array
  itinerary_data?: ItineraryStep[];
  status?: string;
  region?: string;
}

/* ─── Navbar ─────────────────────────────────────── */
function Navbar() {
  return (
    <nav className="bg-[#2C1A0E] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF8400] rounded-lg flex items-center justify-center font-black text-white text-sm">T</div>
          <span className="font-bold text-sm tracking-wide">THAI<span className="text-[#FF8400]">TOUR</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><Home size={13} /> Home</Link>
          <Link to="/tours" className="text-[#FF8400] border-b border-[#FF8400] pb-0.5">Tours</Link>
          <Link to="/about" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><Info size={13} /> About Us</Link>
          <Link to="/contact" className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5"><PhoneCall size={13} /> Contact</Link>
        </div>
        <div className="flex items-center gap-4 text-white/70">
          <button className="hover:text-white transition-colors text-sm">🛒</button>
          <button className="hover:text-white transition-colors text-sm">👤</button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Cover Image ────────────────────────────────── */
function CoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="w-full h-72 md:h-96 overflow-hidden rounded-xl bg-gray-100">
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

/* ─── Booking Card ──────────────────────────────── */
function BookingCard({ tour }: { tour: Tour }) {
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [date, setDate] = useState("");

  const maxGuests = tour.max_group_size ?? 15;
  const childPrice = Math.floor(tour.price * 0.6);
  const total = tour.price * adults + childPrice * children;

  const Counter = ({ label, value, onDec, onInc, subLabel }: {
    label: string; value: number;
    onDec: () => void; onInc: () => void; subLabel?: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-[#2C1A0E]">{label}</p>
        {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button onClick={onDec} className="w-7 h-7 rounded border border-gray-300 text-gray-600 font-bold text-base flex items-center justify-center hover:border-[#FF8400] hover:text-[#FF8400] transition-colors">−</button>
        <span className="w-5 text-center text-sm font-semibold">{value}</span>
        <button onClick={onInc} className="w-7 h-7 rounded bg-[#FF8400] text-white font-bold text-base flex items-center justify-center hover:bg-[#e07300] transition-colors">+</button>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
      <div className="bg-[#FF8400] px-5 py-4">
        <p className="text-white/80 text-xs font-medium uppercase tracking-wider">ราคาเริ่มต้น</p>
        <p className="text-white text-3xl font-black mt-0.5">
          ฿{tour.price.toLocaleString()}
          <span className="text-base font-normal ml-1">/ คน</span>
        </p>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">วันที่เดินทาง</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-[#FF8400] focus:ring-1 focus:ring-[#FF8400] bg-gray-50" />
        </div>
        <div className="border border-gray-100 rounded-lg px-4 divide-y divide-gray-100">
          <Counter label="ผู้ใหญ่" subLabel={`฿${tour.price.toLocaleString()} / คน`} value={adults}
            onDec={() => setAdults((n) => Math.max(1, n - 1))}
            onInc={() => setAdults((n) => Math.min(maxGuests, n + 1))} />
          <Counter label="เด็ก" subLabel={`฿${childPrice.toLocaleString()} / คน`} value={children}
            onDec={() => setChildren((n) => Math.max(0, n - 1))}
            onInc={() => setChildren((n) => Math.min(10, n + 1))} />
        </div>
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
        <button className="w-full bg-[#FF8400] hover:bg-[#e07300] active:scale-[0.98] text-white font-bold py-3.5 rounded-lg transition-all text-sm shadow-md shadow-orange-200">
          จองทัวร์เลย →
        </button>
        <div className="text-center space-y-1.5 pt-1">
          <p className="text-xs text-gray-400">ต้องการสอบถามเพิ่มเติม?</p>
          <p className="text-xs text-[#FF8400] font-semibold">สอบถามเพิ่มเติม</p>
          <p className="text-xs text-gray-500">ติดต่อเราได้เลย เพื่อรับส่วนลดพิเศษ</p>
          <div className="flex gap-2 pt-1">
            <button className="flex-1 border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:border-[#FF8400] hover:text-[#FF8400] transition-colors flex items-center justify-center gap-1.5">
              <Phone size={12} /> โทร
            </button>
            <button className="flex-1 border border-gray-200 rounded-lg py-2 text-xs font-medium text-gray-600 hover:border-[#FF8400] hover:text-[#FF8400] transition-colors flex items-center justify-center gap-1.5">
              <Mail size={12} /> อีเมล
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Footer ─────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#2C1A0E] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#FF8400] rounded-lg flex items-center justify-center font-black text-white">T</div>
              <span className="font-bold tracking-wide">THAI<span className="text-[#FF8400]">TOUR</span></span>
            </div>
            <p className="text-white/50 text-xs leading-relaxed">บริการท่องเที่ยวคุณภาพ ดูแลทุกการเดินทางของคุณอย่างใส่ใจ</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#FF8400] transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Navigation</h4>
            <ul className="space-y-2 text-xs text-white/50">
              {["หน้าหลัก", "ทัวร์ทั้งหมด", "เกี่ยวกับเรา", "บทความ", "ติดต่อเรา"].map((t) => (
                <li key={t}><a href="#" className="hover:text-[#FF8400] transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">Support</h4>
            <ul className="space-y-2 text-xs text-white/50">
              {["คำถามที่พบบ่อย", "นโยบายการคืนเงิน", "เงื่อนไขการจอง", "ความเป็นส่วนตัว"].map((t) => (
                <li key={t}><a href="#" className="hover:text-[#FF8400] transition-colors">{t}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-white/90">รับข่าวสาร</h4>
            <p className="text-xs text-white/50 mb-3">รับโปรโมชั่นพิเศษก่อนใคร</p>
            <div className="flex gap-2">
              <input type="email" placeholder="อีเมลของคุณ"
                className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF8400]" />
              <button className="bg-[#FF8400] hover:bg-[#e07300] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">สมัคร</button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-center text-xs text-white/30">
          © 2025 ThaiTour. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

/* ─── Helpers ───────────────────────────────────── */

/** แปลง preparation ที่อาจมาเป็น string "a,b,c" หรือ string[] → string[] */
function parsePreparation(raw?: string[] | string): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  // กรณีเป็น string คั่นด้วยคอมม่า
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/* ─── Main Page ─────────────────────────────────── */
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

  if (loading)
    return (
      <><Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#FF8400] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">กำลังโหลดข้อมูลทัวร์...</p>
          </div>
        </div>
        <Footer /></>
    );

  if (error || !tour)
    return (
      <><Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-4xl">😕</p>
            <p className="text-lg font-semibold text-gray-700">ไม่พบข้อมูลทัวร์นี้</p>
            <Link to="/" className="text-sm text-[#FF8400] hover:underline">← กลับหน้าหลัก</Link>
          </div>
        </div>
        <Footer /></>
    );

  const preparation = parsePreparation(tour.preparation as any);
  const itinerary = tour.itinerary_data ?? [];

  return (
    <div className="min-h-screen bg-[#FAF8F5] font-sans text-[#2C1A0E]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-5 flex items-center gap-1.5">
          <Link to="/" className="hover:text-[#FF8400]">หน้าหลัก</Link>
          <span>/</span>
          <Link to="/tours" className="hover:text-[#FF8400]">ทัวร์ทั้งหมด</Link>
          <span>/</span>
          <span className="text-[#FF8400] font-medium truncate max-w-48">{tour.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left (2/3) ─────────────────────── */}
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
                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#FF8400]" /> {tour.province}</span>
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#FF8400]" /> {tour.duration}</span>
                {tour.max_group_size && (
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-[#FF8400]" /> สูงสุด {tour.max_group_size} คน</span>
                )}
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200" />

            {/* รายละเอียด */}
            {tour.description && (
              <section>
                <h2 className="text-lg font-bold mb-3 text-[#2C1A0E]">รายละเอียดทัวร์</h2>
                <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                  {tour.description}
                </p>
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

          {/* ── Right (1/3) ────────────────────── */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <BookingCard tour={tour} />
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}