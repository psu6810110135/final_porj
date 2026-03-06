import { useState, useEffect, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  Plus,
  Star,
  Clock,
  MapPin,
  ChevronDown,
} from "lucide-react";
import {
  CATEGORY_OPTIONS,
  REGION_OPTIONS,
  DURATION_OPTIONS,
  getDurationLabel,
  getProvinceLabel,
} from "@/utils/tourLabels";
import { API_BASE_URL } from "@/config/api";

interface Tour {
  id: number | string;
  title: string;
  image_cover?: string;
  province?: string;
  price: string | number;
  duration?: string;
  category?: string;
  rating?: string | number;
  region?: string;
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [provinceOptions, setProvinceOptions] = useState<string[]>([]);
  const [isProvinceDropdownOpen, setIsProvinceDropdownOpen] = useState(false);

  // สถานะสำหรับเปิด/ปิด Filter ในมือถือ
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const searchFilter = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchFilter);

  const apiBase = `${API_BASE_URL}/api`;

  const provinceFilter = searchParams.get("province") || "";
  const regionFilter = searchParams.get("region") || "";
  const categoryFilter = searchParams.get("category") || "";
  const durationFilter = searchParams.get("duration") || "";

  // Helper สำหรับแปลง URL รูปภาพ
  const getImageUrl = (path?: string) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Img";
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}/${path.replace(/^\//, "")}`;
  };

  useEffect(() => {
    setSearchInput(searchFilter);
  }, [searchFilter]);

  useEffect(() => {
    fetch(`${apiBase}/tours`)
      .then((res) => res.json())
      .then((data: Tour[]) => {
        const unique = [
          ...new Set(data.map((t) => t.province).filter(Boolean)),
        ];
        setProvinceOptions(
          (unique as string[]).sort((a, b) =>
            getProvinceLabel(a).localeCompare(getProvinceLabel(b), "th"),
          ),
        );
      })
      .catch((err) => {
        console.error("Error fetching provinces:", err);
        setProvinceOptions([]);
      });
  }, [apiBase]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();

    if (provinceFilter) params.append("province", provinceFilter);
    if (regionFilter) params.append("region", regionFilter);
    if (categoryFilter) params.append("category", categoryFilter);
    if (durationFilter) params.append("duration", durationFilter);
    if (searchFilter) params.append("search", searchFilter);

    const url = `${apiBase}/tours${params.toString() ? `?${params.toString()}` : ""}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setTours(data))
      .catch((err) => {
        console.error("Error:", err);
        setError("ไม่สามารถโหลดข้อมูลทัวร์ได้ในขณะนี้");
        setTours([]);
      })
      .finally(() => setLoading(false));
  }, [
    apiBase,
    provinceFilter,
    regionFilter,
    categoryFilter,
    durationFilter,
    searchFilter,
  ]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get(key) === value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = () => {
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set("search", searchInput.trim());
    } else {
      newParams.delete("search");
    }
    setSearchParams(newParams);
  };

  const handleProvinceSelect = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete("province");
    } else {
      newParams.set("province", value);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".tours-search-bar-container")) {
        setIsProvinceDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const provinceDropdownOptions = provinceOptions.map((province) => ({
    value: province,
    label: getProvinceLabel(province),
  }));

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar activePage="tours" />

      <main className="flex-grow p-4 md:p-10">
        <div className="max-w-[1400px] mx-auto">
          {/* Header Section */}
          <div className="relative z-40 flex flex-col items-center mb-8 md:mb-12">
            <div className="w-full mb-4">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF8400] transition-colors"
              >
                <ChevronLeft size={18} /> กลับหน้าหลัก
              </Link>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-center mb-2 text-[#4F200D]">
              ทุกจุดหมาย มั่นใจไปกับเรา
            </h1>
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="w-24 md:w-48 h-1 rounded-full bg-[#4F200D]" />
            </div>

            {/* Search Bar - Responsive */}
            <div className="tours-search-bar-container relative z-[90] w-full max-w-5xl">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-2 sm:p-2.5 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center shadow-2xl border border-white/30">
                <RichDropdown
                  label="เลือกจังหวัด"
                  icon={<MapPin className="w-4 h-4" />}
                  value={provinceFilter}
                  options={provinceDropdownOptions}
                  isOpen={isProvinceDropdownOpen}
                  onToggle={() => setIsProvinceDropdownOpen((prev) => !prev)}
                  onSelect={(value) => {
                    handleProvinceSelect(value);
                    setIsProvinceDropdownOpen(false);
                  }}
                  className="sm:max-w-[260px]"
                />

                <div className="hidden sm:block w-px h-8 bg-[#4F200D]/10 flex-shrink-0" />

                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ค้นหาสถานที่ท่องเที่ยว..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    className="w-full pl-12 pr-4 py-2.5 md:py-3 rounded-xl sm:rounded-full border border-[#4F200D]/15 bg-white text-sm md:text-base focus:outline-none focus:border-[#FF8400] hover:border-[#FF8400]/50 transition-all"
                  />
                </div>

                <button
                  onClick={handleSearchSubmit}
                  className="bg-[#FF8400] text-white hover:bg-[#e67600] rounded-xl sm:rounded-full px-5 md:px-7 py-2.5 md:py-3 text-sm md:text-base font-bold shadow-lg hover:shadow-xl transition-all whitespace-nowrap active:scale-95"
                >
                  ค้นหา
                </button>

                {/* ปุ่ม Mobile Filter */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="lg:hidden p-2.5 md:p-3 bg-white border border-[#4F200D]/15 rounded-xl sm:rounded-full text-[#4F200D] shadow-sm active:scale-95 transition-transform"
                >
                  <Filter size={22} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters - Desktop */}
            <aside className="hidden lg:block w-[280px] shrink-0">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm sticky top-28 border border-gray-100 space-y-8">
                <FilterContent
                  durationFilter={durationFilter}
                  regionFilter={regionFilter}
                  categoryFilter={categoryFilter}
                  handleFilterChange={handleFilterChange}
                />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={() => setIsMobileFilterOpen(false)}
                />
                <div className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-white p-6 shadow-2xl overflow-y-auto transition-transform">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-[#4F200D]">
                      ตัวกรอง
                    </h2>
                    <button
                      onClick={() => setIsMobileFilterOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-8">
                    <FilterContent
                      durationFilter={durationFilter}
                      regionFilter={regionFilter}
                      categoryFilter={categoryFilter}
                      handleFilterChange={handleFilterChange}
                    />
                  </div>
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full mt-10 py-4 bg-[#FF8400] text-white font-bold rounded-2xl shadow-lg"
                  >
                    แสดงผลทัวร์
                  </button>
                </div>
              </div>
            )}

            {/* Tours Grid */}
            <div className="flex-1">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8400]"></div>
                </div>
              )}

              {error && !loading && (
                <div className="flex items-center justify-center h-64 text-red-500 bg-red-50 rounded-3xl">
                  {error}
                </div>
              )}

              {!loading && !error && tours.length === 0 && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 bg-white rounded-[2.5rem]">
                  <div className="text-center p-4">
                    <p className="text-lg text-gray-400 font-bold mb-2">
                      ไม่พบทัวร์ที่ตรงเงื่อนไข
                    </p>
                    <button
                      onClick={() => setSearchParams({})}
                      className="text-[#FF8400] underline text-sm"
                    >
                      ล้างตัวกรองทั้งหมด
                    </button>
                  </div>
                </div>
              )}

              {!loading && !error && tours.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
                  {tours.map((tour) => (
                    <Link
                      to={`/tours/${tour.id}`}
                      key={tour.id}
                      className="block h-full group"
                    >
                      <Card className="rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
                        {/* Image Section */}
                        <div className="relative h-32 sm:h-48 md:h-56 shrink-0 overflow-hidden bg-gray-100 p-1.5 md:p-2">
                          <img
                            src={getImageUrl(tour.image_cover)}
                            className="w-full h-full object-cover rounded-[1rem] md:rounded-[1.5rem] group-hover:scale-105 transition-transform duration-500"
                            alt={tour.title}
                          />

                          {/* Rating */}
                          <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full text-[10px] md:text-xs font-black text-[#FF8400] shadow-sm flex items-center gap-0.5">
                            <Star
                              size={10}
                              fill="#FF8400"
                              stroke="#FF8400"
                              className="md:w-[12px]"
                            />{" "}
                            {tour.rating || "ใหม่"}
                          </div>

                          {/* Duration */}
                          {tour.duration && (
                            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-white/90 px-1.5 py-0.5 md:px-3 md:py-1.5 rounded-full text-[9px] md:text-[10px] font-bold text-[#4F200D] shadow-sm flex items-center gap-0.5">
                              <Clock size={10} className="md:w-[12px]" />{" "}
                              {getDurationLabel(tour.duration)}
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-3 md:p-6 flex flex-col flex-grow">
                          <h3 className="text-sm md:text-xl font-black mb-1 leading-tight text-[#2D3748] group-hover:text-[#FF8400] transition-colors line-clamp-2">
                            {tour.title}
                          </h3>
                          <p className="text-[10px] md:text-sm text-gray-400 mb-2 md:mb-6 line-clamp-1">
                            {tour.province
                              ? getProvinceLabel(tour.province)
                              : "ไทย"}
                          </p>

                          <div className="mt-auto pt-2 md:pt-4 border-t border-gray-100 flex justify-between items-end">
                            <div>
                              <span className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                                เริ่ม
                              </span>
                              <div className="text-sm md:text-2xl font-black text-[#FF8400]">
                                ฿{Number(tour.price).toLocaleString()}
                              </div>
                            </div>

                            <div className="w-6 h-6 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#FF8400] text-white shadow-md">
                              <Plus
                                size={14}
                                strokeWidth={3}
                                className="md:w-[20px]"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// --- Component ย่อย (Helper Components) ---

function RichDropdown({
  label,
  icon,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  className = "",
}: {
  label: string;
  icon: ReactNode;
  value: string;
  options: { value: string; label: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  className?: string;
}) {
  const displayLabel =
    options.find((opt) => opt.value === value)?.label ?? label;

  return (
    <div className={`flex-1 relative min-w-[0] ${className}`}>
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
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FF8400]" : "text-[#4F200D]"}`}
        />
      </button>

      <div
        className={`absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-2xl border border-[#F0E8E0] overflow-hidden z-[120] transition-all duration-200 origin-top ${
          isOpen
            ? "opacity-100 scale-y-100 translate-y-0"
            : "opacity-0 scale-y-95 -translate-y-1 pointer-events-none"
        }`}
      >
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
            ทุกจังหวัด
          </button>

          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                value === opt.value
                  ? "bg-[#FF8400]/8 text-[#FF8400] font-bold"
                  : "text-[#4F200D] hover:bg-[#F6F1E9]"
              }`}
            >
              {value === opt.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF8400]" />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterContent({
  durationFilter,
  regionFilter,
  categoryFilter,
  handleFilterChange,
}: any) {
  return (
    <>
      <div>
        <h3 className="font-extrabold text-lg mb-4 text-[#4F200D]">ระยะเวลา</h3>
        <div className="space-y-3">
          {DURATION_OPTIONS.map((opt) => (
            <FilterItem
              key={opt.value}
              label={opt.label}
              isChecked={durationFilter === opt.value}
              onChange={() => handleFilterChange("duration", opt.value)}
            />
          ))}
        </div>
      </div>
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-extrabold text-lg mb-4 text-[#4F200D]">ภูมิภาค</h3>
        <div className="space-y-3">
          {REGION_OPTIONS.map((zone) => (
            <FilterItem
              key={zone.value}
              label={zone.label}
              isChecked={regionFilter === zone.value}
              onChange={() => handleFilterChange("region", zone.value)}
            />
          ))}
        </div>
      </div>
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-extrabold text-lg mb-4 text-[#4F200D]">
          ประเภททัวร์
        </h3>
        <div className="space-y-3">
          {CATEGORY_OPTIONS.map((cat) => (
            <FilterItem
              key={cat.value}
              label={cat.label}
              isChecked={categoryFilter === cat.value}
              onChange={() => handleFilterChange("category", cat.value)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function FilterItem({ label, isChecked, onChange }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="w-5 h-5 accent-[#FF8400] rounded-md cursor-pointer"
      />
      <span
        className={`text-sm group-hover:text-[#FF8400] transition-colors ${isChecked ? "font-bold text-[#FF8400]" : "font-medium text-gray-700"}`}
      >
        {label}
      </span>
    </label>
  );
}
