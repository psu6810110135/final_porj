import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

// Components
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TourCard } from "@/components/tours/TourCard";
import { FilterContent } from "@/components/tours/Filters";

// Icons
import { Search, Filter, X, ChevronLeft, Loader2 } from "lucide-react";

// Utils
import { translateDuration, translateLocation, getImageUrl } from "@/utils/tourUtils";

// --- Types ---
export interface Tour {
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

// --- Main Component ---
export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // ดึงค่าจาก URL
  const searchFilter = searchParams.get("search") || "";
  const regionFilter = searchParams.get("region") || "";
  const categoryFilter = searchParams.get("category") || "";
  const durationFilter = searchParams.get("duration") || "";

  // สถานะสำหรับ Input (แยกจาก URL เพื่อให้พิมพ์ได้ลื่นไหล)
  const [searchInput, setSearchInput] = useState(searchFilter);

  const apiBase = "http://localhost:3000/api";

  // 1. Real-time Search Logic (Debounce)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput.trim()) {
        newParams.set("search", searchInput.trim());
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, searchParams, setSearchParams]);

  // 2. Fetch Data Logic
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

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
  }, [apiBase, regionFilter, categoryFilter, durationFilter, searchFilter]);

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get(key) === value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      <Navbar activePage="tours" />

      <main className="flex-grow p-4 md:p-10">
        <div className="max-w-[1400px] mx-auto">

          {/* Header & Search */}
          <div className="flex flex-col items-center mb-8 md:mb-12">
            <div className="w-full mb-4">
              <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#FF8400] transition-colors">
                <ChevronLeft size={18} /> กลับหน้าหลัก
              </Link>
            </div>

            <h1 className="text-2xl md:text-4xl font-black text-center mb-2 text-[#4F200D]">
              ทุกจุดหมาย มั่นใจไปกับเรา
            </h1>
            <div className="flex justify-center mb-6 md:mb-8">
              <div className="w-24 md:w-48 h-1 rounded-full bg-[#4F200D]" />
            </div>

            <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                {loading ? (
                  <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FF8400] animate-spin" />
                ) : (
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                )}
                <input
                  type="text"
                  placeholder="ค้นหาสถานที่ท่องเที่ยว"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-4 rounded-full border border-gray-200 bg-white text-base focus:outline-none focus:border-[#FF8400] shadow-sm transition-all"
                />
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden p-3 bg-white border border-gray-200 rounded-full text-[#4F200D] shadow-sm active:scale-95 transition-transform flex justify-center items-center"
              >
                <Filter size={24} />
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters (Desktop) */}
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
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
                <div className="absolute right-0 top-0 h-full w-[85%] max-w-[320px] bg-white p-6 shadow-2xl overflow-y-auto transition-transform">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-black text-[#4F200D]">ตัวกรอง</h2>
                    <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
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
                  <button onClick={() => setIsMobileFilterOpen(false)} className="w-full mt-10 py-4 bg-[#FF8400] text-white font-bold rounded-2xl shadow-lg">
                    แสดงผลทัวร์
                  </button>
                </div>
              </div>
            )}

            {/* Tours Grid */}
            <div className="flex-1">
              {error && !loading && (
                <div className="flex items-center justify-center h-64 text-red-500 bg-red-50 rounded-3xl">
                  {error}
                </div>
              )}

              {!loading && tours.length === 0 && !error && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 bg-white rounded-[2.5rem]">
                  <div className="text-center p-4">
                    <p className="text-lg text-gray-400 font-bold mb-2">ไม่พบทัวร์ที่ตรงเงื่อนไข</p>
                    <button onClick={() => { setSearchInput(""); setSearchParams({}); }} className="text-[#FF8400] underline text-sm">
                      ล้างตัวกรองและค้นหาใหม่
                    </button>
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                {tours.map((tour) => (
                  <TourCard
                    key={tour.id}
                    tour={tour}
                    getImageUrl={getImageUrl}
                    translateDuration={translateDuration}
                    translateLocation={translateLocation}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
