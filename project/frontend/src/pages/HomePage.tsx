import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Types ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

interface TourCardData {
  id: number | string;
  title: string;
  description?: string;
  image_cover?: string;
  duration?: string;
  price?: number | string;
  province?: string;
  category?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function useRevealOnScroll(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Animated counter hook ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function useCounter(target: number, run: boolean, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!run) return;
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setCount(start);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [run, target, duration]);
  return count;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SVG Icon Components ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const CurrencyIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M8 6h5a3 3 0 0 1 3 3v.143a2.857 2.857 0 0 1 -2.857 2.857h-5.143" />
    <path d="M8 12h5a3 3 0 0 1 3 3v.143a2.857 2.857 0 0 1 -2.857 2.857h-5.143" />
    <path d="M8 6v12" />
    <path d="M11 4v2" />
    <path d="M11 18v2" />
  </svg>
);

const HeadphonesIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3" />
    <path d="M15 15a2 2 0 0 1 2 -2h1a2 2 0 0 1 2 2v3a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2l0 -3" />
    <path d="M4 15v-3a8 8 0 0 1 16 0v3" />
  </svg>
);

const HotelIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l18 0" />
    <path d="M5 21v-14l8 -4v18" />
    <path d="M19 21v-10l-6 -4" />
    <path d="M9 9l0 .01" />
    <path d="M9 12l0 .01" />
    <path d="M9 15l0 .01" />
    <path d="M9 18l0 .01" />
  </svg>
);

const MapIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3v7.5" />
    <path d="M9 4v13" />
    <path d="M15 7v5.5" />
    <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879" />
    <path d="M19 18v.01" />
  </svg>
);

const StarIcon = ({
  filled = true,
  size = 40,
}: {
  filled?: boolean;
  size?: number;
}) => (
  <svg width={size} height={size} viewBox="0 0 48.5377 47.2556" fill="none">
    <path
      d="M24.2681 28.8333L17.3515 33C17.0459 33.1944 16.7265 33.2778 16.3931 33.25C16.0598 33.2222 15.7681 33.1111 15.5181 32.9167C15.2681 32.7222 15.0737 32.4794 14.9348 32.1883C14.7959 31.8972 14.7681 31.5706 14.8515 31.2083L16.6848 23.3333L10.5598 18.0417C10.282 17.7917 10.1087 17.5067 10.0398 17.1867C9.9709 16.8667 9.99146 16.5544 10.1015 16.25C10.2115 15.9456 10.3781 15.6956 10.6015 15.5C10.8248 15.3044 11.1303 15.1794 11.5181 15.125L19.6015 14.4167L22.7265 7C22.8653 6.66667 23.0809 6.41667 23.3731 6.25C23.6653 6.08333 23.9637 6 24.2681 6C24.5726 6 24.8709 6.08333 25.1631 6.25C25.4553 6.41667 25.6709 6.66667 25.8098 7L28.9348 14.4167L37.0181 15.125C37.407 15.1806 37.7126 15.3056 37.9348 15.5C38.157 15.6944 38.3237 15.9444 38.4348 16.25C38.5459 16.5556 38.567 16.8683 38.4981 17.1883C38.4292 17.5083 38.2553 17.7928 37.9765 18.0417L31.8515 23.3333L33.6848 31.2083C33.7681 31.5694 33.7403 31.8961 33.6015 32.1883C33.4626 32.4806 33.2681 32.7233 33.0181 32.9167C32.7681 33.11 32.4765 33.2211 32.1431 33.25C31.8098 33.2789 31.4903 33.1956 31.1848 33L24.2681 28.8333Z"
      fill={filled ? "#FFD93D" : "none"}
      stroke={filled ? "none" : "#4F200D"}
      strokeWidth={filled ? "0" : "1.5"}
    />
  </svg>
);

