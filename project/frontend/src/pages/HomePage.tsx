import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// SVG Icon Components
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

const ChevronDownIcon = () => (
  <svg width="28" height="17" viewBox="0 0 27.7115 16.636" fill="none">
    <line
      x1="2.11325"
      y1="1.50003"
      x2="13.0406"
      y2="14.5228"
      stroke="#4F200D"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="14.6709"
      y1="14.5228"
      x2="25.5983"
      y2="1.50003"
      stroke="#4F200D"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowUpIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
    <path
      d="M31.7675 9.09C31.2987 8.62132 30.6629 8.35803 30 8.35803C29.3371 8.35803 28.7013 8.62132 28.2325 9.09L14.09 23.2325C13.8512 23.4631 13.6608 23.739 13.5297 24.044C13.3987 24.349 13.3298 24.6771 13.3269 25.009C13.324 25.3409 13.3872 25.6701 13.5129 25.9774C13.6387 26.2846 13.8243 26.5638 14.059 26.7985C14.2937 27.0332 14.5729 27.2189 14.8801 27.3446C15.1874 27.4703 15.5166 27.5335 15.8485 27.5306C16.1805 27.5277 16.5085 27.4588 16.8135 27.3278C17.1185 27.1967 17.3944 27.0063 17.625 26.7675L27.5 16.8925V50C27.5 50.663 27.7634 51.2989 28.2322 51.7678C28.7011 52.2366 29.337 52.5 30 52.5C30.663 52.5 31.2989 52.2366 31.7678 51.7678C32.2366 51.2989 32.5 50.663 32.5 50V16.8925L42.375 26.7675C42.8465 27.2229 43.478 27.4749 44.1335 27.4692C44.789 27.4635 45.416 27.2006 45.8796 26.737C46.3431 26.2735 46.606 25.6465 46.6117 24.991C46.6174 24.3355 46.3654 23.704 45.91 23.2325L31.7675 9.09Z"
      fill="#4F200D"
    />
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

export default function HomePage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Filter states
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<string>("");

  // Dropdown states
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

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

  useEffect(() => {
    fetch("http://localhost:3000/api/v1/tours")
      .then((res) => res.json())
      .then((data) => {
        const uniqueProvinces = [
          ...new Set(data.map((tour: any) => tour.province)),
        ].filter(Boolean) as string[];
        const uniqueCategories = [
          ...new Set(data.map((tour: any) => tour.category)),
        ].filter(Boolean) as string[];
        const uniqueDurations = [
          ...new Set(data.map((tour: any) => tour.duration)),
        ].filter(Boolean) as string[];
        setProvinces(uniqueProvinces);
        setCategories(uniqueCategories);
        setDurations(uniqueDurations);
      })
      .catch((err) => console.error("Error fetching filter options:", err));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/tours`)
      .then((res) => res.json())
      .then((data: any[]) => {
        const firstThree = data.slice(0, 3).map((tour) => ({
          id: tour.id ?? tour._id ?? tour.slug ?? tour.title,
          title: tour.title ?? tour.name ?? "",
          description: tour.description ?? tour.summary ?? tour.province,
          image_cover: tour.image_cover ?? tour.coverImage ?? tour.image,
          duration: tour.duration,
          price: tour.price,
          province: tour.province,
          category: tour.category,
        }));
        if (firstThree.length) {
          setTopTours(firstThree);
        }
      })
      .catch((err) => {
        console.error("Error fetching top tours:", err);
        setTopTours(defaultDestinations);
      });
  }, [API_BASE]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowProvinceDropdown(false);
        setShowCategoryDropdown(false);
        setShowDurationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedProvince) params.append("location", selectedProvince);
    if (selectedCategory) params.append("category", selectedCategory);
    if (selectedDuration) params.append("duration", selectedDuration);
    navigate(`/tours?${params.toString()}`);
  };

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

      {/* Hero Section */}
      <section className="relative min-h-[300px] md:min-h-[375px] lg:min-h-[450px] overflow-visible">
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center min-h-[300px] md:min-h-[375px] lg:min-h-[450px] px-4 py-6">
          <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-[60px] font-bold text-white mb-3 text-center drop-shadow-lg">
            ไม่ว่าจุดหมายคือที่ใด
          </h1>
          <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-[52px] font-bold text-[#FFD93D] mb-6 text-center drop-shadow-lg">
            เราพร้อมพาคุณไปส่งถึงที่
          </h2>

          {/* Search Bar */}
          <div className="w-full max-w-full sm:max-w-2xl md:max-w-4xl xl:max-w-6xl mt-6 md:mt-12 px-2 sm:px-0">
            <div className="dropdown-container bg-[#F6F1E9]/95 backdrop-blur-sm rounded-2xl sm:rounded-full p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 border-2 border-[#E3DCD4] items-stretch sm:items-center relative z-30 shadow-lg sm:shadow-xl">
              {/* Province Dropdown */}
              <div className="flex-1 relative min-w-[0]">
                <button
                  onClick={() => {
                    setShowProvinceDropdown(!showProvinceDropdown);
                    setShowCategoryDropdown(false);
                    setShowDurationDropdown(false);
                  }}
                  className="w-full bg-[#FFFDFA] rounded-full px-2 md:px-3 py-2 md:py-3 flex items-center justify-between border-2 border-[#4F200D]/30 hover:border-[#4F200D] transition-colors"
                >
                  <span className="text-xs md:text-sm lg:text-base text-[#4F200D]/90 font-medium truncate">
                    {selectedProvince || "เลือกจังหวัด"}
                  </span>
                  <ChevronDownIcon />
                </button>
                {showProvinceDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E3DCD4] max-h-60 overflow-y-auto z-50">
                    <button
                      onClick={() => {
                        setSelectedProvince("");
                        setShowProvinceDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#4F200D]/70 hover:bg-[#F6F1E9] transition-colors"
                    >
                      ทั้งหมด
                    </button>
                    {provinces.map((province) => (
                      <button
                        key={province}
                        onClick={() => {
                          setSelectedProvince(province);
                          setShowProvinceDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-[#4F200D] hover:bg-[#F6F1E9] transition-colors"
                      >
                        {province}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Category Dropdown */}
              <div className="flex-1 relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowProvinceDropdown(false);
                    setShowDurationDropdown(false);
                  }}
                  className="w-full bg-[#FFFDFA] rounded-full px-2 md:px-3 py-2 md:py-3 flex items-center justify-between border-2 border-[#4F200D]/30 hover:border-[#4F200D] transition-colors"
                >
                  <span className="text-xs md:text-sm lg:text-base text-[#4F200D]/90 font-medium truncate">
                    {selectedCategory || "เลือกประเภททัวร์"}
                  </span>
                  <ChevronDownIcon />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E3DCD4] max-h-60 overflow-y-auto z-50">
                    <button
                      onClick={() => {
                        setSelectedCategory("");
                        setShowCategoryDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#4F200D]/70 hover:bg-[#F6F1E9] transition-colors"
                    >
                      ทั้งหมด
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-[#4F200D] hover:bg-[#F6F1E9] transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration Dropdown */}
              <div className="flex-1 relative">
                <button
                  onClick={() => {
                    setShowDurationDropdown(!showDurationDropdown);
                    setShowProvinceDropdown(false);
                    setShowCategoryDropdown(false);
                  }}
                  className="w-full bg-[#FFFDFA] rounded-full px-2 md:px-3 py-2 md:py-3 flex items-center justify-between border-2 border-[#4F200D]/30 hover:border-[#4F200D] transition-colors"
                >
                  <span className="text-xs md:text-sm lg:text-base text-[#4F200D]/90 font-medium truncate">
                    {selectedDuration || "จำนวนวันเดินทาง"}
                  </span>
                  <ChevronDownIcon />
                </button>
                {showDurationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-[#E3DCD4] max-h-60 overflow-y-auto z-50">
                    <button
                      onClick={() => {
                        setSelectedDuration("");
                        setShowDurationDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-[#4F200D]/70 hover:bg-[#F6F1E9] transition-colors"
                    >
                      ทั้งหมด
                    </button>
                    {durations.map((duration) => (
                      <button
                        key={duration}
                        onClick={() => {
                          setSelectedDuration(duration);
                          setShowDurationDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-[#4F200D] hover:bg-[#F6F1E9] transition-colors"
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleSearch}
                className="bg-[#FF8400] text-white hover:bg-[#FF8400]/90 rounded-full px-4 md:px-6 py-2 md:py-3 text-xs md:text-sm lg:text-base font-bold shadow-lg whitespace-nowrap"
              >
                ค้นหา
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Best Services Section */}
      <section className="py-9 md:py-12 lg:py-18 bg-[#F6F1E9]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="text-center mb-9 md:mb-12">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#4F200D] mb-3">
              บริการที่เป็นเลิศเพื่อคุณ
            </h2>
            <div className="w-12 md:w-18 lg:w-24 h-1 md:h-1.5 bg-[#FF8400] mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature) => (
              <Card
                key={feature.id}
                className="border-0 shadow-lg rounded-2xl md:rounded-3xl bg-[#FFFDFA] overflow-hidden"
              >
                <CardContent className="p-5 md:p-6 text-center">
                  <div className="w-12 h-12 md:w-16 md:h-20 mx-auto mb-3 md:mb-4 bg-[#FFFDFA] rounded-xl md:rounded-2xl flex items-center justify-center text-[#FF8400]">
                    <feature.icon className="w-6 h-6 md:w-8 md:h-12" />
                  </div>
                  <h3 className="text-base md:text-lg lg:text-2xl font-bold text-[#4F200D] mb-2">
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

      {/* Quote Section */}
      <section className="relative py-14 md:py-24 lg:py-36 overflow-hidden">
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
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="absolute top-3 md:top-6 left-3 md:left-8 opacity-30">
          <div className="rotate-180">
            <QuoteIcon className="w-16 h-16 md:w-28 md:h-28 lg:w-40 lg:h-40" />
          </div>
        </div>
        <div className="absolute bottom-3 md:bottom-6 right-3 md:right-8 opacity-30">
          <QuoteIcon className="w-16 h-16 md:w-28 md:h-28 lg:w-40 lg:h-40" />
        </div>
        <div className="relative z-10 max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-lg md:text-3xl lg:text-5xl xl:text-[96px] font-bold text-white leading-tight mb-6 md:mb-12 drop-shadow-lg px-4">
              การเดินทาง คือการลงทุนเดียว
              <br />
              ที่ทำให้ชีวิตคุณมั่งคั่งขึ้น
            </h2>
            <Button
              onClick={() => navigate("/tours")}
              className="bg-[#FF8400] text-white hover:bg-[#FF8400]/90 rounded-full px-6 md:px-12 py-3 md:py-6 text-base md:text-xl lg:text-2xl font-bold shadow-xl"
            >
              เริ่มต้นการเดินทาง
            </Button>
          </div>
        </div>
      </section>

      {/* Trip Planning Section */}
      <section className="py-9 md:py-12 lg:py-18 bg-[#FFFDFA]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="grid lg:grid-cols-2 gap-6 md:gap-9 items-start">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-[58px] font-bold text-[#4F200D] mb-3">
                วางแผนทริปในฝันได้ง่าย ๆ
              </h2>
              <p className="text-sm md:text-lg lg:text-xl xl:text-[24px] font-extralight text-[#4F200D] mb-6 md:mb-9 max-w-2xl">
                เราลดความยุ่งยากในการจอง
                เพื่อให้คุณมีเวลาเตรียมจัดกระเป๋าได้เต็มที่
              </p>
              <div className="space-y-5 md:space-y-6">
                {steps.map((step) => (
                  <div
                    key={step.num}
                    className="flex items-start gap-3 md:gap-5"
                  >
                    <div className="w-12 h-12 md:w-18 md:h-18 flex-shrink-0 rounded-xl md:rounded-2xl bg-[#F6F1E9] flex items-center justify-center">
                      <span className="text-lg md:text-3xl font-bold text-[#FF8400]">
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
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80"
                  alt="Trip Planning"
                  className="w-full h-48 md:h-72 lg:h-[375px] xl:h-[450px] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Section */}
      <section className="py-9 md:py-12 lg:py-18 bg-[#FFFDFA]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="text-center mb-9 md:mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-[75px] font-bold text-[#4F200D] mb-3 leading-none">
              พิกัดเที่ยวไทยที่ใครก็พูดถึง
            </h2>
            <p className="text-base md:text-lg xl:text-2xl text-[#4F200D]">
              คัดสรรแลนด์มาร์กสุดฮิต ถ่ายรูปสวย ทันกระแสก่อนใคร
            </p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {topTours.map((tour) => (
              <Card
                key={tour.id}
                className="overflow-hidden border-0 shadow-xl rounded-2xl md:rounded-3xl bg-[#FFFDFA] group"
              >
                <div className="relative h-42 md:h-54 lg:h-72 overflow-hidden">
                  <img
                    src={
                      tour.image_cover ??
                      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
                    }
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600&q=80";
                    }}
                  />
                  <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#FF8400] shadow">
                    {tour.category || "แนะนำ"}
                  </div>
                </div>
                <CardContent className="p-3 md:p-4">
                  <div className="border-b border-[#E3DCD4] pb-2 md:pb-3 mb-2 md:mb-3">
                    <h3 className="text-lg md:text-2xl xl:text-[36px] font-bold text-[#4F200D] mb-1 md:mb-2">
                      {tour.title}
                    </h3>
                    <p className="text-xs md:text-sm xl:text-lg text-[#4F200D]/80 font-extralight">
                      {tour.description || tour.province || "เส้นทางยอดนิยม"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-xs xl:text-base text-[#4F200D]/80 font-extralight">
                        {tour.duration || "กำลังจัดตาราง"}
                      </p>
                      <p className="text-base md:text-lg xl:text-2xl font-bold text-[#FF8400]">
                        {tour.price
                          ? `฿${Number(tour.price).toLocaleString()}`
                          : "สอบถามราคา"}
                      </p>
                    </div>
                    <Button className="w-8 h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 rounded-full bg-[#FFFDFA] border-2 border-[#E3DCD4] hover:bg-[#FF8400] hover:text-white hover:border-[#FF8400] transition-all flex items-center justify-center">
                      <ArrowUpIcon />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-6 md:mt-9">
            <Button
              variant="outline"
              onClick={() => navigate("/tours")}
              className="rounded-full border-2 border-[#4F200D] text-[#4F200D] hover:bg-[#4F200D] hover:text-white px-8 py-3 font-bold transition-all"
            >
              ดูทัวร์ทั้งหมด
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-9 md:py-12 lg:py-18 bg-[#FFFDFA]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="text-center mb-9 md:mb-12">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#FF8400] mb-2 md:mb-3">
              เสียงความประทับใจ
            </h2>
            <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#4F200D]">
              จากนักเดินทาง
            </p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="border-0 shadow-lg rounded-xl md:rounded-2xl bg-[#FFFDFA]"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-3 md:mb-4">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#4F200D]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg md:text-2xl font-bold text-[#4F200D]">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm md:text-lg xl:text-xl text-[#4F200D]">
                        {testimonial.name}
                      </p>
                      <div className="flex gap-0.5 md:gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon key={i} size={12} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm xl:text-lg text-[#4F200D]/90 font-light leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-9 md:py-12 lg:py-18 bg-[#F6F1E9]">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-4xl lg:text-5xl xl:text-[64px] font-bold text-[#4F200D] mb-3 md:mb-6">
              พร้อมเริ่มต้นการเดินทางหรือยัง?
            </h2>
            <p className="text-sm md:text-lg xl:text-xl font-extralight text-[#4F200D] mb-5 md:mb-8 max-w-lg md:max-w-xl mx-auto">
              สมัครรับข่าวสารเพื่อไม่พลาดข้อมูลอัปเดตและข้อเสนอสุดพิเศษ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md md:max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="กรอกอีเมลของคุณ"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-10 md:h-12 xl:h-14 rounded-full bg-white/50 border-2 border-[#E3DCD4] text-sm md:text-base xl:text-lg px-3 md:px-4"
              />
              <Button className="h-10 md:h-12 xl:h-14 rounded-full bg-[#FF8400] text-white hover:bg-[#FF8400]/90 px-5 md:px-6 xl:px-8 text-sm md:text-base xl:text-lg font-bold whitespace-nowrap">
                สมัคร
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
