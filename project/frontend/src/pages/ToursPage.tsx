import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

  const [locationSearch, setLocationSearch] = useState("");
  const [keywordSearch, setKeywordSearch] = useState("");

  const apiBase = "http://localhost:3000/api/v1";

  const regionFilter = searchParams.get("region") || "";
  const categoryFilter = searchParams.get("category") || "";
  const durationFilter = searchParams.get("duration") || "";
  const locationFilter = searchParams.get("location") || "";
  const keywordFilter = searchParams.get("keyword") || "";

  useEffect(() => {
    // Keep inputs in sync with URL when arriving from other pages
    setLocationSearch(locationFilter);
    setKeywordSearch(keywordFilter);
  }, [locationFilter, keywordFilter]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (regionFilter) params.append("region", regionFilter);
    if (categoryFilter) params.append("category", categoryFilter);
    if (durationFilter) params.append("duration", durationFilter);
    if (locationFilter) params.append("location", locationFilter);
    if (keywordFilter) params.append("keyword", keywordFilter);

    const url = `${apiBase}/tours${params.toString() ? `?${params.toString()}` : ""}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setTours(data))
      .catch((err) => {
        console.error("Error:", err);
        setError(err.message);
        setTours([]);
      })
      .finally(() => setLoading(false));
  }, [
    apiBase,
    regionFilter,
    categoryFilter,
    durationFilter,
    locationFilter,
    keywordFilter,
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

  const handleSearch = () => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (regionFilter) params.append("region", regionFilter);
    if (categoryFilter) params.append("category", categoryFilter);
    if (durationFilter) params.append("duration", durationFilter);
    if (locationSearch) params.append("location", locationSearch);
    if (keywordSearch) params.append("keyword", keywordSearch);

    const url = `${apiBase}/tours${params.toString() ? `?${params.toString()}` : ""}`;
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setTours(data))
      .catch((err) => {
        setError(err.message);
        setTours([]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#F6F1E9]">
      <Navbar activePage="tours" />

      <main className="flex-grow p-4 md:p-10">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold opacity-70 hover:opacity-100 transition-opacity"
            >
              <span>←</span> กลับหน้าหลัก
            </Link>
          </div>

          <h1 className="text-4xl font-black text-center mb-2 text-[#4F200D]">
            ทุกจุดหมาย มั่นใจไปกับเรา
          </h1>
          <div className="flex justify-center mb-8">
            <div className="w-48 h-1 rounded-full bg-[#4F200D]" />
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="ค้นหาสถานที่ท่องเที่ยวของคุณ"
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8400]/40 shadow-sm"
              />
            </div>
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="คีย์เวิร์ด (ระบุหรือไม่ก็ได้)"
                value={keywordSearch}
                onChange={(e) => setKeywordSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-9 pr-4 py-3 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8400]/40 shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-8 py-3 bg-[#FF8400] hover:bg-[#e07600] text-white font-bold rounded-full transition-colors shadow-sm text-sm"
            >
              ค้นหา
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters — ของเดิม */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm sticky top-28 border border-orange-50 space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl mb-4 text-[#4F200D]">
                    ระยะเวลา
                  </h3>
                  <div className="space-y-3">
                    {["1 Day", "2 Days", "3 Days"].map((label) => (
                      <label
                        key={label}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={durationFilter === label}
                          onChange={() => handleFilterChange("duration", label)}
                          className="w-5 h-5 accent-[#FF8400] rounded-lg"
                        />
                        <span
                          className={`text-sm group-hover:text-[#FF8400] transition-colors ${durationFilter === label ? "font-bold text-[#FF8400]" : "font-medium"}`}
                        >
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-extrabold text-xl mb-4 text-[#4F200D]">
                    ภูมิภาค
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "ภาคเหนือ (North)", value: "North" },
                      { label: "ภาคกลาง (Central)", value: "Central" },
                      { label: "ภาคอีสาน (Northeast)", value: "Northeast" },
                      { label: "ภาคตะวันตก (West)", value: "West" },
                      { label: "ภาคตะวันออก (East)", value: "East" },
                      { label: "ภาคใต้ (South)", value: "South" },
                    ].map((zone) => (
                      <label
                        key={zone.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={regionFilter === zone.value}
                          onChange={() =>
                            handleFilterChange("region", zone.value)
                          }
                          className="w-5 h-5 accent-[#FF8400] rounded-lg"
                        />
                        <span
                          className={`text-sm group-hover:text-[#FF8400] transition-colors ${regionFilter === zone.value ? "font-bold text-[#FF8400]" : "font-medium"}`}
                        >
                          {zone.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-extrabold text-xl mb-4 text-[#4F200D]">
                    ประเภททัวร์
                  </h3>
                  <div className="space-y-3">
                    {[
                      { label: "ทะเล (Sea)", value: "Sea" },
                      { label: "ภูเขา (Mountain)", value: "Mountain" },
                      { label: "ธรรมชาติ (Nature)", value: "Nature" },
                      { label: "วัฒนธรรม (Cultural)", value: "Cultural" },
                      { label: "ในเมือง (City)", value: "City" },
                      { label: "ผจญภัย (Adventure)", value: "Adventure" },
                    ].map((cat) => (
                      <label
                        key={cat.value}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={categoryFilter === cat.value}
                          onChange={() =>
                            handleFilterChange("category", cat.value)
                          }
                          className="w-5 h-5 accent-[#FF8400] rounded-lg"
                        />
                        <span
                          className={`text-sm group-hover:text-[#FF8400] transition-colors ${categoryFilter === cat.value ? "font-bold text-[#FF8400]" : "font-medium"}`}
                        >
                          {cat.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Tours Grid */}
            <div className="flex-1">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF8400] mx-auto mb-4"></div>
                    <p className="text-[#4F200D]/60">กำลังโหลด...</p>
                  </div>
                </div>
              )}
              {error && !loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-red-500">
                    เกิดข้อผิดพลาด: {error}
                  </div>
                </div>
              )}
              {!loading && !error && tours.length === 0 && (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-[#4F200D]/10 rounded-[2.5rem]">
                  <div className="text-center">
                    <p className="text-xl text-[#4F200D]/80 mb-2 font-bold">
                      ไม่พบทัวร์ที่ตรงกับเงื่อนไข
                    </p>
                    <p className="text-sm text-[#4F200D]/60">
                      ลองเปลี่ยนตัวกรอง หรือ เพิ่มข้อมูลทัวร์ในหน้า Admin
                    </p>
                  </div>
                </div>
              )}
              {!loading && !error && tours.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <Link
                      to={`/tours/${tour.id}`}
                      key={tour.id}
                      className="block h-full cursor-pointer group"
                    >
                      <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm group-hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
                        <div className="relative h-52 shrink-0 overflow-hidden">
                          <img
                            src={
                              tour.image_cover &&
                              tour.image_cover.startsWith("http")
                                ? tour.image_cover
                                : "https://via.placeholder.com/400x300?text=No+Image"
                            }
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt={tour.title}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "https://via.placeholder.com/400x300?text=Image+Error";
                            }}
                          />
                          <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold text-[#FF8400] shadow-sm">
                            ★ {tour.rating || "New"}
                          </div>
                          <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-xs font-medium text-white backdrop-blur-sm">
                            {tour.category}
                          </div>
                        </div>
                        <CardContent className="p-7 flex flex-col flex-grow">
                          <h3 className="text-2xl font-black mb-1 leading-tight text-gray-800">
                            {tour.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-6 line-clamp-1 flex items-center gap-1">
                            📍 {tour.province || "Thailand"} ({tour.region})
                          </p>
                          <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                ราคาเริ่มต้น
                              </span>
                              <div className="text-2xl font-black text-[#FF8400]">
                                ฿{Number(tour.price).toLocaleString()}
                              </div>
                            </div>
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F6F1E9] group-hover:bg-[#FF8400] text-[#4F200D] group-hover:text-white transition-all">
                              <svg
                                width="24"
                                height="24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 5v14M5 12h14"></path>
                              </svg>
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