const ChevronDownSmall = ({ open = false }: { open?: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const QuoteIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 183 183" fill="none">
    <path
      d="M45.3145 43.5C53.7462 43.5156 61.8287 46.8717 67.791 52.834C73.7547 58.7977 77.1109 66.8825 77.125 75.3164C77.1245 88.8203 74.6675 100.44 67.9033 110.76C61.0818 121.19 50.3939 130.188 34.2764 140.441C28.8597 143.871 22.5073 137.666 25.8037 132.174C29.3717 126.235 31.3447 122.459 32.3584 118.942C33.387 115.374 33.3838 112.205 33.3555 107.733L33.3467 106.273L32.0693 105.563C26.6755 102.567 21.9525 100.204 19.2334 96.2646L19.2285 96.2559L18.8555 95.707C15.0773 89.9925 13.5011 83.0246 13.5 75.3203C13.5281 66.8897 16.8892 58.812 22.8506 52.8506C28.8106 46.8906 36.8859 43.5296 45.3145 43.5ZM136.814 43.5C145.246 43.5156 153.329 46.8717 159.291 52.834C165.255 58.7977 168.611 66.8825 168.625 75.3164C168.625 88.8203 166.167 100.44 159.403 110.76C152.582 121.19 141.894 130.188 125.776 140.441C120.36 143.871 114.009 137.667 117.304 132.176C120.877 126.236 122.851 122.46 123.863 118.941C124.89 115.372 124.884 112.203 124.855 107.733L124.847 106.273L123.569 105.563C118.176 102.567 113.453 100.204 110.733 96.2646L110.729 96.2559L110.355 95.707C106.577 89.9925 105.001 83.0246 105 75.3203C105.028 66.8897 108.389 58.812 114.351 52.8506C120.311 46.8906 128.386 43.5296 136.814 43.5Z"
      fill="#FF8400"
      stroke="white"
      strokeWidth="5"
    />
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Rich Dropdown Component ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function RichDropdown({
  label,
  icon,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: string[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (val: string) => void;
}) {
  return (
    <div className="flex-1 relative min-w-[0]">
      <button
        onClick={onToggle}
        className={`w-full bg-white rounded-xl sm:rounded-full px-3 md:px-4 py-2.5 md:py-3 flex items-center gap-2 transition-all duration-200 ${
          isOpen
            ? "ring-2 ring-[#FF8400] shadow-md bg-white"
            : "border border-[#4F200D]/15 hover:border-[#FF8400]/50 hover:shadow-sm"
        }`}
      >
        <span
          className={`flex-shrink-0 transition-colors ${isOpen ? "text-[#FF8400]" : "text-[#4F200D]/40"}`}
        >
          {icon}
        </span>
        <span
          className={`text-xs md:text-sm text-left flex-1 truncate font-semibold ${value ? "text-[#4F200D]" : "text-[#4F200D]/45"}`}
        >
          {value || label}
        </span>
        <ChevronDownSmall open={isOpen} />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-[#F0E8E0] overflow-hidden z-50 transition-all duration-200 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
        }`}
      >
        {/* Connected arrow nub */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-[#F0E8E0] rotate-45" />

        <div className="max-h-56 overflow-y-auto py-1 relative">
          <button
            onClick={() => onSelect("")}
            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
              !value
                ? "bg-[#FF8400]/8 text-[#FF8400] font-bold"
                : "text-[#4F200D]/60 hover:bg-[#F6F1E9]"
            }`}
          >
            {!value && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF8400]" />
            )}
            ทั้งหมด
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                value === opt
                  ? "bg-[#FF8400]/8 text-[#FF8400] font-bold"
                  : "text-[#4F200D] hover:bg-[#F6F1E9]"
              }`}
            >
              {value === opt && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8400]" />
              )}
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── Page ─────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export default function HomePage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Filter states
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Filter options from API
  const [provinces, setProvinces] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [durations, setDurations] = useState<string[]>([]);

  const API_BASE = "http://localhost:3000/api/v1";

  const defaultDestinations: TourCardData[] = [
    {
      id: 1,
      title: "หมู่เกาะสิมิลัน",
      description: "ดำน้ำดูปะการังระดับโลก น้ำใสหาดทรายขาว",
      image_cover: "/src/assets/หมู่เกาะสิมิลัน.jpeg",
      duration: "ทริป 1 วัน",
      price: 3500,
    },
    {
      id: 2,
      title: "เขาสก",
      description: "นอนแพพักผ่อน ท่ามกลางป่าฝนอันอุดมสมบูรณ์",
      image_cover: "/src/assets/เขาสก.jpeg",
      duration: "3 วัน / 2 คืน",
      price: 8900,
    },
    {
      id: 3,
      title: "ภูเก็ต",
      description: "สัมผัสความโรแมนติกในแดนสวรรค์เขตร้อน",
      image_cover: "/src/assets/ภูเก็ต.jpeg",
      duration: "ทริป 1 วัน",
      price: 2200,
    },
  ];

  const [topTours, setTopTours] = useState<TourCardData[]>(defaultDestinations);

  // ── Hero text animation ──
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHeroReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  // ── Scroll-reveal refs ──
  const servicesReveal = useRevealOnScroll(0.1);
  const planReveal = useRevealOnScroll(0.1);
  const destReveal = useRevealOnScroll(0.1);
  const testimonialReveal = useRevealOnScroll(0.1);
  const statsReveal = useRevealOnScroll(0.2);
  const newsletterReveal = useRevealOnScroll(0.1);

  // ── Animated stat counters ──
  const tourCount = useCounter(150, statsReveal.visible);
  const customerCount = useCounter(3200, statsReveal.visible);
  const ratingVal = useCounter(49, statsReveal.visible, 1200);

  // ── Fetch filter options ──
  useEffect(() => {
    fetch(`${API_BASE}/tours`)
      .then((res) => res.json())
      .then((data: any[]) => {
        setProvinces(
          [...new Set(data.map((t) => t.province))].filter(Boolean) as string[],
        );
        setCategories(
          [...new Set(data.map((t) => t.category))].filter(Boolean) as string[],
        );
        setDurations(
          [...new Set(data.map((t) => t.duration))].filter(Boolean) as string[],
        );
      })
      .catch((err) => console.error("Error fetching filter options:", err));
  }, []);

  // ── Fetch recommended tours (fallback to first 3 from all) ──
  useEffect(() => {
    fetch(`${API_BASE}/tours/recommended`)
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setTopTours(
            data.slice(0, 6).map((tour) => ({
              id: tour.id ?? tour.title,
              title: tour.title ?? "",
              description: tour.description ?? tour.province,
              image_cover: tour.image_cover,
              duration: tour.duration,
              price: tour.price,
              province: tour.province,
              category: tour.category,
            })),
          );
        } else {
          // fallback: fetch all and use first 3
          return fetch(`${API_BASE}/tours`)
            .then((res) => res.json())
            .then((all: any[]) => {
              const first = all.slice(0, 3).map((tour) => ({
                id: tour.id ?? tour.title,
                title: tour.title ?? "",
                description: tour.description ?? tour.province,
                image_cover: tour.image_cover,
                duration: tour.duration,
                price: tour.price,
                province: tour.province,
                category: tour.category,
              }));
              if (first.length) setTopTours(first);
            });
        }
      })
      .catch(() => {
        fetch(`${API_BASE}/tours`)
          .then((res) => res.json())
          .then((all: any[]) => {
            const first = all.slice(0, 3).map((tour) => ({
              id: tour.id ?? tour.title,
              title: tour.title ?? "",
              description: tour.description ?? tour.province,
              image_cover: tour.image_cover,
              duration: tour.duration,
              price: tour.price,
              province: tour.province,
              category: tour.category,
            }));
            if (first.length) setTopTours(first);
          })
          .catch(() => setTopTours(defaultDestinations));
      });
  }, []);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".search-bar-container")) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = useCallback(
    (name: string) => setOpenDropdown((prev) => (prev === name ? null : name)),
    [],
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProvince) params.append("location", selectedProvince);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedDuration) params.append("duration", selectedDuration);
    navigate(`/tours?${params.toString()}`);
  };

  // ── Data ──
  const features = [
    {
      id: 1,
      title: "คุ้มค่าคุ้มราคา",
      desc: "เที่ยวง่าย จ่ายเบาๆ",
      icon: CurrencyIcon,
    },
    { id: 2, title: "ไกด์ส่วนตัว", desc: "เที่ยวตามสไตล์คุณ", icon: HotelIcon },
    { id: 3, title: "เดินทางปลอดภัย", desc: "อุ่นใจทุกเส้นทาง", icon: MapIcon },
    {
      id: 4,
      title: "ดูแลตลอด 24 ชม.",
      desc: "ติดต่อได้ทุกเมื่อ",
      icon: HeadphonesIcon,
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "นเรศ วงวิไล",
      content:
        "ประสบการณ์เที่ยวที่ดีที่สุด! ไกด์น่ารักมาก วิวสวยหลักล้าน ทุกอย่างจัดการได้เป๊ะมาก",
    },
    {
      id: 2,
      name: "ยศธร รัตนาประสิทธิ์",
      content:
        "จองง่ายมาก แอปช่วยวางแผนทริปได้แบบไม่ต้องกังวลเลย แนะนำแพ็กเกจเขาสกมาก ๆ",
    },
    {
      id: 3,
      name: "จันทรวิมล พงษ์ธนาพัฒน์",
      content:
        "แนะนำเลยสำหรับครอบครัว เด็ก ๆ ชอบกิจกรรมที่ภูเก็ตมาก ปีหน้ามาจองซ้ำแน่นอน!",
    },
  ];

  const steps = [
    {
      num: 1,
      title: "เลือกจุดหมาย",
      desc: "ค้นหารายชื่อสถานที่ท่องเที่ยวยอดนิยมที่เราคัดมาเพื่อคุณ",
    },
    {
      num: 2,
      title: "เช็ควันว่าง",
      desc: "เลือกวันเดินทางที่เหมาะสมกับตารางเวลาของคุณ",
    },
    {
      num: 3,
      title: "ออกเดินทางกันเลย!",
      desc: "รับแผนการเดินทาง แล้วเตรียมตัวเดินทางได้ทันที",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      <Navbar activePage="home" />

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Hero Section — animated entry + polished search bar               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[320px] md:min-h-[400px] lg:min-h-[480px] overflow-visible">
        <div className="absolute inset-0">
          <img
            src="/src/assets/bg2.jpeg"
            alt="Thailand Tourism"
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.style.background =
                "linear-gradient(135deg, #4F200D 0%, #8B4513 100%)";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/40 to-black/60" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[320px] md:min-h-[400px] lg:min-h-[480px] px-4 py-8">
          <h1
            className={`text-3xl md:text-5xl lg:text-6xl xl:text-[64px] font-extrabold text-white mb-2 text-center drop-shadow-lg transition-all duration-700 ${
              heroReady
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            ไม่ว่าจุดหมายคือที่ใด
          </h1>
          <h2
            className={`text-2xl md:text-4xl lg:text-5xl xl:text-[56px] font-extrabold text-[#FFD93D] mb-4 text-center drop-shadow-lg transition-all duration-700 delay-200 ${
              heroReady
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            เราพร้อมพาคุณไปส่งถึงที่
          </h2>
          <p
            className={`text-sm md:text-base lg:text-lg text-white/70 font-light mb-6 md:mb-10 text-center max-w-xl transition-all duration-700 delay-300 ${
              heroReady
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            ค้นหาทริปในฝัน จองง่าย ได้ทันที
          </p>

          {/* ─── Rich Search Bar ─── */}
          <div
            className={`search-bar-container w-full max-w-full sm:max-w-2xl md:max-w-4xl xl:max-w-5xl px-2 sm:px-0 transition-all duration-700 delay-500 ${
              heroReady
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            }`}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center shadow-2xl border border-white/30">
              <RichDropdown
                label="เลือกจังหวัด"
                icon={<MapIcon className="w-4 h-4" />}
                value={selectedProvince}
                options={provinces}
                isOpen={openDropdown === "province"}
                onToggle={() => toggleDropdown("province")}
                onSelect={(v) => {
                  setSelectedProvince(v);
                  setOpenDropdown(null);
                }}
              />

              {/* Vertical divider — desktop only */}
              <div className="hidden sm:block w-px h-8 bg-[#4F200D]/10 flex-shrink-0" />

              <RichDropdown
                label="ประเภททัวร์"
                icon={
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
                  >
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                    <line x1="4" y1="22" x2="4" y2="15" />
                  </svg>
                }
                value={selectedCategory}
                options={categories}
                isOpen={openDropdown === "category"}
                onToggle={() => toggleDropdown("category")}
                onSelect={(v) => {
                  setSelectedCategory(v);
                  setOpenDropdown(null);
                }}
              />

              <div className="hidden sm:block w-px h-8 bg-[#4F200D]/10 flex-shrink-0" />

              <RichDropdown
                label="จำนวนวัน"
                icon={
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
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
                value={selectedDuration}
                options={durations}
                isOpen={openDropdown === "duration"}
                onToggle={() => toggleDropdown("duration")}
                onSelect={(v) => {
                  setSelectedDuration(v);
                  setOpenDropdown(null);
                }}
              />

              <Button
                onClick={handleSearch}
                className="bg-[#FF8400] text-white hover:bg-[#e67600] rounded-xl sm:rounded-full px-5 md:px-7 py-2.5 md:py-3 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                ค้นหา
              </Button>
            </div>

            {/* Quick filter chips */}
            {(selectedProvince || selectedCategory || selectedDuration) && (
              <div className="flex flex-wrap gap-2 mt-3 justify-center">
                {selectedProvince && (
                  <button
                    onClick={() => setSelectedProvince("")}
                    className="flex items-center gap-1 bg-white/80 backdrop-blur-sm text-[#4F200D] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    {selectedProvince}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="flex items-center gap-1 bg-white/80 backdrop-blur-sm text-[#4F200D] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    {selectedCategory}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {selectedDuration && (
                  <button
                    onClick={() => setSelectedDuration("")}
                    className="flex items-center gap-1 bg-white/80 backdrop-blur-sm text-[#4F200D] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors shadow-sm"
                  >
                    {selectedDuration}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Stats Counter Bar                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <div ref={statsReveal.ref} className="bg-[#4F200D] py-5 md:py-7">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#FFD93D]">
              {tourCount}+
            </p>
            <p className="text-xs md:text-sm text-white/60 font-medium mt-1">
              เส้นทางทัวร์
            </p>
          </div>
          <div>
            <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#FFD93D]">
              {customerCount.toLocaleString()}+
            </p>
            <p className="text-xs md:text-sm text-white/60 font-medium mt-1">
              นักเดินทางไว้วางใจ
            </p>
          </div>
          <div>
            <p className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#FFD93D]">
              {(ratingVal / 10).toFixed(1)}
            </p>
            <p className="text-xs md:text-sm text-white/60 font-medium mt-1">
              คะแนนรีวิว
            </p>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Best Services Section                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 lg:py-20 bg-[#F6F1E9]">
        <div
          ref={servicesReveal.ref}
          className={`max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-700 ${
            servicesReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-9 md:mb-12">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#4F200D] mb-3">
              บริการที่เป็นเลิศเพื่อคุณ
            </h2>
            <div className="w-12 md:w-18 lg:w-24 h-1 md:h-1.5 bg-[#FF8400] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {features.map((feature, idx) => (
              <Card
                key={feature.id}
                className="border-0 shadow-lg rounded-2xl md:rounded-3xl bg-[#FFFDFA] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-[#FFF3E0] rounded-xl md:rounded-2xl flex items-center justify-center text-[#FF8400] group-hover:bg-[#FF8400] group-hover:text-white transition-colors duration-300">
                    <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-sm md:text-lg lg:text-2xl font-bold text-[#4F200D] mb-1 md:mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm lg:text-lg text-[#4F200D]/80 font-extralight">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Quote Section                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="relative py-16 md:py-28 lg:py-40 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/src/assets/bg1.jpeg"
            alt="Travel Background"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.style.background =
                "linear-gradient(135deg, #FF8400 0%, #FFD93D 100%)";
            }}
          />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <div className="absolute top-4 md:top-8 left-4 md:left-10 opacity-20">
          <div className="rotate-180">
            <QuoteIcon className="w-14 h-14 md:w-28 md:h-28 lg:w-40 lg:h-40" />
          </div>
        </div>
        <div className="absolute bottom-4 md:bottom-8 right-4 md:right-10 opacity-20">
          <QuoteIcon className="w-14 h-14 md:w-28 md:h-28 lg:w-40 lg:h-40" />
        </div>
        <div className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-xl md:text-3xl lg:text-5xl xl:text-7xl font-bold text-white leading-tight mb-6 md:mb-12 drop-shadow-lg px-4">
              การเดินทาง คือการลงทุนเดียว
              <br />
              ที่ทำให้ชีวิตคุณมั่งคั่งขึ้น
            </h2>
            <Button
              onClick={() => navigate("/tours")}
              className="bg-[#FF8400] text-white hover:bg-[#e67600] rounded-full px-6 md:px-12 py-3 md:py-6 text-base md:text-xl lg:text-2xl font-bold shadow-xl hover:shadow-2xl transition-all active:scale-95"
            >
              เริ่มต้นการเดินทาง
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Trip Planning Section                                              */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 lg:py-20 bg-[#FFFDFA]">
        <div
          ref={planReveal.ref}
          className={`max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-700 ${
            planReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="grid lg:grid-cols-2 gap-6 md:gap-9 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold text-[#4F200D] mb-3">
                วางแผนทริปในฝันได้ง่าย ๆ
              </h2>
              <p className="text-sm md:text-lg lg:text-xl xl:text-[24px] font-extralight text-[#4F200D] mb-6 md:mb-9 max-w-2xl">
                เราลดความยุ่งยากในการจอง
                เพื่อให้คุณมีเวลาเตรียมจัดกระเป๋าได้เต็มที่
              </p>
              <div className="space-y-5 md:space-y-6">
                {steps.map((step, idx) => (
                  <div
                    key={step.num}
                    className={`flex items-start gap-3 md:gap-5 transition-all duration-500 ${
                      planReveal.visible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-6"
                    }`}
                    style={{ transitionDelay: `${300 + idx * 150}ms` }}
                  >
                    <div className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-[#FF8400] to-[#FFD93D] flex items-center justify-center shadow-md">
                      <span className="text-lg md:text-2xl font-bold text-white">
                        {step.num}
                      </span>
                    </div>
                    <div>
                      <p className="text-base md:text-2xl xl:text-[36px] font-medium text-[#4F200D] mb-1 md:mb-2">
                        {step.title}
                      </p>
                      <p className="text-xs md:text-sm xl:text-lg text-[#4F200D]/80 font-extralight max-w-md">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                  alt="Trip Planning"
                  className="w-full h-52 md:h-72 lg:h-[400px] xl:h-[480px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4F200D]/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Recommended Destinations Section                                   */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 lg:py-20 bg-[#FFFDFA]">
        <div
          ref={destReveal.ref}
          className={`max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-700 ${
            destReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-9 md:mb-12">
            <span className="inline-block bg-[#FF8400]/10 text-[#FF8400] text-xs md:text-sm font-bold px-4 py-1.5 rounded-full mb-3">
              แนะนำสำหรับคุณ
            </span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-[75px] font-bold text-[#4F200D] mb-3 leading-none">
              พิกัดเที่ยวไทยที่ใครก็พูดถึง
            </h2>
            <p className="text-sm md:text-lg xl:text-2xl text-[#4F200D]/70">
              คัดสรรแลนด์มาร์กสุดฮิต ถ่ายรูปสวย ทันกระแสก่อนใคร
            </p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {topTours.map((tour, idx) => (
              <Card
                key={tour.id}
                className={`overflow-hidden border-0 shadow-xl rounded-2xl md:rounded-3xl bg-[#FFFDFA] group cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
                style={{ transitionDelay: `${idx * 100}ms` }}
                onClick={() => navigate(`/tours/${tour.id}`)}
              >
                <div className="relative h-44 md:h-56 lg:h-72 overflow-hidden">
                  <img
                    src={
                      tour.image_cover ??
                      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
                    }
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#FF8400] shadow-sm">
                    {tour.category || "แนะนำ"}
                  </div>
                  {tour.province && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                      <MapIcon className="w-3 h-3" />
                      {tour.province}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 md:p-5">
                  <div className="border-b border-[#E3DCD4] pb-3 mb-3">
                    <h3 className="text-lg md:text-xl xl:text-2xl font-bold text-[#4F200D] mb-1 line-clamp-1">
                      {tour.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[#4F200D]/60 font-light line-clamp-2">
                      {tour.description || "เส้นทางยอดนิยม"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] md:text-xs text-[#4F200D]/50 font-medium">
                        {tour.duration || "กำลังจัดตาราง"}
                      </p>
                      <p className="text-lg md:text-xl font-extrabold text-[#FF8400]">
                        {tour.price
                          ? `฿${Number(tour.price).toLocaleString()}`
                          : "สอบถามราคา"}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-[#FF8400]/10 flex items-center justify-center group-hover:bg-[#FF8400] transition-colors duration-300">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#FF8400] group-hover:text-white transition-colors -rotate-45"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 md:mt-10">
            <Button
              variant="outline"
              onClick={() => navigate("/tours")}
              className="rounded-full border-2 border-[#4F200D] text-[#4F200D] hover:bg-[#4F200D] hover:text-white px-8 py-3 font-bold transition-all active:scale-95"
            >
              ดูทัวร์ทั้งหมด
            </Button>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Testimonials Section                                               */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 lg:py-20 bg-[#F6F1E9]">
        <div
          ref={testimonialReveal.ref}
          className={`max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-700 ${
            testimonialReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="text-center mb-9 md:mb-12">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#FF8400] mb-2 md:mb-3">
              เสียงความประทับใจ
            </h2>
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#4F200D]">
              จากนักเดินทาง
            </p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {testimonials.map((testimonial, idx) => (
              <Card
                key={testimonial.id}
                className={`border-0 shadow-lg rounded-xl md:rounded-2xl bg-[#FFFDFA] hover:shadow-xl transition-all duration-300`}
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#FF8400] to-[#FFD93D] flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-lg md:text-xl font-bold text-white">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-[#4F200D]">
                        {testimonial.name}
                      </p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} size={14} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm xl:text-base text-[#4F200D]/80 font-light leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* Newsletter Section                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      <section className="py-10 md:py-14 lg:py-20 bg-[#FFFDFA]">
        <div
          ref={newsletterReveal.ref}
          className={`max-w-[1920px] mx-auto px-4 md:px-8 transition-all duration-700 ${
            newsletterReveal.visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <div className="relative bg-gradient-to-r from-[#4F200D] to-[#7A3B15] rounded-3xl p-8 md:p-14 lg:p-20 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#FF8400]/15 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FFD93D]/10 rounded-full" />

            <div className="relative text-center">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-5">
                พร้อมเริ่มต้นการเดินทางหรือยัง?
              </h2>
              <p className="text-sm md:text-lg text-white/60 font-light mb-6 md:mb-8 max-w-lg mx-auto">
                สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดตและข้อเสนอสุดพิเศษ
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md md:max-w-lg mx-auto">
                <Input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-11 md:h-13 rounded-full bg-white/10 border-2 border-white/20 text-white placeholder:text-white/40 text-sm md:text-base px-4 focus:border-[#FF8400] focus:bg-white/15"
                />
                <Button className="h-11 md:h-13 rounded-full bg-[#FF8400] text-white hover:bg-[#e67600] px-6 md:px-8 text-sm md:text-base font-bold whitespace-nowrap shadow-lg hover:shadow-xl transition-all active:scale-95">
                  สมัครเลย
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
