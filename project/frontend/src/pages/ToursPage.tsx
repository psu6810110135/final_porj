import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Import logo
import logoImage from "../assets/logo.png";

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

// SVG ICON Components
const UserIcon = ({ className = "" }: { className?: string }) => (
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
    <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
    <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const ShoppingCartIcon = ({ className = "" }: { className?: string }) => (
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
    <path d="M6 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M17 17h-11v-14h-2" />
    <path d="M6 5l14 1l-1 7h-13" />
  </svg>
);

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Force backend base to port 3000 to avoid wrong env
  const apiBase = "http://localhost:3000/api/v1";

  const regionFilter = searchParams.get("region") || "";
  const categoryFilter = searchParams.get("category") || "";
  const durationFilter = searchParams.get("duration") || "";

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (regionFilter) params.append("region", regionFilter);
    if (categoryFilter) params.append("category", categoryFilter);
    if (durationFilter) params.append("duration", durationFilter);

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
  }, [apiBase, regionFilter, categoryFilter, durationFilter]);

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
    <div className="min-h-screen bg-[#F6F1E9]">
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 md:px-8">
          <div className="flex items-center h-16 md:h-24">
            <div className="flex-1 flex items-center gap-4">
              <Link to="/" className="flex items-center gap-4">
                <div className="relative h-10 md:h-16">
                  <img
                    src={logoImage}
                    alt="Thai Tours Logo"
                    className="h-full w-auto object-contain"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                </div>
                <span className="text-lg md:text-xl font-bold text-[#4F200D] hidden sm:block">
                  Thai Tours Service
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              <Link
                to="/"
                className="font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors"
              >
                Home
              </Link>

              <Link
                to="/tours"
                className="font-bold text-lg md:text-xl text-[#FF8400]"
              >
                Tours
              </Link>

              <Link
                to="#"
                className="font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors"
              >
                About Us
              </Link>
              <Link
                to="#"
                className="font-extralight text-base md:text-lg text-[#4F200D] hover:text-[#FF8400] transition-colors"
              >
                Contact
              </Link>
            </div>

            <div className="flex-1 flex items-center justify-end gap-3">
              <Button className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-[#FF8400]/90 flex items-center justify-center p-0">
                <ShoppingCartIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
              </Button>
              <Button className="w-10 h-10 md:w-12 md:h-12 rounded-full border-3 border-[#F6F1E9] bg-white hover:bg-[#FF8400]/90 flex items-center justify-center p-0">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-[#4F200D]" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

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

          <h1 className="text-4xl font-black text-center mb-8 text-[#4F200D]">
            ทุกจุดหมาย มั่นใจไปกับเรา
          </h1>

          <div className="flex gap-3 max-w-2xl mx-auto mb-12">
            <Input
              type="text"
              placeholder="ค้นหาสถานที่ท่องเที่ยว..."
              className="h-12 rounded-full border-none shadow-sm bg-white px-6 focus-visible:ring-[#FF8400]"
            />
            <Button className="h-12 px-8 rounded-full bg-[#FF8400] hover:bg-[#E67700] text-white font-bold">
              ค้นหา
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
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
                    // 👇👇 จุดสำคัญของคุณ: ใช้ Link ครอบไว้ เพื่อให้คลิกไปหน้า Detail ได้ 👇👇
                    <Link 
                      to={`/tours/${tour.id}`} 
                      key={tour.id}
                      className="block h-full cursor-pointer group"
                    >
                      <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-sm group-hover:shadow-xl transition-all duration-300 bg-white h-full flex flex-col">
                        <div className="relative h-52 shrink-0 overflow-hidden">
                          <img
                            src={
                              tour.image_cover && tour.image_cover.startsWith("http")
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
                            {/* 👇 เปลี่ยนจาก Button เป็น div ธรรมดา เพื่อไม่ให้เกิด Error HTML ซ้อนทับกัน 👇 */}
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F6F1E9] group-hover:bg-[#FF8400] text-[#4F200D] group-hover:text-white transition-all shadow-none group-hover:shadow-md">
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
    </div>
  );
}